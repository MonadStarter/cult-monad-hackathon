"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchTopCoins } from "~~/graphql/graphQlClient2";
import { ellipsisToken } from "~~/lib/utils";
import { CultTokenMetadata, CultTokensResponse } from "~~/types/types";
import { parseIPFSMetadata } from "~~/utils/externalAPIs/ipfs";

function TopCoins() {
  const { data, isLoading, error } = useQuery<CultTokensResponse>({
    queryKey: ["topCoins"],
    async queryFn() {
      return await fetchTopCoins();
    },
  });
  if (isLoading) {
    return (
      <div className="topcoins-section">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error("GraphQL Error:", error);
    return <div>Error loading data</div>;
  }

  if (!data || !data.cultTokens) {
    return <div>No data available</div>;
  }

  return (
    <div className="topcoins-section">
      {data.cultTokens.slice(0, 3).map((coin: CultTokenMetadata) => {
        // Parse metadata and extract the image URL
        const metadata = parseIPFSMetadata(coin.ipfsData.content);

        return (
          <Link href={`/coin/${coin.tokenAddress}`} key={coin.tokenAddress}>
            <div className="bg-background flex rounded-xl p-1 items-center z-2 gap-2 relative">
              <Image src={metadata?.imageUrl || `https://picsum.photos/200`} height={90} width={90} alt={coin.name} />
              <div className="flex flex-col gap-2 h-min">
                <div>
                  <h5>{coin.name}</h5>
                  <p className="text-gray-500 text-xs">${coin.symbol}</p>
                </div>
                <p className="text-gray-500 text-xs">
                  Designed by:{" "}
                  <span className="text-primary-400 underline underline-offset-1">
                    {ellipsisToken(coin.tokenCreator.id)}
                  </span>
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default TopCoins;
