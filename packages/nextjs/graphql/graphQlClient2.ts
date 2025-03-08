import { gql, request } from "graphql-request";
import {
  AccountData,
  CultTokenMetadata,
  CultTokenPageData,
  CultTokensResponse,
  TokenTrade,
  TokenTradesData,
  TokensCreatedResponse,
  TopHoldersResponse,
} from "~~/types/types";
import { parseIPFSMetadata } from "~~/utils/externalAPIs/ipfs";

//const endpoint = "https://api.studio.thegraph.com/query/103833/culttokens/version/latest";
// const endpoint = "https://api.goldsky.com/api/public/project_cm7aysf582k9p01sq9o2vfkrn/subgraphs/culttokens/v0.0.17/gn";
const envioEndpoint = "http://localhost:8080/v1/graphql";
//const envioEndpoint = "https://indexer.dev.hyperindex.xyz/27960d7/v1/graphql";
// This is to get latest coins for homepage
export const cultTokensQuery = gql`
  query GetCultTokens($first: Int, $skip: Int) {
    CultToken(limit: $first, offset: $skip) {
      tokenAddress
      tokenCreator {
        id # Creator's address
      }
      name
      symbol
      ipfsData {
        content
      }
    }
  }
`;

// Function to fetch data with pagination
export const fetchDiscoverTokenData = async (first: number, skip: number): Promise<CultTokensResponse> => {
  const response: any = await request(envioEndpoint, cultTokensQuery, { first, skip });
  // Transform each token so ipfsData is a single object rather than an array.
  const normalizedCultTokens = response.CultToken.map((token: any) => {
    return {
      ...token,
      ipfsData: token.ipfsData?.[0] ?? { content: "" },
      // Fallback to an empty content if the array is empty
    };
  });

  return {
    cultTokens: normalizedCultTokens,
  };
};

// This is to get top performing coins for homepage
const TopCoins = gql`
  {
    CultToken(limit: 3) {
      tokenAddress
      tokenCreator {
        id
      }
      name
      symbol
      ipfsData {
        content
      }
    }
  }
`;

//updated the function to work with existing schema
export async function fetchTopCoins(): Promise<CultTokensResponse> {
  // We're using 'any' for the response so we can transform it freely.
  const response: any = await request(envioEndpoint, TopCoins);

  // Transform each token so ipfsData is a single object rather than an array.
  const normalizedCultTokens = response.CultToken.map((token: any) => {
    return {
      ...token,
      ipfsData: token.ipfsData?.[0] ?? { content: "" },
      // Fallback to an empty content if the array is empty
    };
  });

  return {
    cultTokens: normalizedCultTokens,
  };
}

const TokenPageData = gql`
  query GetCultTokenData($tokenAddress: String_comparison_exp!) {
    CultToken(where: { tokenAddress: $tokenAddress }) {
      id
      tokenCreator {
        id
      }
      airdropContract {
        id
      }
      bondingCurve
      name
      symbol
      poolAddress
      blockTimestamp
      holderCount
      ipfsData {
        content
      }
    }
  }
`;

export const fetchTokenPageData = async (tokenAddress: `0x${string}`): Promise<CultTokenPageData> => {
  // Pass _eq as part of the comparison_exp object
  const variables = { tokenAddress: { _eq: tokenAddress } };
  const response = await request<{ CultToken: any[] }>(envioEndpoint, TokenPageData, variables);

  // Grab the first (or only) item in the CultToken array
  const token = response?.CultToken?.[0];
  if (!token) {
    return { cultToken: null };
  }

  // If there’s an ipfsData array, use the first element
  const ipfsDataItem = token.ipfsData?.[0] ?? { content: "" };
  // Shape the data to match CultTokenPageData
  return {
    cultToken: {
      id: token.id,
      tokenCreator: {
        id: token.tokenCreator?.id ?? "",
      },
      airdropContract: {
        id: token.airdropContract?.id ?? "",
      },
      bondingCurve: token.bondingCurve,
      name: token.name,
      symbol: token.symbol,
      poolAddress: token.poolAddress,
      blockTimestamp: Number(token.blockTimestamp), // ensure it's a number
      holderCount: token.holderCount,
      ipfsData: {
        content: ipfsDataItem.content,
      },
    },
  };
};

