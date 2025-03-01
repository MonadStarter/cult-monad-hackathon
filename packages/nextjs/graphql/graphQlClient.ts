import { gql, request } from "graphql-request";
import { CultTokenPageData, CultTokensResponse, TokenTradesData, TopHoldersResponse } from "~~/types/types";

//const endpoint = "https://api.studio.thegraph.com/query/103833/culttokens/version/latest";
const endpoint = "https://api.goldsky.com/api/public/project_cm7aysf582k9p01sq9o2vfkrn/subgraphs/culttokens/v0.0.17/gn";
// This is to get latest coins for homepage
export const cultTokensQuery = gql`
  query GetCultTokens($first: Int!, $skip: Int!) {
    cultTokens(first: $first, skip: $skip) {
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
  const response: CultTokensResponse = await request(endpoint, cultTokensQuery, { first, skip });
  return response;
};

// This is to get top performing coins for homepage
const TopCoins = gql`
  {
    cultTokens(first: 3) {
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

export async function fetchTopCoins(): Promise<CultTokensResponse> {
  return await request(endpoint, TopCoins);
}

const TokenPageData = gql`
  query GetCultTokenData($tokenAddress: Bytes!) {
    cultToken(id: $tokenAddress) {
      id
      tokenCreator {
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

// Function to fetch data with pagination
export const fetchTokenPageData = async (
  tokenAddress: `0x${string}`,
  //accountAddress: string,
): Promise<CultTokenPageData> => {
  const response: CultTokenPageData = await request(endpoint, TokenPageData, { tokenAddress });
  return response;
};

const TopHolders = gql`
  query TopHolders($tokenAddress: String!, $first: Int!, $skip: Int!) {
    tokenBalances(first: $first, skip: $skip, where: { token: $tokenAddress }, orderBy: value, orderDirection: desc) {
      account {
        id
      }
      value
    }
  }
`;

export const fetchTopHolders = async (
  tokenAddress: string,
  first: number = 10,
  skip: number = 0,
): Promise<TopHoldersResponse> => {
  console.log("FETCHING TOP HOLDER", tokenAddress, first, skip);
  const response: TopHoldersResponse = await request(endpoint, TopHolders, {
    tokenAddress,
    first,
    skip,
  });
  console.log("RESPONSE", response);

  return response;
};

const TokenTrades = gql`
  query GetTokenTradesPaginated($tokenAddress: Bytes!, $first: Int!, $skip: Int!) {
    tokenTrades(
      where: { token: $tokenAddress } # Filter by token address
      orderBy: timestamp # Order by timestamp (most recent first)
      orderDirection: desc # Descending order
      first: $first # Number of trades to retrieve
      skip: $skip # Number of trades to skip
    ) {
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
  const response: TokenTradesData = await request(endpoint, TokenTrades, { tokenAddress, first, skip });
  return response;
};
