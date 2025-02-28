// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {FixedPointMathLib} from "solady/src/utils/FixedPointMathLib.sol";

/// @title Bonding Curve Contract
/// @notice This contract implements a bonding curve mechanism for token pricing.
/// @dev The contract uses exponential functions to calculate token prices based on supply.
contract BondingCurve {
    using FixedPointMathLib for uint256;
    using FixedPointMathLib for int256;

    // y = A*e^(Bx)

    // y = A * e^(B * x)
    // The formula used for the bonding curve, where:
    // - y is the price of the token
    // - A is a constant that scales the curve
    // - B is a constant that affects the curve's steepness
    // - x is the current supply of tokens

    /// ==================== State variables ==================== ///

    /// @notice The A parameter for the bonding curve equation
    uint256 public immutable A = 600000000000;

    /// @notice The B parameter for the bonding curve equation
    uint256 public immutable B = 693000000000;

    /// ==================== Errors ==================== ///
    error InsufficientLiquidity();

    /// ==================== External Functions ==================== ///

    /// @notice Calculates the number of tokens to sell for a given ETH order size.
    /// @param currentSupply The current supply of tokens.
    /// @param ethOrderSize The size of the ETH order.
    /// @return The number of tokens to sell.
    function getEthSellQuote(
        uint256 currentSupply,
        uint256 ethOrderSize
    ) external pure returns (uint256) {
        uint256 deltaY = ethOrderSize;
        uint256 x0 = currentSupply;
        uint256 exp_b_x0 = uint256((int256(B.mulWad(x0))).expWad());

        uint256 exp_b_x1 = exp_b_x0 - deltaY.fullMulDiv(B, A);
        uint256 x1 = uint256(int256(exp_b_x1).lnWad()).divWad(B);
        uint256 tokensToSell = x0 - x1;

        return tokensToSell;
    }

    /// @notice Calculates the ETH amount received for selling a given number of tokens.
    /// @param currentSupply The current supply of tokens.
    /// @param tokensToSell The number of tokens to sell.
    /// @return The amount of ETH received.
    function getTokenSellQuote(
        uint256 currentSupply,
        uint256 tokensToSell
    ) external pure returns (uint256) {
        if (currentSupply < tokensToSell) revert InsufficientLiquidity();
        uint256 x0 = currentSupply;
        uint256 x1 = x0 - tokensToSell;

        uint256 exp_b_x0 = uint256((int256(B.mulWad(x0))).expWad());
        uint256 exp_b_x1 = uint256((int256(B.mulWad(x1))).expWad());

        // calculate deltaY = (a/b)*(exp(b*x0) - exp(b*x1))
        uint256 deltaY = (exp_b_x0 - exp_b_x1).fullMulDiv(A, B);

        return deltaY;
    }

    /// @notice Calculates the number of tokens to buy for a given ETH order size.
    /// @param currentSupply The current supply of tokens.
    /// @param ethOrderSize The size of the ETH order.
    /// @return The number of tokens to buy.
    function getEthBuyQuote(
        uint256 currentSupply,
        uint256 ethOrderSize
    ) external pure returns (uint256) {
        uint256 x0 = currentSupply;
        uint256 deltaY = ethOrderSize;

        // calculate exp(b*x0)
        uint256 exp_b_x0 = uint256((int256(B.mulWad(x0))).expWad());

        // calculate exp(b*x0) + (dy*b/a)
        uint256 exp_b_x1 = exp_b_x0 + deltaY.fullMulDiv(B, A);

        uint256 deltaX = uint256(int256(exp_b_x1).lnWad()).divWad(B) - x0;

        return deltaX;
    }

    /// @notice Calculates the ETH amount required to buy a given number of tokens.
    /// @param currentSupply The current supply of tokens.
    /// @param tokenOrderSize The number of tokens to buy.
    /// @return The amount of ETH required.
    function getTokenBuyQuote(
        uint256 currentSupply,
        uint256 tokenOrderSize
    ) external pure returns (uint256) {
        uint256 x0 = currentSupply;
        uint256 x1 = tokenOrderSize + currentSupply;

        uint256 exp_b_x0 = uint256((int256(B.mulWad(x0))).expWad());
        uint256 exp_b_x1 = uint256((int256(B.mulWad(x1))).expWad());

        uint256 deltaY = (exp_b_x1 - exp_b_x0).fullMulDiv(A, B);

        return deltaY;
    }
}
