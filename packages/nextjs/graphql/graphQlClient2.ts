import { gql, request } from "graphql-request";
import {
  AccountData,
  AccountDetailsResponse,
  AccountProfileData,
  CultTokenMetadata,
  CultTokenPageData,
  CultTokensResponse,
  TokenTrade,
  TokenTradesData,
  TokensCreatedResponse,
  TopHoldersResponse,
  TopHolders as TopHoldersType,
} from "~~/types/types";
import { parseIPFSMetadata } from "~~/utils/externalAPIs/ipfs";

const envioEndpoint = process.env.NEXT_PUBLIC_ENVIO_ENDPOINT;
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
  const response: any = await request(envioEndpoint as any, cultTokensQuery, { first, skip });
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

  // If there's an ipfsData array, use the first element
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
  query TopHolders($tokenAddress: CultToken_bool_exp, $first: Int, $skip: Int) {
    TokenBalance(where: { token: $tokenAddress }, order_by: { value: desc }, limit: $first, offset: $skip) {
      value
      account {
        id
      }
    }
  }
`;
export const fetchTopHolders = async (tokenAddress: string, first = 10, skip = 0): Promise<TopHoldersResponse> => {
  // Build the filter object that matches CultToken_bool_exp for a token's id
  const variables = {
    tokenAddress: {
      id: {
        _eq: tokenAddress,
      },
    },
    first,
    skip,
  };

  // Make the request
  const response: any = await request<{ TokenBalance: TopHoldersType[] }>(envioEndpoint, TopHolders, variables);

  return {
    tokenBalances: response.TokenBalance,
  };
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
      slug
      diamondHandProbability
      feeCollected
      totalReferrals
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
        token {
          name
          symbol
          ipfsData {
            content
          }
        }
      }
    }
  }
`;
export const fetchTokensCreated = async (accountId: string): Promise<TokensCreatedResponse> => {
  const response: any = await request(envioEndpoint, TokensCreated, { accountId });
  console.log("RESPONSE", response);
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
          if (balance.token?.ipfsData?.[0]?.content) {
            try {
              const metadata = parseIPFSMetadata(balance.token.ipfsData[0].content);
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
            name: balance.token.name,
            symbol: balance.token.symbol,
            value: balance.value,
            image,
          };
        }),
        slug: response.Account[0].slug || "",
        diamondHandProbability: response.Account[0].diamondHandProbability || 0,
        feeCollected: response.Account[0].feeCollected?.toString() || "0",
        totalReferrals: response.Account[0].totalReferrals || 0,
      }
    : null;

  return {
    accountData,
  };
};

const AccountDetails = gql`
  query AccountDetails($accountId: String!) {
    Account(where: { id: { _eq: $accountId } }) {
      id
      slug
      diamondHandProbability
      feeCollected
      totalReferrals
    }
  }
`;

// Updated function that matches the pattern of fetchTokenTrades
export const fetchAccountDetails = async (accountId: string): Promise<{ accountData: AccountProfileData | null }> => {
  // Prepare the query variables
  const variables = { accountId };

  // Execute the GraphQL query
  const response = await request<AccountDetailsResponse>(
    envioEndpoint, // Replace with your actual endpoint
    AccountDetails,
    variables,
  );

  // Check if Account data exists and transform it
  const accountData =
    response.Account.length > 0
      ? {
          id: response.Account[0].id,
          slug: response.Account[0].slug,
          diamondHandProbability: response.Account[0].diamondHandProbability,
          feeCollected: response.Account[0].feeCollected ? response.Account[0].feeCollected.toString() : "0",
          totalReferrals: response.Account[0].totalReferrals || 0,
        }
      : null;

  // Return in a format that matches your other fetch functions
  return {
    accountData,
  };
};