const TopHolders = gql`
  query TopHolders($tokenFilter: CultToken_bool_exp, $first: Int, $skip: Int) {
    TokenBalance(where: { token: $tokenFilter }, order_by: { value: desc }, limit: $first, offset: $skip) {
      account {
        id
      }
      value
    }
  }
`;

export const fetchTopHolders = async (tokenAddress: string, first = 10, skip = 0): Promise<TopHoldersResponse> => {
  // Build the filter object that matches CultToken_bool_exp
  // For a single token address, you usually want something like:
  // { tokenAddress: { _eq: "0x123..." } }
  const tokenFilter = {
    tokenAddress: {
      _eq: tokenAddress,
    },
  };

  // Make the request
  const response = await request<TopHoldersResponse>(envioEndpoint, TopHolders, {
    tokenFilter,
    first,
    skip,
  });

  console.log("RESPONSE", response);
  return response;
};

const TokenTrades = gql`
  query GetTokenTradesPaginated($tokenAddress: CultToken_bool_exp = {}, $first: Int, $skip: Int) {
    TokenTrade(where: { token: $tokenAddress }, order_by: { timestamp: desc }, limit: $first, offset: $skip) {
      id
      tradeType
      trader {
        id
      }
      recipient {
        id
      }
      orderReferrer {
        id
      }
      ethAmount
      tokenAmount
      traderTokenBalance
      marketType
      timestamp
      transactionHash
    }
  }
`;

export const fetchTokenTrades = async (
  tokenAddress: `0x${string}`,
  first: number = 20,
  skip: number = 0,
): Promise<TokenTradesData> => {
  // Pass an object shaped according to CultToken_bool_exp:
  // { tokenAddress: { _eq: "0x..." } }
  const variables = {
    tokenAddress: {
      tokenAddress: {
        _eq: tokenAddress,
      },
    },
    first,
    skip,
  };

  const response = await request<{ TokenTrade: TokenTrade[] }>(envioEndpoint, TokenTrades, variables);

  // Return the data under "tokenTrades" instead of "TokenTrade"
  return {
    tokenTrades: response.TokenTrade,
  };
};

// GraphQL query
const TokensCreated = gql`
  query TokensCreated($accountId: String!) {
    Account(where: { id: { _eq: $accountId } }) {
      created {
        id
        name
        symbol
        ipfsData {
          content
        }
      }
      balances {
        id
        lastBought
        lastSold
        token_id
        value
      }
    }
  }
`;

export const fetchTokensCreated = async (accountId: string): Promise<TokensCreatedResponse> => {
  const response: any = await request(envioEndpoint, TokensCreated, { accountId });

  const accountData: AccountData | null = response?.Account?.[0]
    ? {
        created: response.Account[0].created.map((token: any) => {
          let image: string | undefined;
          if (token.ipfsData?.[0]?.content) {
            try {
              const metadata = parseIPFSMetadata(token.ipfsData[0].content);
              image = metadata?.imageUrl || undefined;
            } catch (error) {
              console.error("Error parsing IPFS metadata:", error);
            }
          }
          return {
            id: token.id,
            name: token.name,
            symbol: token.symbol,
            image,
          };
        }),
        balances: response.Account[0].balances.map((balance: any) => {
          let image: string | undefined;
          if (balance.token?.ipfsData?.content) {
            try {
              const metadata = parseIPFSMetadata(balance.token.ipfsData.content);
              image = metadata?.imageUrl || undefined;
            } catch (error) {
              console.error("Error parsing IPFS metadata for balance:", error);
            }
          }
          return {
            id: balance.id,
            lastBought: balance.lastBought,
            lastSold: balance.lastSold,
            token_id: balance.token_id,
            value: balance.value,
            image,
          };
        }),
      }
    : null;

  return {
    accountData,
  };
};
