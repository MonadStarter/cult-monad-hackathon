import { zeroAddress } from "viem";
import { create } from "zustand";
import { CultTokenPageData, TokenMetadata } from "~~/types/types";

interface TokenState {
  tokenAddress: `0x${string}`;
  userAddress: `0x${string}`;
  metadata: TokenMetadata | null;
  subgraphData: CultTokenPageData | undefined;
  isLoading: boolean;
  error: Error | null; // Type the error appropriately
  refetch: (() => void) | null; // Store the refetch function
  setTokenAddress: (address: `0x${string}` | undefined) => void;
  setUserAddress: (address: `0x${string}` | undefined) => void;
  setMetadata: (metadata: TokenMetadata | null) => void;
  setSubgraphData: (data: CultTokenPageData | undefined) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: any) => void;
  setRefetch: (refetchFn: () => void) => void; // Setter for refetch
}

export const useTokenStore = create<TokenState>(set => ({
  tokenAddress: "0x98f99bB9Be0cCbD018b1c4F9b4B79f65e47A8CCe",
  userAddress: zeroAddress,
  metadata: null,
  refetch: null,
  subgraphData: undefined,
  isLoading: false,
  error: null,
  setTokenAddress: address => set({ tokenAddress: address }),
  setUserAddress: address => set({ userAddress: address }),
  setMetadata: metadata => set({ metadata: metadata }),
  setSubgraphData: data => set({ subgraphData: data }),
  setLoading: loading => set({ isLoading: loading }),
  setError: error => set({ error: error }),
  setRefetch: refetchFn => set({ refetch: refetchFn }), // Store refetch function
}));
