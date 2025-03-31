// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { IERC721Receiver } from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ICult } from "./interfaces/ICult.sol";
import { INonfungiblePositionManager } from "./interfaces/INonfungiblePositionManager.sol";
import { IUniswapV3Pool } from "./interfaces/IUniswapV3Pool.sol";
import { ISwapRouter } from "./interfaces/ISwapRouter.sol";
import { ICultRewards } from "./interfaces/ICultRewards.sol";
import { IWETH } from "./interfaces/IWETH.sol";
import { BondingCurve } from "./BondingCurve.sol";

/**
 * @title Cult
 * @dev Implementation of the Cult token with bonding curve and Uniswap V3 pool functionalities.
 */
contract Cult is ICult, Initializable, ERC20Upgradeable, ReentrancyGuardUpgradeable, IERC721Receiver {
    /// ==================== Constants ==================== ///
    /// @notice Maximum total supply of the Cult token (10B tokens)
    uint256 public constant MAX_TOTAL_SUPPLY = 10_000_000_000e18;
    /// @notice Supply allocated for the primary market (5B tokens = 50% of MAX_TOTAL_SUPPLY)
    uint256 internal constant PRIMARY_MARKET_SUPPLY = 5_000_000_000e18;
    /// @notice Supply airdropped when token got deployed
    uint256 public AIRDROPPED_SUPPLY;
    /// @notice Supply allocated for the secondary market (Max - (total_supply))
    uint256 public SECONDARY_MARKET_SUPPLY;
    /// @notice Total fee in basis points (bps) 1%
    uint256 public constant TOTAL_FEE_BPS = 100;
    /// @notice Fee percentage for the token creator, as a portion of TOTAL_FEE_BPS (25% = 2500)
    uint256 public constant TOKEN_CREATOR_FEE_BPS = 2500;
    /// @notice Fee percentage for the protocol, as a portion of TOTAL_FEE_BPS (50% = 5000)
    uint256 public constant PROTOCOL_FEE_BPS = 5000;
    /// @notice Fee percentage for the order referrer, as a portion of TOTAL_FEE_BPS (25% = 2500)
    uint256 public constant ORDER_REFERRER_FEE_BPS = 2500;
    /// @notice Minimum order size in ETH.
    uint256 public constant MIN_ORDER_SIZE = 0.0000001 ether;
    /// @notice Initial square root price for the WETH token in the Uniswap V3 pool.
    uint160 internal constant POOL_SQRT_PRICE_X96_WETH_0 = 400950665883918763141200546267337;
    /// @notice Initial square root price for the Cult token in the Uniswap V3 pool.
    uint160 internal constant POOL_SQRT_PRICE_X96_TOKEN_0 = 15655546353934715619853339;
    /// @notice Liquidity provider fee in basis points for the Uniswap V3 pool.
    uint24 internal constant LP_FEE = 10000;
    /// @notice Lower tick boundary for the Uniswap V3 pool.
    int24 internal constant LP_TICK_LOWER = -887200;
    /// @notice Upper tick boundary for the Uniswap V3 pool.
    int24 internal constant LP_TICK_UPPER = 887200;
    /// @notice Secondary rewards basis points for the token creator, as a portion of LP_FEE (25% = 2500), rest goes to protocol.
    uint256 internal constant TOKEN_CREATOR_SECONDARY_REWARDS_BPS = 2500;

    /// ==================== State variables ==================== ///
    /// @notice Address of the WETH token.
    address public immutable WETH;
    /// @notice Address of the Uniswap V3 non-fungible position manager.
    address public immutable nonfungiblePositionManager;
    /// @notice Address of the Uniswap V3 swap router.
    address public immutable swapRouter;
    /// @notice Address to receive protocol fees.
    address public immutable protocolFeeRecipient;
    /// @notice Address of the Cult rewards contract.
    address public immutable cultRewards;

    /// @notice Address of the Uniswap V3 pool.
    address public poolAddress;
    /// @notice Address of the token creator.
    address public tokenCreator;
    /// @notice Token ID for the liquidity position in Uniswap V3.
    uint256 public lpTokenId;
    /// @notice URI for the ERC20 token metadata.
    string public tokenURI;
    /// @notice Merkle root for airdrop verification.
    bytes32[] public merkleRoots;
    /// @notice Bonding curve module for the Cult token.
    BondingCurve public bondingCurve;
    /// @notice Current market type (BONDING_CURVE or UNISWAP_POOL).
    MarketType public marketType;

    // Flag to identify operation type
    bool private _isBuySellAirdropOperation;

    /// ==================== Constructor ==================== ///
    /// @notice Constructor to set immutable addresses.
    /// @param _protocolFeeRecipient Address to receive protocol fees.
    /// @param _cultRewards Address of the Cult rewards contract.
    /// @param _weth Address of the WETH token.
    /// @param _nonfungiblePositionManager Address of the Uniswap V3 position manager.
    /// @param _swapRouter Address of the Uniswap V3 swap router.
    constructor(
        address _protocolFeeRecipient,
        address _cultRewards,
        address _weth,
        address _nonfungiblePositionManager,
        address _swapRouter
    ) {
        if (_protocolFeeRecipient == address(0)) revert AddressZero();
        if (_cultRewards == address(0)) revert AddressZero();
        if (_weth == address(0)) revert AddressZero();
        if (_nonfungiblePositionManager == address(0)) revert AddressZero();
        if (_swapRouter == address(0)) revert AddressZero();

        protocolFeeRecipient = _protocolFeeRecipient;
        cultRewards = _cultRewards;
        WETH = _weth;
        nonfungiblePositionManager = _nonfungiblePositionManager;
        swapRouter = _swapRouter;
    }

    /// ==================== Initializer ==================== ///
    /// @notice Initializes a new Cult token.
    /// @param _tokenCreator The address of the token creator.
    /// @param _bondingCurve The address of the bonding curve module.
    /// @param _tokenURI The ERC20 token URI.
    /// @param _name The token name.
    /// @param _symbol The token symbol.
    /// @param _merkleRoots The merkle roots for airdrop verification.
    /// @param airdropAmount The amount of tokens to airdrop.
    /// @param airdropContract The address of the airdrop contract.
    function initialize(
        address _tokenCreator,
        address _bondingCurve,
        string memory _tokenURI,
        string memory _name,
        string memory _symbol,
        bytes32[] calldata _merkleRoots,
        uint256 airdropAmount,
        address airdropContract
    ) public payable initializer {
        // Set the merkle roots
        merkleRoots = _merkleRoots;

        // Validate the creation parameters
        if (_tokenCreator == address(0)) revert AddressZero();
        if (_bondingCurve == address(0)) revert AddressZero();

        // Initialize base contract state
        __ERC20_init(_name, _symbol);
        __ReentrancyGuard_init();

        // Initialize token and market state
        marketType = MarketType.BONDING_CURVE;
        tokenCreator = _tokenCreator;
        tokenURI = _tokenURI;
        bondingCurve = BondingCurve(_bondingCurve);

        // Determine the token0, token1, and sqrtPriceX96 values for the Uniswap V3 pool
        address token0 = WETH < address(this) ? WETH : address(this);
        address token1 = WETH < address(this) ? address(this) : WETH;
        uint160 sqrtPriceX96 = token0 == WETH ? POOL_SQRT_PRICE_X96_WETH_0 : POOL_SQRT_PRICE_X96_TOKEN_0;

        //Minting to airdrop contract, similar to buy operation
        //_mint(airdropContract, airdropAmount);
        _buyMint(airdropContract, airdropAmount);
        AIRDROPPED_SUPPLY = airdropAmount; 
        // Create and initialize the Uniswap V3 pool
        poolAddress = INonfungiblePositionManager(nonfungiblePositionManager).createAndInitializePoolIfNecessary(
            token0,
            token1,
            LP_FEE,
            sqrtPriceX96
        );

        // Execute the initial buy order if any ETH was sent
        if (msg.value > 0) {
            buy(_tokenCreator, _tokenCreator, address(0), "", MarketType.BONDING_CURVE, 0, 0);
        }
    }

    /// ==================== Public Functions ==================== ///
    /// @notice Purchases tokens using ETH, either from the bonding curve or Uniswap V3 pool.
    /// @param recipient The address to receive the purchased tokens.
    /// @param refundRecipient The address to receive any excess ETH.
    /// @param orderReferrer The address of the order referrer.
    /// @param comment A comment associated with the buy order.
    /// @param expectedMarketType The expected market type (0 = BONDING_CURVE, 1 = UNISWAP_POOL).
    /// @param minOrderSize The minimum tokens to prevent slippage.
    /// @param sqrtPriceLimitX96 The price limit for Uniswap V3 pool swaps, ignored if market is bonding curve.
    /// @return The number of tokens purchased.
    function buy(
        address recipient,
        address refundRecipient,
        address orderReferrer,
        string memory comment,
        MarketType expectedMarketType,
        uint256 minOrderSize,
        uint160 sqrtPriceLimitX96
    ) public payable nonReentrant returns (uint256) {
        // Ensure the market type is expected
        if (marketType != expectedMarketType) revert InvalidMarketType();

        // Ensure the order size is greater than the minimum order size
        if (msg.value < MIN_ORDER_SIZE) revert EthAmountTooSmall();

        // Ensure the recipient is not the zero address
        if (recipient == address(0)) revert AddressZero();

        // Initialize variables to store the total cost, true order size, fee, and refund if applicable
        uint256 totalCost;
        uint256 trueOrderSize;
        uint256 fee;
        uint256 refund;

        if (marketType == MarketType.UNISWAP_POOL) {
            // Calculate the fee
            fee = _calculateFee(msg.value, TOTAL_FEE_BPS);

            // Calculate the remaining ETH
            totalCost = msg.value - fee;

            // Handle the fees
            _disperseFees(fee, orderReferrer);

            // Convert the ETH to WETH and approve the swap router
            IWETH(WETH).deposit{ value: totalCost }();
            IWETH(WETH).approve(swapRouter, totalCost);

            // Set up the swap parameters
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: WETH,
                tokenOut: address(this),
                fee: LP_FEE,
                recipient: recipient,
                amountIn: totalCost,
                amountOutMinimum: minOrderSize,
                sqrtPriceLimitX96: sqrtPriceLimitX96
            });

            // Execute the swap
            trueOrderSize = ISwapRouter(swapRouter).exactInputSingle(params);

            // Handle any secondary rewards
            _handleSecondaryRewards();
        }

        if (marketType == MarketType.BONDING_CURVE) {
            // Used to determine if the market should graduate
            bool shouldGraduateMarket;

            // Validate the order data
            (totalCost, trueOrderSize, fee, refund, shouldGraduateMarket) = _validateBondingCurveBuy(minOrderSize);

            // Mint the tokens to the recipient
//            _mint(recipient, trueOrderSize);
            _buyMint(recipient, trueOrderSize);

            // Handle the fees
            _disperseFees(fee, orderReferrer);

            // Refund any excess ETH
            if (refund > 0) {
                (bool success, ) = refundRecipient.call{ value: refund }("");
                if (!success) revert EthTransferFailed();
            }

            // Start the market if this is the final bonding market buy order.
            if (shouldGraduateMarket) {
                _graduateMarket();
            }
        }

        emit CultTokenBuy(
            msg.sender,
            recipient,
            orderReferrer,
            msg.value,
            fee,
            totalCost,
            trueOrderSize,
            balanceOf(recipient),
            comment,
            totalSupply(),
            marketType
        );

        return trueOrderSize;
    }

    /// @notice The number of tokens that can be bought from a given amount of ETH.
    ///         This will revert if the market has graduated to the Uniswap V3 pool.
    /// @param ethOrderSize The amount of ETH to use for the purchase.
    /// @return The number of tokens that can be bought.
    function getEthBuyQuote(uint256 ethOrderSize) public view returns (uint256) {
        if (marketType == MarketType.UNISWAP_POOL) {
            revert MarketAlreadyGraduated();
        }

        return bondingCurve.getEthBuyQuote(totalSupply(), ethOrderSize);
    }

    /// @notice The number of tokens for selling a given amount of ETH.
    ///         This will revert if the market has graduated to the Uniswap V3 pool.
    /// @param ethOrderSize The amount of ETH to sell.
    /// @return The number of tokens that can be sold.
    function getEthSellQuote(uint256 ethOrderSize) public view returns (uint256) {
        if (marketType == MarketType.UNISWAP_POOL) {
            revert MarketAlreadyGraduated();
        }

        return bondingCurve.getEthSellQuote(totalSupply(), ethOrderSize);
    }

    /// @notice The amount of ETH needed to buy a given number of tokens.
    ///         This will revert if the market has graduated to the Uniswap V3 pool.
    /// @param tokenOrderSize The number of tokens to buy.
    /// @return The amount of ETH needed.
    function getTokenBuyQuote(uint256 tokenOrderSize) public view returns (uint256) {
        if (marketType == MarketType.UNISWAP_POOL) {
            revert MarketAlreadyGraduated();
        }

        return bondingCurve.getTokenBuyQuote(totalSupply(), tokenOrderSize);
    }

    /// @notice The amount of ETH that can be received for selling a given number of tokens.
    ///         This will revert if the market has graduated to the Uniswap V3 pool.
    /// @param tokenOrderSize The number of tokens to sell.
    /// @return The amount of ETH that can be received.
    function getTokenSellQuote(uint256 tokenOrderSize) public view returns (uint256) {
        if (marketType == MarketType.UNISWAP_POOL) {
            revert MarketAlreadyGraduated();
        }

        return bondingCurve.getTokenSellQuote(totalSupply(), tokenOrderSize);
    }

    /// @notice Transfers tokens to a specified address.
    /// @param to The address to transfer to.
    /// @param value The amount to be transferred.
    /// @return A boolean indicating success.
    function transfer(address to, uint256 value) public override(ERC20Upgradeable) returns (bool) {
        return super.transfer(to, value); // Calls the ERC20 transfer
    }

    /// @notice The current exchange rate of the token if the market has not graduated.
    ///         This will revert if the market has graduated to the Uniswap V3 pool.
    /// @return The current exchange rate.
    function currentExchangeRate() public view returns (uint256) {
        if (marketType == MarketType.UNISWAP_POOL) {
            revert MarketAlreadyGraduated();
        }

        uint256 remainingTokenLiquidity = balanceOf(address(this));
        uint256 ethBalance = address(this).balance;

        if (ethBalance < 0.01 ether) {
            ethBalance = 0.01 ether;
        }

        return (remainingTokenLiquidity * 1e18) / ethBalance;
    }

    /// ==================== External Functions ==================== ///
    /// @notice Sells tokens for ETH, either to the bonding curve or Uniswap V3 pool.
    /// @param tokensToSell The number of tokens to sell.
    /// @param recipient The address to receive the ETH payout.
    /// @param orderReferrer The address of the order referrer.
    /// @param comment A comment associated with the sell order.
    /// @param expectedMarketType The expected market type (0 = BONDING_CURVE, 1 = UNISWAP_POOL).
    /// @param minPayoutSize The minimum ETH payout to prevent slippage.
    /// @param sqrtPriceLimitX96 The price limit for Uniswap V3 pool swaps, ignored if market is bonding curve.
    /// @return The amount of ETH received.
    function sell(
        uint256 tokensToSell,
        address recipient,
        address orderReferrer,
        string memory comment,
        MarketType expectedMarketType,
        uint256 minPayoutSize,
        uint160 sqrtPriceLimitX96
    ) external nonReentrant returns (uint256) {
        // Ensure the market type is expected
        if (marketType != expectedMarketType) revert InvalidMarketType();

        // Ensure the sender has enough liquidity to sell
        if (tokensToSell > balanceOf(msg.sender)) {
            revert InsufficientLiquidity();
        }

        // Ensure the recipient is not the zero address
        if (recipient == address(0)) revert AddressZero();

        // Initialize the true payout size
        uint256 truePayoutSize;

        if (marketType == MarketType.UNISWAP_POOL) {
            truePayoutSize = _handleUniswapSell(tokensToSell, minPayoutSize, sqrtPriceLimitX96);
        }

        if (marketType == MarketType.BONDING_CURVE) {
            truePayoutSize = _handleBondingCurveSell(tokensToSell, minPayoutSize);
        }

        // Calculate the fee
        uint256 fee = _calculateFee(truePayoutSize, TOTAL_FEE_BPS);

        // Calculate the payout after the fee
        uint256 payoutAfterFee = truePayoutSize - fee;

        // Handle the fees
        _disperseFees(fee, orderReferrer);

        // Send the payout to the recipient
        (bool success, ) = recipient.call{ value: payoutAfterFee }("");
        if (!success) revert EthTransferFailed();

        // Handle any secondary rewards
        if (marketType == MarketType.UNISWAP_POOL) {
            _handleSecondaryRewards();
        }

        emit CultTokenSell(
            msg.sender,
            recipient,
            orderReferrer,
            truePayoutSize,
            fee,
            payoutAfterFee,
            tokensToSell,
            balanceOf(recipient),
            comment,
            totalSupply(),
            marketType
        );

        return truePayoutSize;
    }

    /// @notice Burns tokens after the market has graduated to Uniswap V3.
    /// @param tokensToBurn The number of tokens to burn.
    function burn(uint256 tokensToBurn) external {
        if (marketType == MarketType.BONDING_CURVE) revert MarketNotGraduated();

        _burn(msg.sender, tokensToBurn);
    }

    

    /// @notice Force claim any accrued secondary rewards from the market's liquidity position.
    /// @param pushEthRewards Whether to push the ETH directly to the recipients.
    function claimSecondaryRewards(bool pushEthRewards) external {
        SecondaryRewards memory rewards = _handleSecondaryRewards();

        if (rewards.totalAmountEth > 0 && pushEthRewards) {
            ICultRewards(cultRewards).withdrawFor(tokenCreator, rewards.creatorAmountEth);
            ICultRewards(cultRewards).withdrawFor(protocolFeeRecipient, rewards.protocolAmountEth);
        }
    }

    /// @notice Returns current market type and address.
    /// @return The current market state.
    function state() external view returns (MarketState memory) {
        return
            MarketState({
                marketType: marketType,
                marketAddress: marketType == MarketType.BONDING_CURVE ? address(this) : poolAddress
            });
    }

    /// @notice Receives ETH and executes a buy order.
    receive() external payable {
        if (msg.sender == WETH) {
            return;
        }

        buy(msg.sender, msg.sender, address(0), "", marketType, 0, 0);
    }

    /// @dev For receiving the Uniswap V3 LP NFT on market graduation.
    /// @return The selector to confirm the token transfer.
    function onERC721Received(address, address, uint256, bytes calldata) external view returns (bytes4) {
        if (msg.sender != poolAddress) revert OnlyPool();

        return this.onERC721Received.selector;
    }

    /// @dev No-op to allow a swap on the pool to set the correct initial price, if needed.
    /// @param amount0Delta The change in token0 balance of the pool.
    /// @param amount1Delta The change in token1 balance of the pool.
    /// @param data Additional data with no specified format.
    function uniswapV3SwapCallback(int256 amount0Delta, int256 amount1Delta, bytes calldata data) external {}

    /// ==================== Private Functions ==================== ///
    /// @dev Handles a bonding curve sell order.
    /// @param tokensToSell The number of tokens to sell.
    /// @param minPayoutSize The minimum ETH payout to prevent slippage.
    /// @return The amount of ETH received.
    function _handleBondingCurveSell(uint256 tokensToSell, uint256 minPayoutSize) private returns (uint256) {
        // Get quote for the number of ETH that can be received for the number of tokens to sell
        uint256 payout = bondingCurve.getTokenSellQuote(totalSupply(), tokensToSell);

        // Ensure the payout is greater than the minimum payout size
        if (payout < minPayoutSize) revert SlippageBoundsExceeded();

        // Ensure the payout is greater than the minimum order size
        if (payout < MIN_ORDER_SIZE) revert EthAmountTooSmall();

        // Burn the tokens from the seller
        _sellBurn(msg.sender, tokensToSell);
        //_burn(msg.sender, tokensToSell);

        return payout;
    }

