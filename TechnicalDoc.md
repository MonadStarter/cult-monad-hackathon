# CULT - Decentralized Token Platform on Monad

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

CULT is a decentralized token platform built on Monad that enables anyone to create and launch their own token with automatic liquidity, fair airdrops, and dynamic pricing via bonding curves. By leveraging Monad's accelerated EVM, CULT provides a gas-efficient, high-performance token creation experience.

## Table of Contents
- [Overview](#overview)
- [Technical Architecture](#technical-architecture)
  - [Smart Contract Architecture](#smart-contract-architecture)
  - [Contract Interactions](#contract-interactions)
  - [Back-end Services](#back-end-services)
  - [Front-end Implementation](#front-end-implementation)
- [Leveraging Monad's Accelerated EVM](#leveraging-monads-accelerated-evm)
- [Core Functionality](#core-functionality)
  - [Token Creation Process](#token-creation-process)
  - [Dynamic Pricing Mechanism](#dynamic-pricing-mechanism)
  - [Airdrop System](#airdrop-system)
  - [Liquidity Transition](#liquidity-transition)
- [Implementation Details](#implementation-details)
  - [Smart Contract Implementation](#smart-contract-implementation)
  - [IPFS Integration](#ipfs-integration)
  - [Merkle Tree Implementation](#merkle-tree-implementation)
- [Development and Deployment](#development-and-deployment)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Technologies and Dependencies](#technologies-and-dependencies)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

CULT reimagines token creation and distribution on Monad. The platform enables users to create and deploy tokens in minutes, with built-in mechanisms for fair distribution, automatic liquidity, and sustainable tokenomics.

Key features:
- **One-click Token Creation**: Generate and deploy ERC-20 tokens with custom parameters
- **Bonding Curve Economics**: Dynamic pricing model that ensures liquidity and price discovery
- **Reputation System**: Users earn reputation points based on holding and trading activity on the platform. Each user will have a reputation score and probability to get in the diamond hands list.
- **Diamond Hands List**: Top 10,000 users refreshed hourly with airdrops for incentivized holding. Based on reputation score, users have varying probabilities to get onto the list.
- **Airdrops**: Every coin on Cult must airdrop a portion of supply (1-50%). Creators can airdrop to charities, NFT communities, and top holders.
- **Creator Earnings**: Creators earn from LP fees and bonding curves using Uniswap v4, incentivizing them to increase token popularity rather than dumping tokens.
- **Automatic Liquidity**: Seamless transition from bonding curve to DEX liquidity pools
- **Gas-Efficient Design**: Leveraging Monad's accelerated EVM for cost-effective operations

## Technical Architecture

CULT employs a modular architecture consisting of smart contracts deployed on the Monad blockchain, an event-indexing back-end, and a responsive web front-end.

### Smart Contract Architecture

The CULT platform uses a plug-and-play contract architecture for flexibility and upgradeability during the Monad testnet phase.

#### Core Contracts

1. **CULT Factory Contract**
   - Upgradeable proxy contract that serves as the entry point for token deployment
   - Maintains a registry of all deployed tokens and their associated contracts
   - Manages whitelisted Merkle roots for airdrops to prevent system gaming
   - Orchestrates interaction between token contracts, bonding curves, and airdrop mechanisms

   ```solidity
   // Simplified example of the Factory contract
   contract CultFactory is Initializable, UUPSUpgradeable, OwnableUpgradeable {
       mapping(address => TokenData) public deployedTokens;
       mapping(bytes32 => bool) public whitelistedMerkleRoots;
       
       function deployToken(
           string memory name,
           string memory symbol,
           bytes32 airdropMerkleRoot,
           uint256 airdropPercentage,
           string memory tokenURI
       ) external returns (address tokenAddress) {
           // Verify merkle root is whitelisted
           require(whitelistedMerkleRoots[airdropMerkleRoot], "Invalid merkle root");
           
           // Deploy token and associated contracts
           // ...implementation details...
           
           return tokenAddress;
       }
       
       // Additional functions for managing whitelisted roots, upgrades, etc.
   }
   ```

2. **CULT Token Contract**
   - Standard ERC-20 implementation with CULT-specific extensions
   - Handles buying, selling, and transfer operations
   - Manages tax/fee distribution to the protocol fee contract
   - Controls transition from bonding curve to liquidity pools

3. **Bonding Curve Contract**
   - Implements an exponential bonding curve formula rather than a constant product model
   - Optimized to provide predictable pricing with smooth gradients
   - Determines token pricing during the initial phase
   - Individually deployed for each CULT token

   ```solidity
   // Actual bonding curve implementation
   // The formula used is y = A * e^(B * x) where:
   // - y is the price of the token
   // - A is a constant that scales the curve
   // - B is a constant that affects the curve's steepness
   // - x is the current supply of tokens
   
   function getEthBuyQuote(
       uint256 currentSupply,
       uint256 monOrderSize
   ) external pure returns (uint256) {
       uint256 x0 = currentSupply;
       uint256 deltaY = monOrderSize;

       // calculate exp(b*x0)
       uint256 exp_b_x0 = uint256((int256(B.mulWad(x0))).expWad());

       // calculate exp(b*x0) + (dy*b/a)
       uint256 exp_b_x1 = exp_b_x0 + deltaY.fullMulDiv(B, A);

       uint256 deltaX = uint256(int256(exp_b_x1).lnWad()).divWad(B) - x0;

       return deltaX;
   }
   ```

4. **Airdrop Contract**
   - Handles token distribution to eligible addresses
   - Utilizes Merkle proofs for gas-efficient verification
   - Deployed individually for each CULT token
   - Prevents gaming through centralized Merkle root updates

   ```solidity
   // Simplified airdrop claim verification
   function claim(address recipient, uint256 amount, bytes32[] calldata merkleProof) external {
       bytes32 leaf = keccak256(abi.encodePacked(recipient, amount));
       require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid proof");
       
       // Process the claim
       // ...implementation details...
   }
   ```

5. **Protocol Fee Contract**
   - Collects and distributes protocol fees
   - Allocates fees between creators, users, and platform
   - Provides economic incentives for ecosystem participants

### Contract Interactions

The interaction between contracts follows a specific flow for various operations:

#### Token Creation Flow

1. User submits token creation request with parameters through front-end
2. Front-end uploads token metadata and image to IPFS
3. Front-end calls `deployToken` on CULT Factory contract
4. Factory contract:
   - Deploys a new CULT Token contract
   - Deploys a dedicated Bonding Curve contract for the token
   - Deploys an Airdrop contract with the specified Merkle root
   - Links all contracts together
   - Emits `TokenCreated` event with contract addresses and metadata
5. Indexer captures the event and updates UI for all users

#### Token Purchase Flow

1. User initiates a token purchase with MON
2. System checks if token is in bonding curve phase:
   - If yes, bonding curve contract calculates token output
   - If no, routes transaction to appropriate liquidity pool
3. Protocol fees are deducted and sent to fee contract:
   - Creator receives a portion of fees
   - Platform receives a portion
   - Other token holders may receive a portion
4. Remaining MON goes to bonding curve reserve or liquidity pool
5. Tokens are minted or transferred to the buyer
6. Events are emitted and captured by indexer

#### Liquidity Transition Flow

When a token reaches a predefined market cap threshold:
1. Automatic transition process is triggered
2. Liquidity is extracted from bonding curve
3. Paired with remaining tokens in appropriate ratio
4. Deployed to Uniswap V3 (currently PancakeSwap on testnet)
5. Token contract is updated to route trades through the new pool
6. Events notify users of the transition

### Back-end Services

The back-end infrastructure provides critical services for the CULT ecosystem:

1. **Event Indexing**
   - Currently using Envio for event indexing and data processing
   - Future plans to implement Webhooks and custom database for enhanced functionality
   - Listens to all events emitted by CULT contracts:
     - TokenCreated
     - TokenPurchased
     - TokenSold
     - AirdropClaimed
     - LiquidityTransitioned
   - Processes and normalizes event data for consumption by front-end

2. **IPFS Integration**
   - Preprocessing pipeline for token images:
     - Compresses and optimizes uploaded images
     - Enforces size and format standards
     - Uploads to IPFS with content-addressing
   - Generates and stores token metadata as JSON:
     ```json
     {
       "name": "Example Token",
       "symbol": "EXT",
       "description": "This is an example token on CULT",
       "image": "ipfs://Qm...",
       "socials": {
         "twitter": "https://twitter.com/example",
         "telegram": "https://t.me/example",
         "discord": "https://discord.gg/example",
         "website": "https://example.com"
       }
     }
     ```
   - Provides IPFS URIs to smart contracts for on-chain storage

3. **Merkle Tree Management**
   - Generates Merkle trees for different community groups:
     - Diamond hands (active traders/holders)
     - NFT community members
     - Protocol users
   - Updates diamond hands list hourly based on chain activity
   - Stores Merkle roots and proofs for efficient retrieval
   - Provides API endpoints for proof verification and claiming

### Front-end Implementation

The front-end provides an intuitive interface for users to interact with the CULT platform:

1. **Technology Stack**
   - Next.js for server-side rendering and routing
   - TypeScript for type safety and enhanced developer experience
   - Wagmi and Viem for Ethereum interactions
   - Scaffold ETH as the initial boilerplate (heavily modified)
   - Privy for user authentication and wallet management
   - Tailwind CSS for styling with custom CSS for complex components

2. **Key Components**
   - Token Creation Interface: Form-based wizard for token creation
   - Token Explorer: Discovery and browsing of available tokens
   - Trading Interface: Buy, sell, and track token performance
   - Portfolio Dashboard: Manage owned tokens and claimed airdrops
   - Airdrop Center: View and claim available airdrops

3. **State Management**
   - Zustand for global state management
   - Tanstack Query for data fetching and caching
   - Local storage for user preferences
   - Wallet connection state via wagmi

## Leveraging Monad's Accelerated EVM

CULT is specifically designed to take full advantage of Monad's high-performance EVM environment, with optimizations in several key areas:

### Gas Efficiency

1. **Merkle Proof Verification**
   - Instead of storing full airdrop lists on-chain (which would be prohibitively expensive), CULT uses Merkle proofs
   - The Merkle root (a single 32-byte value) is stored on-chain
   - When claiming, users provide a Merkle proof that is verified against the root
   - This reduces gas costs by orders of magnitude compared to naive implementations
   - Monad's faster verification allows for more complex eligibility criteria

2. **Proxy Pattern Implementation**
   - CULT uses the UUPS (Universal Upgradeable Proxy Standard) for contract upgradeability
   - This pattern is more gas efficient than other proxy patterns, especially on Monad
   - Reduces the cost of initial deployment and upgrades

3. **Optimized Bonding Curve Calculations**
   - Mathematical operations in bonding curves are gas-intensive
   - CULT's implementation includes:
     - Bitwise optimization for common operations
     - Precalculated values where possible
     - Loop unrolling for gas-heavy routines
   - These optimizations provide even greater benefits on Monad's EVM

### Transaction Speed

1. **Rapid Token Creation**
   - Multi-contract deployment occurs in a single transaction
   - Takes advantage of Monad's faster block times
   - Token creation completes in seconds rather than minutes

2. **Trading Performance**
   - Buy/sell operations execute with minimal latency
   - Price calculations and token transfers process quickly
   - UI updates reflect changes almost immediately

3. **Batch Operations**
   - Multiple actions can be batched in a single transaction
   - Utilizes Monad's higher gas limit and throughput
   - Examples: claim multiple airdrops, perform trades across tokens

### Parallel Processing Optimization

1. **Non-Blocking Contract Design**
   - Smart contracts designed to minimize storage conflicts
   - Separate storage slots for frequently accessed state
   - Enables higher throughput for concurrent operations

2. **Indexer Efficiency**
   - Optimized for Monad's higher transaction throughput
   - Scales horizontally to handle increased event volume
   - Processes and serves data with minimal latency

### User Experience Benefits

1. **Reduced Costs**
   - Lower gas costs passed directly to users
   - Complex operations become economically viable
   - Encourages more frequent interaction with the platform

2. **Improved Responsiveness**
   - Faster confirmation times lead to better UX
   - Real-time updates without long waiting periods
   - Smoother transaction flow reduces user friction

3. **Enhanced Functionality**
   - Features that would be too expensive on other chains
   - More complex bonding curves and distribution mechanisms
   - Higher frequency updates to community lists

## Core Functionality

### Token Creation Process

The token creation process is designed to be simple for users while handling complex deployment operations behind the scenes:

1. **User Input Collection**
   - Name and symbol for the token
   - Description and social links
   - Logo image (uploaded to IPFS)
   - Advanced options:
     - Airdrop percentage (1-50%)
     - Target communities for airdrops

2. **Metadata Preparation**
   - Image is compressed and optimized
   - Metadata JSON is created and uploaded to IPFS
   - IPFS URI is generated for on-chain reference

3. **Smart Contract Deployment**
   - Factory contract creates token contract
   - Associated contracts are deployed:
     - Bonding curve with initial parameters
     - Airdrop contract with Merkle root
   - Contracts are initialized and linked

4. **Initial State Setup**
   - Initial supply allocation:
     - Creator allocation
     - Airdrop allocation
     - Liquidity allocation
   - Bonding curve is initialized with starting parameters
   - Default fees and distribution rules are applied

### Dynamic Pricing Mechanism

CULT implements an exponential bonding curve formula for token pricing:

1. **Bonding Curve Design**
   - Based on the exponential formula: `y = A * e^(B * x)`
   - A and B are carefully calibrated constants that control the curve
   - Optimized for gradual price discovery and reduced volatility

2. **Price Calculation**
   - For buys: calculates token output based on MON input
   - For sells: calculates MON output based on token input
   - Includes slippage considerations and reserves management

3. **Benefits of the Bonding Curve Approach**
   - Automatic liquidity (no need for initial DEX offering)
   - Fair price discovery without manipulation
   - Smooth price action with reduced volatility
   - Built-in incentives for early adopters

### Airdrop System

The platform features an innovative airdrop mechanism based on reputation scoring, which differentiates CULT from other token platforms:

1. **Reputation-Based Distribution**
   - Users earn reputation points through platform activities:
     - Holding tokens (duration and amount)
     - Trading activity (frequency and volume)
     - Community participation
   - Reputation score determines probability of inclusion in Diamond Hands list
   - Top 10,000 users by reputation are refreshed hourly
   - Dynamic system that rewards genuine engagement over whale dominance

2. **Community Selection**
   - Token creators select from predefined communities:
     - Diamond hands (active traders/holders based on reputation)
     - NFT collection holders
     - Charities and non-profits
     - Early CULT adopters

3. **Merkle Root Generation**
   - Back-end computes Merkle tree from eligible addresses
   - Updates diamond hands list hourly based on reputation scores
   - Generates and stores Merkle root on-chain
   - Maintains Merkle proofs off-chain for claiming

4. **Claiming Process**
   - User connects wallet and checks eligibility
   - System automatically fetches appropriate Merkle proof
   - Smart contract verifies proof and releases tokens
   - User receives tokens without understanding the complexity

5. **Security Measures**
   - Centralized Merkle root management prevents gaming
   - Whitelisted roots ensure only valid communities can be selected
   - Time-locks prevent front-running of airdrop announcements

### Liquidity Transition

As tokens mature, they transition from bonding curve to traditional AMM liquidity:

1. **Transition Trigger**
   - Automatic based on market capitalization threshold
   - Can be initiated by creator after minimum time period
   - Safety mechanisms prevent premature transitions

2. **Liquidity Deployment**
   - MON from bonding curve reserve is extracted
   - Paired with appropriate amount of tokens
   - Deployed to Uniswap V3 pool (currently PancakeSwap on testnet)
   - Future support for Uniswap V4 when available on Monad

3. **Trading Routing**
   - Token contract updated to route trades through new pool
   - Existing holders notified of transition
   - UI updated to reflect new trading mechanism

4. **Benefits**
   - More established price discovery mechanism
   - Integration with wider DeFi ecosystem
   - Advanced trading features (range orders, concentrated liquidity)

## Implementation Details

### Smart Contract Implementation

The smart contracts are implemented with a focus on security, efficiency, and upgradeability:

1. **Security Patterns**
   - Reentrancy guards on all external functions
   - Access control using role-based permissions
   - Check-Effects-Interactions pattern
   - Formal verification of critical functions

2. **Upgradeability**
   - UUPS proxy pattern for upgradeable contracts
   - Time-locked admin controls
   - Emergency pause functionality
   - Version tracking for compatibility

3. **Gas Optimization**
   - Storage packing for related variables
   - Minimal storage usage
   - Efficient event emission
   - Optimized math operations

### IPFS Integration

The IPFS integration provides decentralized storage for token metadata:

1. **Image Processing**
   - Client-side compression and resizing
   - Format conversion for compatibility
   - Size limits and validation

2. **Metadata Storage**
   - JSON schema validation
   - Pinning to ensure availability
   - Content addressing for immutability

3. **Retrieval Mechanisms**
   - IPFS gateway integration
   - Fallback mechanisms for availability
   - Caching for performance

### Merkle Tree Implementation

The Merkle tree implementation ensures efficient and secure airdrops:

1. **Tree Construction**
   - Keccak256 hashing for leaf nodes
   - Address and amount pairs as leaf data
   - Binary tree structure for proofs

2. **Verification Process**
   - On-chain verification of Merkle proofs
   - Optimized for gas efficiency
   - Double-claim prevention

3. **Management System**
   - Automated updates for dynamic lists
   - Versioning for multiple airdrop phases
   - Audit trails for transparency

## Development and Deployment

### Prerequisites

- Node.js (v16+)
- Yarn or npm
- Foundry or Hardhat for smart contract development
- Access to Monad testnet

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/cult-monad.git
   cd cult-monad
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys and configuration
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

### Deployment

1. Deploy smart contracts to Monad testnet:
   ```bash
   cd packages/hardhat
   npx hardhat run scripts/deploy.ts --network monad-testnet
   ```

2. Update contract addresses in the front-end:
   ```bash
   cd packages/nextjs
   # Update contract addresses in configuration
   ```

3. Deploy the front-end:
   ```bash
   yarn build
  
   ```

## Security Considerations

The CULT platform includes basic security measures:

1. **Smart Contract Safety**
   - Standard reentrancy protections
   - Role-based access controls
   - Follow common security patterns

2. **Front-end Protection**
   - Client-side input validation
   - Secure wallet connection flow

3. **Backend Security**
   - API validation through Envio
   - IPFS content verification

## Technologies and Dependencies

### Blockchain Infrastructure
- **Monad Blockchain**: Primary chain for smart contract deployment
- **Ethereum Virtual Machine (EVM)**: Execution environment for smart contracts
- **Solidity**: Smart contract programming language (v0.8.x)

### Back-end Services
- **Envio**: Event indexing and data processing
- **IPFS/Pinata**: Decentralized storage for token metadata and images
- **GraphQL**: API query language for data fetching

### Front-end
- **Next.js**: React framework for web applications
- **TypeScript**: Typed JavaScript for enhanced developer experience
- **Wagmi**: React hooks for Ethereum
- **Viem**: Low-level Ethereum interface
- **Tailwind CSS**: Utility-first CSS framework
- **Scaffold ETH**: Ethereum development stack and boilerplate
- **Privy**: Authentication and identity management
- **Zustand**: Lightweight state management
- **Tanstack Query**: Data fetching and caching library
- **React Hook Form**: Form validation and handling
- **DaisyUI**: Component library for Tailwind CSS
- **Radix UI**: Unstyled, accessible component primitives

### Development Tools
- **Hardhat/Foundry**: Smart contract development frameworks
- **OpenZeppelin**: Smart contract security libraries
- **ethers.js**: Ethereum JavaScript library
- **Typechain**: TypeScript bindings for Ethereum smart contracts
- **Merkletreejs**: Merkle tree implementation for airdrops
- **Vercel**: Deployment and hosting platform

## Future Roadmap

### Phase 1: Testnet Refinement (Current)
- Stabilize core functionality on Monad testnet
- Optimize gas usage and transaction flow
- Improve UI/UX based on early user feedback
- Comprehensive testing and security review

### Phase 2: Mainnet Preparation
- Complete security audit of all smart contracts
- Optimize the reputation system algorithms for better scoring
- Implement real-time websocket updates for diamond hand rankings
- Create custom webhooks and database for improved analytics
- Integrate with Uniswap V4 when available on Monad
- Enhanced analytics dashboard for each user



*This technical documentation provides a comprehensive overview of the CULT platform's architecture and implementation. The modular design, focus on gas efficiency, and seamless user experience showcase the platform's technical sophistication while leveraging Monad's accelerated EVM capabilities.*   
