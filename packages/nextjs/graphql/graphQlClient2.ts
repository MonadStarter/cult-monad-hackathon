import { gql, request } from "graphql-request";
import {
  CultTokenMetadata,
  CultTokenPageData,
  CultTokensResponse,
  TokenTradesData,
  TopHoldersResponse,
} from "~~/types/types";

//const endpoint = "https://api.studio.thegraph.com/query/103833/culttokens/version/latest";
// const endpoint = "https://api.goldsky.com/api/public/project_cm7aysf582k9p01sq9o2vfkrn/subgraphs/culttokens/v0.0.17/gn";
const envioEndpoint = "http://localhost:8080/v1/graphql";
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
  const response: CultTokensResponse = await request(envioEndpoint, cultTokensQuery, { first, skip });
  return response;
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

export async function fetchTopCoins(): Promise<CultTokensResponse> {
  const response: {
    CultToken: CultTokenMetadata[];
  } = await request(envioEndpoint, TopCoins);

  return {
    cultTokens: response.CultToken,
  };
}

const TokenPageData = gql`
  query GetCultTokenData($tokenAddress: String_comparison_exp = {}) {
    CultToken(where: { tokenAddress: $tokenAddress }) {
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
  const response: CultTokenPageData = await request(envioEndpoint, TokenPageData, { tokenAddress });
  return response;
};

const TopHolders = gql`
  query TopHolders($tokenAddress: CultToken_bool_exp = {}, $first: Int, $skip: Int) {
    TokenBalance(where: { token: $tokenAddress }, order_by: { value: desc }, limit: $first, offset: $skip) {
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
  const response: TopHoldersResponse = await request(envioEndpoint, TopHolders, {
    tokenAddress,
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
  const response: TokenTradesData = await request(envioEndpoint, TokenTrades, { tokenAddress, first, skip });
  return response;
};