function _buyMint(address account, uint256 amount) internal {
    _isBuySellAirdropOperation = true;
    _mint(account, amount);
    
    _isBuySellAirdropOperation = false;
}

function _sellBurn(address account, uint256 amount) internal {
    _isBuySellAirdropOperation = true;
    _burn(account, amount);
    
    _isBuySellAirdropOperation = false;
}

    /// @dev Handles a Uniswap V3 sell order.
    /// @param tokensToSell The number of tokens to sell.
    /// @param minPayoutSize The minimum ETH payout to prevent slippage.
    /// @param sqrtPriceLimitX96 The price limit for Uniswap V3 pool swaps.
    /// @return The amount of ETH received.
    function _handleUniswapSell(
        uint256 tokensToSell,
        uint256 minPayoutSize,
        uint160 sqrtPriceLimitX96
    ) private returns (uint256) {
        // Transfer the tokens from the seller to this contract
        transfer(address(this), tokensToSell);

        // Approve the swap router to spend the tokens
        this.approve(swapRouter, tokensToSell);

        // Set up the swap parameters
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: address(this),
            tokenOut: WETH,
            fee: LP_FEE,
            recipient: address(this),
            amountIn: tokensToSell,
            amountOutMinimum: minPayoutSize,
            sqrtPriceLimitX96: sqrtPriceLimitX96
        });

        // Execute the swap
        uint256 payout = ISwapRouter(swapRouter).exactInputSingle(params);

        // Withdraw the ETH from the contract
        IWETH(WETH).withdraw(payout);

        return payout;
    }

    /// ==================== Internal Functions ==================== ///

        // Define the ERC20 storage location using the same slot as ERC20Upgradeable
    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.ERC20")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ERC20_STORAGE_LOCATION = 0x52c63247e1f47db19d5ce0460030c497f067ca4cebf71ba98eeadabe20bace00;


    function _getERC20StorageInternal() private pure returns (ERC20Upgradeable.ERC20Storage storage $) {
        assembly {
            $.slot := ERC20_STORAGE_LOCATION
        }
    }

    /// @dev Overrides ERC20's _update function to
    ///      - Prevent transfers to the pool if the market has not graduated.
    ///      - Emit the superset `CultTokenTransfer` event with each ERC20 transfer.
    /// @param from The address from which tokens are transferred.
    /// @param to The address to which tokens are transferred.
    /// @param value The amount of tokens transferred.
    // function _update(address from, address to, uint256 value) internal virtual override {
    //     if (marketType == MarketType.BONDING_CURVE && to == poolAddress) {
    //         revert MarketNotGraduated();
    //     }

    //     super._update(from, to, value);

    //     emit CultTokenTransfer(from, to, value, balanceOf(from), balanceOf(to), totalSupply());
    // }


    function _update(address from, address to, uint256 value) internal virtual override {
        
        if (marketType == MarketType.BONDING_CURVE && to == poolAddress) {
            revert MarketNotGraduated();
        }

        ERC20Storage storage $ = _getERC20StorageInternal();
        
        // Update balances logic - copied from original _update
        if (from == address(0)) {
            $._totalSupply += value;
        } else {
            uint256 fromBalance = $._balances[from];
            if (fromBalance < value) {
                revert ERC20InsufficientBalance(from, fromBalance, value);
            }
            unchecked {
                $._balances[from] = fromBalance - value;
            }
        }

        if (to == address(0)) {
            unchecked {
                $._totalSupply -= value;
            }
        } else {
            unchecked {
                $._balances[to] += value;
            }
        }

        // Only emit Transfer event if it's not a buy/sell operation and we listen to this for our DB
        if (!_isBuySellAirdropOperation) {
            emit CultTokenTransfer(from, to, value, balanceOf(from), balanceOf(to), totalSupply());
        }
        //emit normal transfer everytime so other indexers can also listed
         emit Transfer(from, to, value);
}

    /// @dev Validates a bonding curve buy order and if necessary, recalculates the order data if the size is greater than the remaining supply.
    /// @param minOrderSize The minimum tokens to prevent slippage.
    /// @return totalCost The total cost of the order.
    /// @return trueOrderSize The true size of the order.
    /// @return fee The fee for the order.
    /// @return refund The refund amount if applicable.
    /// @return startMarket Whether the market should start.
    function _validateBondingCurveBuy(
        uint256 minOrderSize
    ) internal returns (uint256 totalCost, uint256 trueOrderSize, uint256 fee, uint256 refund, bool startMarket) {
        // Set the total cost to the amount of ETH sent
        totalCost = msg.value;

        // Calculate the fee
        fee = _calculateFee(totalCost, TOTAL_FEE_BPS);

        // Calculate the amount of ETH remaining for the order
        uint256 remainingEth = totalCost - fee;

        // Get quote for the number of tokens that can be bought with the amount of ETH remaining
        trueOrderSize = bondingCurve.getEthBuyQuote(totalSupply(), remainingEth);

        // Ensure the order size is greater than the minimum order size
        if (trueOrderSize < minOrderSize) revert SlippageBoundsExceeded();

        // Calculate the maximum number of tokens that can be bought
        uint256 maxRemainingTokens = PRIMARY_MARKET_SUPPLY - (totalSupply() - AIRDROPPED_SUPPLY);

        // Start the market if the order size equals the number of remaining tokens
        if (trueOrderSize == maxRemainingTokens) {
            startMarket = true;
        }

        // If the order size is greater than the maximum number of remaining tokens:
        if (trueOrderSize > maxRemainingTokens) {
            // Reset the order size to the number of remaining tokens
            trueOrderSize = maxRemainingTokens;

            // Calculate the amount of ETH needed to buy the remaining tokens
            uint256 ethNeeded = bondingCurve.getTokenBuyQuote(totalSupply(), trueOrderSize);

            // Recalculate the fee with the updated order size
            fee = _calculateFee(ethNeeded, TOTAL_FEE_BPS);

            // Recalculate the total cost with the updated order size and fee
            totalCost = ethNeeded + fee;

            // Refund any excess ETH
            if (msg.value > totalCost) {
                refund = msg.value - totalCost;
            }

            startMarket = true;
        }
    }

    /// @dev Graduates the market to a Uniswap V3 pool.
    function _graduateMarket() internal {
        // Update the market type
        marketType = MarketType.UNISWAP_POOL;

        // Convert the bonding curve's accumulated ETH to WETH
        uint256 ethLiquidity = address(this).balance;
        IWETH(WETH).deposit{ value: ethLiquidity }();
        SECONDARY_MARKET_SUPPLY = MAX_TOTAL_SUPPLY - totalSupply();
        // Mint the secondary market supply to this contract
        _mint(address(this), SECONDARY_MARKET_SUPPLY);

        // Approve the nonfungible position manager to transfer the WETH and tokens
        SafeERC20.safeIncreaseAllowance(IERC20(WETH), address(nonfungiblePositionManager), ethLiquidity);
        SafeERC20.safeIncreaseAllowance(this, address(nonfungiblePositionManager), SECONDARY_MARKET_SUPPLY);

        // Determine the token order
        bool isWethToken0 = address(WETH) < address(this);
        address token0 = isWethToken0 ? WETH : address(this);
        address token1 = isWethToken0 ? address(this) : WETH;
        uint256 amount0 = isWethToken0 ? ethLiquidity : SECONDARY_MARKET_SUPPLY;
        uint256 amount1 = isWethToken0 ? SECONDARY_MARKET_SUPPLY : ethLiquidity;

        // Get the current and desired price of the pool
        uint160 currentSqrtPriceX96 = IUniswapV3Pool(poolAddress).slot0().sqrtPriceX96;
        uint160 desiredSqrtPriceX96 = isWethToken0 ? POOL_SQRT_PRICE_X96_WETH_0 : POOL_SQRT_PRICE_X96_TOKEN_0;

        // If the current price is not the desired price, set the desired price
        if (currentSqrtPriceX96 != desiredSqrtPriceX96) {
            bool swap0To1 = currentSqrtPriceX96 > desiredSqrtPriceX96;
            IUniswapV3Pool(poolAddress).swap(address(this), swap0To1, 100, desiredSqrtPriceX96, "");
        }

        // Set up the liquidity position mint parameters
        INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager.MintParams({
            token0: token0,
            token1: token1,
            fee: LP_FEE,
            tickLower: LP_TICK_LOWER,
            tickUpper: LP_TICK_UPPER,
            amount0Desired: amount0,
            amount1Desired: amount1,
            amount0Min: 0,
            amount1Min: 0,
            recipient: address(this),
            deadline: block.timestamp
        });

        // Mint the liquidity position to this contract and store the token id.
        (lpTokenId, , , ) = INonfungiblePositionManager(nonfungiblePositionManager).mint(params);

        emit CultMarketGraduated(
            address(this),
            poolAddress,
            ethLiquidity,
            SECONDARY_MARKET_SUPPLY,
            lpTokenId,
            marketType
        );
    }

    /// @dev Handles calculating and depositing fees to an escrow protocol rewards contract.
    /// @param _fee The total fee amount.
    /// @param _orderReferrer The address of the order referrer.
    function _disperseFees(uint256 _fee, address _orderReferrer) internal {
        if (_orderReferrer == address(0)) {
            _orderReferrer = protocolFeeRecipient;
        }

        uint256 tokenCreatorFee = _calculateFee(_fee, TOKEN_CREATOR_FEE_BPS);
        uint256 orderReferrerFee = _calculateFee(_fee, ORDER_REFERRER_FEE_BPS);
        uint256 protocolFee = _calculateFee(_fee, PROTOCOL_FEE_BPS);
        uint256 totalFee = tokenCreatorFee + orderReferrerFee + protocolFee;

        address[] memory recipients = new address[](3);
        uint256[] memory amounts = new uint256[](3);
        bytes4[] memory reasons = new bytes4[](3);

        recipients[0] = tokenCreator;
        amounts[0] = tokenCreatorFee;
        reasons[0] = bytes4(keccak256("CULT_CREATOR_FEE"));

        recipients[1] = _orderReferrer;
        amounts[1] = orderReferrerFee;
        reasons[1] = bytes4(keccak256("CULT_ORDER_REFERRER_FEE"));

        recipients[2] = protocolFeeRecipient;
        amounts[2] = protocolFee;
        reasons[2] = bytes4(keccak256("CULT_PROTOCOL_FEE"));

        ICultRewards(cultRewards).depositBatch{ value: totalFee }(recipients, amounts, reasons, "");

        emit CultTokenFees(
            tokenCreator,
            _orderReferrer,
            protocolFeeRecipient,
            tokenCreatorFee,
            orderReferrerFee,
            protocolFee
        );
    }

    /// @dev Handles secondary rewards distribution.
    /// @return rewards The secondary rewards distributed.
    function _handleSecondaryRewards() internal returns (SecondaryRewards memory) {
        if (marketType == MarketType.BONDING_CURVE) revert MarketNotGraduated();

        INonfungiblePositionManager.CollectParams memory params = INonfungiblePositionManager.CollectParams({
            tokenId: lpTokenId,
            recipient: address(this),
            amount0Max: type(uint128).max,
            amount1Max: type(uint128).max
        });

        (uint256 totalAmountToken0, uint256 totalAmountToken1) = INonfungiblePositionManager(nonfungiblePositionManager)
            .collect(params);

        address token0 = WETH < address(this) ? WETH : address(this);
        address token1 = WETH < address(this) ? address(this) : WETH;

        SecondaryRewards memory rewards;

        rewards = _transferRewards(token0, totalAmountToken0, rewards);
        rewards = _transferRewards(token1, totalAmountToken1, rewards);

        emit CultTokenSecondaryRewards(rewards);

        return rewards;
    }

    /// @dev Transfers rewards to the appropriate recipients.
    /// @param token The token address.
    /// @param totalAmount The total amount of rewards.
    /// @param rewards The rewards structure to update.
    /// @return The updated rewards structure.
    function _transferRewards(
        address token,
        uint256 totalAmount,
        SecondaryRewards memory rewards
    ) internal returns (SecondaryRewards memory) {
        if (totalAmount > 0) {
            if (token == WETH) {
                IWETH(WETH).withdraw(totalAmount);

                rewards.totalAmountEth = totalAmount;
                rewards.creatorAmountEth = _calculateFee(totalAmount, TOKEN_CREATOR_SECONDARY_REWARDS_BPS);
                rewards.protocolAmountEth = rewards.totalAmountEth - rewards.creatorAmountEth;

                address[] memory recipients = new address[](2);
                recipients[0] = tokenCreator;
                recipients[1] = protocolFeeRecipient;

                uint256[] memory amounts = new uint256[](2);
                amounts[0] = rewards.creatorAmountEth;
                amounts[1] = rewards.protocolAmountEth;

                bytes4[] memory reasons = new bytes4[](3);
                reasons[0] = bytes4(keccak256("CULT_CREATOR_SECONDARY_REWARD"));
                reasons[1] = bytes4(keccak256("COOP_PROTOCOL_SECONDARY_REWARD"));

                ICultRewards(cultRewards).depositBatch{ value: totalAmount }(recipients, amounts, reasons, "");
            } else {
                rewards.totalAmountToken = totalAmount;
                rewards.creatorAmountToken = _calculateFee(totalAmount, TOKEN_CREATOR_SECONDARY_REWARDS_BPS);
                rewards.protocolAmountToken = rewards.totalAmountToken - rewards.creatorAmountToken;

                _transfer(address(this), tokenCreator, rewards.creatorAmountToken);
                _transfer(address(this), protocolFeeRecipient, rewards.protocolAmountToken);
            }
        }

        return rewards;
    }

    /// @dev Calculates the fee for a given amount and basis points.
    /// @param amount The amount to calculate the fee from.
    /// @param bps The basis points for the fee calculation.
    /// @return The calculated fee.
    function _calculateFee(uint256 amount, uint256 bps) internal pure returns (uint256) {
        return (amount * bps) / 10_000;
    }

}
