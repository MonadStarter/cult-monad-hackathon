// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

/// @title Diamond Hand Contract
/// @notice This contract allows users to lock their tokens for a specified duration and earn rewards.
/// @dev Inherits from UUPSUpgradeable, OwnableUpgradeable, PausableUpgradeable, and ReentrancyGuardUpgradeable.
contract DiamondHandContractUUPS is
    UUPSUpgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    /// ==================== State Variables ==================== ///
    /// @notice The address of the ERC20 token that can be locked.
    address public token;

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
    /// @param _owner The address of the contract owner.
    /// @param _lockDuration The duration for which tokens will be locked.
    function initialize(
        address _token,
        address _owner,
        uint256 _lockDuration
    ) external initializer {
        __Ownable_init(_owner);
        token = _token;
        lockDuration = _lockDuration;
    }

    /// ==================== External Functions ==================== ///
    /// @notice Allows a user to lock a specified amount of tokens.
    /// @param amount The amount of tokens to lock.
    function lockTokens(uint256 amount) external {
        if (amount <= 0) {
            revert AmountMustBeGreaterThanZero();
        }
        if (
            !ERC20Upgradeable(token).transferFrom(
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
    function unlockTokens() external {
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
            !ERC20Upgradeable(token).transfer(msg.sender, lockedAmount + reward)
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

    /// ==================== Internal Functions ==================== ///
    /// @notice Authorizes an upgrade to the contract.
    /// @param newImplementation The address of the new contract implementation.
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
