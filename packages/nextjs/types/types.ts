export type MemeCoin = {
  name: string;
  token: string;
  creator: string;
  img: string;
  description: string;
  netWorth: number;
};

export type NavigationItem = {
  id: string;
  href: string;
  label: string;
};

export enum TradeOptions {
  BUY = "buy",
  SELL = "sell",
}

export type Comment = {
  profileIconUrl: string;
  author: string;
  content: string;
  likes: number;
  liked?: boolean;
  createdAt: Date;
};

export interface TokenMetadata {
  name: string;
  description: string;
  image: string | File | null;
  tokenAddress: `0x${string}`;
  socials?: SocialLink;
  symbol: string; // Add symbol to metadata for consistency
  marketCap: string;
  price?: string;
  circulatingSupply?: string;
}

export type CultTokenMetadata = {
  tokenAddress: `0x${string}`;
  tokenCreator: {
    id: string;
  };
  name: string;
  symbol: string;
  ipfsData: {
    content: string;
  };
};

export interface CultTokensResponse {
  cultTokens: CultTokenMetadata[];
}

export interface SocialLink {
  twitter?: string;
  telegram?: string;
  discord?: string;
  website?: string;
}

export interface IPFSMetadata {
  name: string;
  symbol: string;
  description: string;
  socials: SocialLink;
  imageUrl: File | string | null; // For file input
}

export interface TopHoldersResponse {
  tokenBalances: {
    account: {
      id: string;
    };
    value: string;
  }[];
}

export type TokenTrade = {
  id: string;
  tradeType: string;
  trader: {
    id: string;
  };
  recipient: {
    id: string;
  };
  orderReferrer: {
    id: string;
  };
  ethAmount: string;
  tokenAmount: string;
  traderTokenBalance: string;
  marketType: string;
  timestamp: string;
  transactionHash: string;
};

export type TokenTradesData = {
  tokenTrades: TokenTrade[];
};

export type CultTokenPageData = {
  cultToken: {
    id: string;
    tokenCreator: {
      id: string;
    };
    bondingCurve: string;
    name: string;
    symbol: string;
    poolAddress: string;
    blockTimestamp: number;

    // balances: {
    //   account: {
    //     id: string;
    //   };
    //   value: string; // Assuming BigInt is returned as a string in GraphQL responses
    // }[];
    holderCount: string;
    ipfsData: {
      content: string;
    };
  } | null;
};
