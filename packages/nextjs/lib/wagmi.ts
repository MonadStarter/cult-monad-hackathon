import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';

const Sepolia = {
    id: 11155111,
    name: 'Sepolia',
    network: 'Sepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'ETH',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: ['https://greatest-tiniest-general.ethereum-sepolia.quiknode.pro/853faf881c2a93b18ef8dbb448f5d27489e152af']
        },
        public: {
            http: ['https://greatest-tiniest-general.ethereum-sepolia.quiknode.pro/853faf881c2a93b18ef8dbb448f5d27489e152af']
        }
    },
    blockExplorers: {
        default: {
            name: 'Sepolia Explorer',
            url: 'https://sepolia.etherscan.io/'
        }
    },
    testnet: true
} as const;

export const { chains, publicClient } = configureChains(
    [Sepolia],
    [publicProvider()]
);

const { connectors } = getDefaultWallets({
    appName: 'My App',
    projectId: 'e9aec602d297dcbcae23daba191f89a7',
    chains
});

export const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient
});