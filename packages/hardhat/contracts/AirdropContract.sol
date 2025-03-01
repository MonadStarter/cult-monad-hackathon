//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
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
    bytes32 public merkleRoot;

    /// @notice Mapping to track if an address has claimed their tokens
    mapping(address => bool) public hasClaimed;

    /// ==================== Events ==================== ///
    event MerkleRootSet(address indexed token, bytes32 merkleRoot);
    event TokensClaimed(
        address indexed token,
        address indexed recipient,
        uint256 percentage,
        uint256 amount
    );
    event AirdropContractInitialized(
        address indexed token,
        address indexed createdBy,
        bytes32 _merkleRoot,
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

    /// ==================== Initializer ==================== ///
    /// @notice Initializes the airdrop contract with the token address and owner
    /// @param _token The token address associated with this airdrop
    /// @param _tokenCreator The token creator
    /// @param _merkleRoot The merkle root for verifying claims
    /// @param _totalAmount The total amount of tokens available for airdrop
    function initialize(
        address _token,
        address _tokenCreator,
        bytes32 _merkleRoot,
        uint256 _totalAmount
    ) external initializer {
        __ReentrancyGuard_init();
        if (_token == address(0) || _tokenCreator == address(0))
            revert InvalidParameters();
        if (_merkleRoot == bytes32(0)) revert InvalidMerkleRoot();
        if (_totalAmount == 0) revert InvalidTotalAmount();

        merkleRoot = _merkleRoot;
        totalAirdropAmount = _totalAmount;

        emit MerkleRootSet(token, _merkleRoot);

        token = _token;
        tokenCreator = _tokenCreator;
        emit AirdropContractInitialized(
            token,
            _tokenCreator,
            _merkleRoot,
            _totalAmount
        );
    }

    /// ==================== External Functions ==================== ///
    /// @notice Allows a recipient to claim their tokens
    /// @dev The function is non-reentrant
    /// @param percentage The percentage of airdrop amount (in basis points)
    /// @param merkleProof The merkle proof verifying the recipient's claim
    function claim(
        uint256 percentage,
        bytes32[] calldata merkleProof
    ) external nonReentrant {
        // Validations
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();
        if (percentage > BASIS_POINTS) revert InvalidPercentage();

        // Verify the merkle proof
        bytes32 node = keccak256(abi.encodePacked(msg.sender, percentage));
        if (!MerkleProof.verify(merkleProof, merkleRoot, node)) {
            revert InvalidMerkleProof();
        }

        // Calculate actual token amount
        uint256 amount = (totalAirdropAmount * percentage) / BASIS_POINTS;

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
        return MerkleProof.verify(merkleProof, merkleRoot, node);
    }
}
