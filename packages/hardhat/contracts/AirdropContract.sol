//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
/// @title Airdrop Contract
/// @notice This contract facilitates the distribution of tokens via an airdrop mechanism.
/// @dev The contract uses a Merkle tree to verify claims and ensures that each address can claim only once.
contract AirdropContract is Initializable, ReentrancyGuardUpgradeable {
    /// @dev Represents 100% in basis points, where 100% = 1000000
    uint256 public constant BASIS_POINTS = 1000000;

    /// ==================== State variables ==================== ///
    /// @notice The total amount of tokens available for airdrop
    uint256 public totalAirdropAmount;

    /// @notice The token address for this airdrop contract
    address public token;

    /// @notice The address that created the token
    address public tokenCreator;

    /// @notice The merkle root for verifying claims
    bytes32[] public merkleRoots;

    /// @notice Mapping to track if an address has claimed their tokens
    mapping(address => bool) public hasClaimed;

    /// @notice The number of recipients for the airdrop
    uint256 public totalAirdropRecipientCount;

    /// ==================== Events ==================== ///
    event MerkleRootSet(address indexed token, bytes32[] merkleRoots);
    event TokensClaimed(address indexed token, address indexed recipient, uint256 percentage, uint256 amount);
    event AirdropContractInitialized(
        address indexed token,
        address indexed createdBy,
        bytes32[] merkleRoots,
        uint256 amount
    );

    /// ==================== Errors ==================== ///
    error InvalidMerkleProof();
    error AlreadyClaimed();
    error InvalidPercentage();
    error Unauthorized();
    error InvalidParameters();
    error InvalidMerkleRoot();
    error InvalidTotalAmount();
    error InvalidAirdropRecipientCount();

    /// ==================== Initializer ==================== ///
    /// @notice Initializes the airdrop contract with the token address and owner
    /// @param _token The token address associated with this airdrop
    /// @param _tokenCreator The token creator
    /// @param _merkleRoots The merkle roots for verifying claims
    /// @param _totalAmount The total amount of tokens available for airdrop
    /// @param _totalAirdropRecipientCount The number of recipients for the airdrop
    function initialize(
        address _token,
        address _tokenCreator,
        bytes32[] calldata _merkleRoots,
        uint256 _totalAmount,
        uint256 _totalAirdropRecipientCount
    ) external initializer {
        __ReentrancyGuard_init();
        if (_token == address(0) || _tokenCreator == address(0)) revert InvalidParameters();

        if (_totalAmount == 0) revert InvalidTotalAmount();

        merkleRoots = _merkleRoots;
        totalAirdropAmount = _totalAmount;

        emit MerkleRootSet(token, _merkleRoots);

        token = _token;
        tokenCreator = _tokenCreator;
        totalAirdropRecipientCount = _totalAirdropRecipientCount;
        emit AirdropContractInitialized(token, _tokenCreator, _merkleRoots, _totalAmount);
    }

    /// ==================== External Functions ==================== ///
    /// @notice Allows a recipient to claim their tokens
    /// @dev The function is non-reentrant
    /// @param merkleProof The merkle proof verifying the recipient's claim
    function claim(bytes32[] calldata merkleProof) external nonReentrant {
        // Validations
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();
        // if (percentage > BASIS_POINTS) revert InvalidPercentage(); // @note: not needed as we are calculating amount per recipient
        if (totalAirdropRecipientCount == 0) revert InvalidAirdropRecipientCount();
        // Verify the merkle proof
        bytes32 node = keccak256(abi.encodePacked(msg.sender));
        bool validProof = false;
        for (uint256 i = 0; i < merkleRoots.length; i++) {
            if (MerkleProof.verify(merkleProof, merkleRoots[i], node)) {
                validProof = true;
                break; // Exit the loop once a valid proof is found
            }
        }
        if (!validProof) {
            revert InvalidMerkleProof();
        }

        // Calculate actual token amount
        // uint256 amount = (totalAirdropAmount * percentage) / BASIS_POINTS;
        uint256 amount = totalAirdropAmount / totalAirdropRecipientCount;
        uint256 percentage = (amount * BASIS_POINTS) / totalAirdropAmount;

        // Mark as claimed
        hasClaimed[msg.sender] = true;

        // Transfer tokens
        bool success = IERC20(token).transfer(msg.sender, amount);
        require(success, "Token transfer failed");

        emit TokensClaimed(token, msg.sender, percentage, amount);
    }

    /// @notice Checks if an address has a valid claim
    /// @param recipient The recipient address
    /// @param percentage The percentage in basis points
    /// @param merkleProof The proof of inclusion in merkle tree
    /// @return bool True if the claim is valid, false otherwise
    function canClaim(
        address recipient,
        uint256 percentage,
        bytes32[] calldata merkleProof
    ) external view returns (bool) {
        if (hasClaimed[recipient]) return false;
        if (percentage > BASIS_POINTS) return false;

        bytes32 node = keccak256(abi.encodePacked(recipient, percentage));
        for (uint256 i = 0; i < merkleRoots.length; i++) {
            if (MerkleProof.verify(merkleProof, merkleRoots[i], node)) {
                return true;
            }
        }
        return false;
    }
}
