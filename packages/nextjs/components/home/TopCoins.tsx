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
      <div className="flex flex-col gap-4 w-full max-w-md">
        <div className="mb-2">
          <h3 className="text-2xl font-bold mb-1">Top Tokens</h3>
          <p className="text-[#787689] text-sm">Most popular tokens</p>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse bg-[#27253680] rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error("GraphQL Error:", error);
    return (
      <div className="flex flex-col gap-4 w-full max-w-md">
        <div className="mb-2">
          <h3 className="text-2xl font-bold mb-1">Top Tokens</h3>
          <p className="text-[#787689] text-sm">Most popular tokens</p>
        </div>
        <div className="p-4 rounded-xl bg-[#27253680] border border-red-500/20">
          <p className="text-red-400">Error loading data</p>
        </div>
      </div>
    );
  }

  if (!data || !data.cultTokens || data.cultTokens.length === 0) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-md">
        <div className="mb-2">
          <h3 className="text-2xl font-bold mb-1">Top Tokens</h3>
          <p className="text-[#787689] text-sm">Most popular tokens</p>
        </div>
        <div className="p-4 rounded-xl bg-[#27253680] border border-[#2A293580]">
          <p className="text-[#787689]">No tokens available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <div className="mb-2">
        <h3 className="text-2xl font-bold mb-1">Top Tokens</h3>
        <p className="text-[#787689] text-sm">Most popular tokens</p>
      </div>
      
      {data.cultTokens.slice(0, 3).map((coin: CultTokenMetadata, index) => {
        // Parse metadata and extract the image URL
        const metadata = parseIPFSMetadata(coin.ipfsData.content);
        // Ensure we only use string type for Image src
        const imageSrc = typeof metadata?.imageUrl === 'string' 
          ? metadata.imageUrl 
          : 'https://picsum.photos/200';

        return (
          <Link href={`/coin/${coin.tokenAddress}`} key={coin.tokenAddress} className="block">
            <div className="bg-[#27253680] hover:bg-[#272536] border border-[#2A293580] hover:border-[#4A4880] rounded-xl p-3 transition-all duration-200 group">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden relative">
                    <Image 
                      src={imageSrc} 
                      alt={coin.name} 
                      fill
                      style={{ objectFit: 'cover' }}
                      className="group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {index < 3 && (
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${index === 0 ? 'bg-[#F7931A]' : 
                        index === 1 ? 'bg-[#7371FC]' : 'bg-[#2EBD85]'}`}>
                      #{index + 1}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-1">
                  <div>
                    <h4 className="font-semibold group-hover:text-[#9990FF] transition-colors">{coin.name}</h4>
                    <p className="text-[#787689] text-xs">${coin.symbol}</p>
                  </div>
                  <p className="text-[#787689] text-xs flex items-center gap-1">
                    <span>Creator:</span>
                    <span className="text-[#9990FF] font-medium">
                      {ellipsisToken(coin.tokenCreator.id)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default TopCoins;
