import { defineChain } from "viem";
import * as chains from "viem/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
  privy: {
    appId: string;
    apiSecretKey: string;
    jwksUrl: string;
  };
};

export const monadTestnet = defineChain({
  id: 10143,
  name: "MonadTestnet",
  nativeCurrency: {
    decimals: 18,
    name: "MonadTestnet",
    symbol: "TMON",
  },
  rpcUrls: {
    default: {
      http: ["https://monad-testnet.g.alchemy.com/v2/Rkik2kU2CR1Dd0z-FkhGSUsAiIx6EuES"], //[process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz/"],
      //webSocket: ['wss://rpc.zora.energy'],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.monad-testnet.category.xyz" },
  },
  contracts: {
    // multicall3: {
    //   address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    //   blockCreated: 5882,
    // },
  },
});

export const DEFAULT_ALCHEMY_API_KEY = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [chains.foundry, chains.baseSepolia, monadTestnet],

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,
  
  // Privy configuration
  privy: {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
    apiSecretKey: process.env.NEXT_PUBLIC_PRIVY_API_SECRET_KEY || "",
    jwksUrl: process.env.NEXT_PUBLIC_PRIVY_JWKS_URL || "",
  },
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
