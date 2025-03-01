// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/// @title CultFactory
/// @notice This contract is a factory for creating instances of ERC1967Proxy.
/// @dev Inherits from ERC1967Proxy to utilize its proxy functionality.
/// @dev - No need for this extra contract as we can use the ERC1967Proxy directly through the hardhat-deploy plugin
contract CultFactoryProxy is ERC1967Proxy {
    /// ==================== Constructor ==================== ///
    /// @notice Constructor for deploying a new CultFactory instance.
    /// @param _logic The address of the logic contract to be used by the proxy.
    /// @param _data The data to be passed to the logic contract during initialization.
    constructor(
        address _logic,
        bytes memory _data
    ) ERC1967Proxy(_logic, _data) {}
}
