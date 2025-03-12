# Cult Platform

## Overview

Cult is a revolutionary platform transforming how people perceive and trade cultural tokens. We believe cultural tokenization represents the future where attention is the real currency. Our platform introduces a groundbreaking reputation system that aligns incentives for token holders, tokens, and creators, ensuring all parties benefit from long-term holding and loyalty.

<img width="1419" alt="Screenshot 2025-03-13 at 02 26 57" src="https://github.com/user-attachments/assets/aebbffc1-9009-4de9-b1a7-1c1533b03273" />

## Features

- **Reputation System**: Users earn reputation points based on holding and trading activity on the platform. Each user will have a reputation score and probability to get in the diamond hands list.

- **Diamond Hands List**: Top 1000 users refreshed hourly with airdrops for incentivized holding. Based on reputation score, users have varying probabilities to get onto the list.

- **Airdrops**: Every coin on Cult must airdrop a portion of supply (1-50%). Creators can airdrop to charities, NFT communities, and top holders.

- **Creator Earnings**: Creators earn from LP fees and bonding curves using Uniswap v4, incentivizing them to increase token popularity rather than dumping tokens.
  
<img width="1407" alt="Screenshot 2025-03-13 at 02 11 19" src="https://github.com/user-attachments/assets/fbac5942-b0ce-4789-882b-42757536ae45" />

### Key Mechanics

Cult's reputation system operates through several core mechanics:

1. **Reputation Score Calculation:**
    - The reputation score is determined by a combination of factors that reward long-term holding and active trading:
        - **Holding Time:** Rewards users for loyalty and a long-term perspective, encouraging them to diamond hand (hold tokens for extended periods).
        - **Trading Activity:** Encourages active participation and liquidity, measured by the frequency and volume of trades.
        - **Selling Behavior:** Penalizes frequent or large sales to discourage speculation and dumping, which can destabilize token prices.
    - The system uses a probabilistic model to calculate this score, ensuring a fair and dynamic evaluation of user behavior.

2. **Diamond Hands List:**
    - A dynamic list of 1,000 users is selected every hour based on their reputation scores. The selection is probabilistic, meaning users with higher scores have a greater chance of being included, but it's not guaranteed.
    - This adds an element of excitement and fairness, as even small account users have a chance to be selected, making the system inclusive.
    - The hourly refresh ensures continuous engagement, keeping users motivated to maintain or improve their scores.

3. **Airdrop Requirement:**
    - Every token launch on Cult must airdrop a portion of its supply (1% to 50%) to the Diamond Hands List or other specified groups.
    - Target groups can include charities, NFT communities, 50,000 random MON holders, or the top 10,000 diamond hand holders.
    - This ensures that tokens are distributed to engaged users, fostering community growth and alignment.

4. **Additional Mechanics:**
    - Creators can choose specific communities for airdrops, such as NFT or token communities that are already established, to target user bases and create fast community token ownership (CTO).
    - This is designed to prevent gaming, as creators cannot add their own list of addresses; instead, they select from predefined communities based on diamond hand scores, ensuring fairness and transparency.
    - The system tags different communities based on their diamond hand scores, allowing new creators to prefer airdropping to the best communities, enhancing engagement and adoption.
      
<img width="1425" alt="Screenshot 2025-03-13 at 02 22 38" src="https://github.com/user-attachments/assets/f862fd75-3f39-4ccc-81fd-da529bd3306f" />

## Tech Stack

- **Frontend**: Next.js, React, DaisyUI
- **Blockchain**: EVM
- **Web3 Integration**: Wagmi, Viem
- **Package Management**: Yarn, pnpm
- **Other Tools**: Docker, The Graph, TypeScript

## Bounty Integrations

This project utilizes the following technologies as part of bounty programs:

### Envio Integration

Envio serves as our blockchain indexer for real-time on-chain data. We use Envio to monitor token transactions, track wallet holding periods, and index trading activity across all listed tokens. This data feeds directly into our reputation scoring algorithm, enabling us to calculate diamond hand probabilities based on actual on-chain behavior rather than off-chain signals. Envio's efficient indexing allows us to refresh the diamond hands list hourly and provide real-time analytics on token performance.

### Privy Integration

Privy powers our authentication infrastructure, creating a simplified onboarding experience while maintaining security standards required for token trading. Similar to PumpFun's user flow, our Privy implementation enables both traditional login methods and web3 wallet connections, abstracting away the complexity of wallet management for new users. This dual approach allows us to maintain a low-friction entry point for crypto newcomers while still supporting advanced functionality for experienced traders, particularly important for our reputation-based token system.

### QuickNode Integration

QuickNode provides the robust RPC infrastructure essential for reliable blockchain interactions throughout our platform. 

Before starting, ensure you have the following installed:

- [Node.js (>= v18.18)](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/getting-started/install)
- [pnpm](https://pnpm.io/installation)
- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/products/docker-desktop)

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/monadstarter/cult-platform.git
   cd cult-platform
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

## Running the Project

Follow these steps to run the project locally:

1. **Deploy Backend (Envio)**

   Start the Envio backend service:

   ```bash
   cd packages/subgraph/envio/cult
   pnpm codegen
   pnpm run dev
   ```

2. **Run Frontend**

   In a new terminal, start the Next.js frontend application:

   ```bash
   cd packages/nextjs
   yarn dev
   ```

   Access the application at `http://localhost:3000`.



## Project Structure

- **packages/hardhat**: Smart contracts and blockchain interaction
- **packages/nextjs**: Frontend application
- **packages/subgraph**: Data indexing and query services

## Additional Information

- **Smart Contract Development**: Edit contracts in `packages/hardhat/contracts`
- **Frontend Development**: Edit the frontend in `packages/nextjs/app`
- **Deployment Scripts**: Customize deployment scripts in `packages/foundry/script`

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are installed correctly
2. Check that you're using the correct Node.js version
3. Make sure Docker is running for graph-related operations
4. If you encounter module-related errors, try reinstalling dependencies

For additional help, please open an issue in the repository.
