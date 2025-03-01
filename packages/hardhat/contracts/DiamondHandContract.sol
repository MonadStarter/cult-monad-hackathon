// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @title Diamond Hand Contract
/// @notice This contract allows users to lock their tokens for a specified duration and earn rewards.
/// @dev Inherits from ReentrancyGuardUpgradeable.
contract DiamondHandContract is Initializable, ReentrancyGuardUpgradeable {
    /// ==================== State Variables ==================== ///
    /// @notice The address of the ERC20 token that can be locked.
    address public token;

    /// @notice The address of the token creator.
    address public tokenCreator;

    /// @notice The duration for which tokens are locked.
    uint256 public lockDuration;

    /// @notice Mapping of user addresses to the amount of tokens they have locked.
    mapping(address => uint256) public lockedAmounts;

    /// @notice Mapping of user addresses to the timestamp when they locked their tokens.
    mapping(address => uint256) public lockTimestamps;

    /// ==================== Events ==================== ///
    /// @notice Emitted when tokens are locked by a user.
    /// @param user The address of the user who locked the tokens.
    /// @param amount The amount of tokens locked.
    /// @param duration The duration for which the tokens are locked.
    event TokensLocked(address indexed user, uint256 amount, uint256 duration);

    /// @notice Emitted when tokens are unlocked by a user.
    /// @param user The address of the user who unlocked the tokens.
    /// @param amount The amount of tokens unlocked.
    /// @param reward The reward earned by the user for locking the tokens.
    event TokensUnlocked(address indexed user, uint256 amount, uint256 reward);

    /// ==================== Errors ==================== ///
    /// @notice Error thrown when the amount to lock is zero or less.
    error AmountMustBeGreaterThanZero();

    /// @notice Error thrown when a token transfer fails.
    error TransferFailed();

    /// @notice Error thrown when there are no tokens to unlock.
    error NoTokensToUnlock();

    /// @notice Error thrown when tokens are still locked and cannot be unlocked.
    error TokensStillLocked();

    /// ==================== Initializer ==================== ///
    /// @notice Initializes the contract with the token address, owner, and lock duration.
    /// @param _token The address of the ERC20 token.
    /// @param _tokenCreator The address of the token creator.
    /// @param _lockDuration The duration for which tokens will be locked.
    function initialize(
        address _token,
        address _tokenCreator,
        uint256 _lockDuration
    ) external initializer {
        __ReentrancyGuard_init(); // Initialize ReentrancyGuard
        token = _token;
        tokenCreator = _tokenCreator;
        lockDuration = _lockDuration;
    }

    /// ==================== External Functions ==================== ///
    /// @notice Allows a user to lock a specified amount of tokens.
    /// @param amount The amount of tokens to lock.
    function lockTokens(uint256 amount) external nonReentrant {
        if (amount <= 0) {
            revert AmountMustBeGreaterThanZero();
        }
        if (
            !IERC20(token).transferFrom(
                msg.sender,
                address(this),
                amount
            )
        ) {
            revert TransferFailed();
        }

        lockedAmounts[msg.sender] += amount;
        lockTimestamps[msg.sender] = block.timestamp;

        emit TokensLocked(msg.sender, amount, lockDuration);
    }

    /// @notice Allows a user to unlock their tokens and receive rewards if the lock duration has passed.
    function unlockTokens() external nonReentrant {
        uint256 lockedAmount = lockedAmounts[msg.sender];
        if (lockedAmount <= 0) {
            revert NoTokensToUnlock();
        }
        if (block.timestamp < lockTimestamps[msg.sender] + lockDuration) {
            revert TokensStillLocked();
        }

        uint256 reward = calculateReward(lockedAmount);
        lockedAmounts[msg.sender] = 0;

        if (
            !IERC20(token).transfer(msg.sender, lockedAmount + reward)
        ) {
            revert TransferFailed();
        }

        emit TokensUnlocked(msg.sender, lockedAmount, reward);
    }

    /// ==================== Public Functions ==================== ///
    /// @notice Calculates the reward for a given amount of locked tokens.
    /// @param amount The amount of tokens for which to calculate the reward.
    /// @return The calculated reward amount.
    function calculateReward(uint256 amount) public view returns (uint256) {
        uint256 apy = 5; // Let's say 5% annual interest
        uint256 reward = (amount * apy * lockDuration) / (365 days * 100);
        return reward;
    }
}
