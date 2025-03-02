import { create } from "zustand";
import { CultTokenMetadata } from "~~/types/types";

// ... (Your existing code for query, types, and fetch function)

interface CultTokensState {
  tokens: CultTokenMetadata[];
  addToken: (newToken: CultTokenMetadata) => void;
}

export const useCultTokensStore = create<CultTokensState>((set, get) => ({
  tokens: [],
  addToken: newToken => set(state => ({ tokens: [...state.tokens, newToken] })),
}));
