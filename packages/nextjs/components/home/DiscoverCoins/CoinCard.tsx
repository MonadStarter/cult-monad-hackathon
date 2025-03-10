"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProgressBar from "../../common/ProgressBar";
import Socials from "../../common/Socials";
import { rankingColors } from "~~/constants/content";
import useGetMktCap from "~~/hooks/fetchPrice";
import { TokenMetadata } from "~~/types/types";

const ETH_PRICE_USD = 3000;
const MINIMUM_MARKETCAP_USD = 100000;
const POLLING_INTERVAL = 5000;

interface CoinCardProps {
  //tokenMetadata: CultTokenMetadata; // Basic token info from DiscoverCoins query
  metadata: TokenMetadata | null; // Detailed metadata fetched in DiscoverCoins
  //priceInEth: number | undefined;      // priceInEth fetched in DiscoverCoins
  rank: number;
  loading: boolean;
  error: string | null;
}

const CoinCard: React.FC<CoinCardProps> = React.memo(({ metadata, rank, loading, error }) => {
  const {
    marketCap = "0",
    //priceRefetch,
  } = useGetMktCap({ tokenAddress: metadata.tokenAddress }) ?? {};
  if (loading || !metadata) {
    return <LoadingCard />;
  }

  if (error) {
    return <ErrorCard error={error} tokenAddress={metadata.tokenAddress} />;
  }

  const progress = Math.min((Number(marketCap) / MINIMUM_MARKETCAP_USD) * 100, 100);
  const formattedCurrentMarketCap = Number(marketCap).toFixed(2);

  return (
    <div className="content-wrapper-card w-full hover:ease-in transition-all hover:brightness-125">
      <div className="relative">
        <Image
          src={metadata.image}
          alt={metadata.name}
          layout="responsive"
          width={250} // Placeholder value, Next.js calculates actual size dynamically
          height={150} // Placeholder value, maintains aspect ratio
          //className="w-full h-auto object-cover"
          loading="lazy"
        />
        {rank <= 3 && <div className={`pill-badge absolute right-2 bottom-2 ${rankingColors[rank - 1]}`}>#{rank}</div>}
      </div>
      <div className="flex flex-col gap-4 p-4">
        <Link href={`/coin/${metadata.tokenAddress}`}>
          {" "}
          {/* Use tokenAddress here */}
          <h5>{metadata.name}</h5>
          <p className="text-gray-500 text-xs">${metadata.symbol}</p>
        </Link>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Market Cap: ${formattedCurrentMarketCap}</span>
          </div>
          <ProgressBar current={progress} />
        </div>
        <div className="flex justify-between items-center">
          <Socials
            website={metadata.socials?.website}
            discord={metadata.socials?.discord}
            x={metadata.socials?.twitter}
            telegram={metadata.socials?.telegram}
            className="!gap-2"
          />
        </div>
      </div>
    </div>
  );
});

const LoadingCard = () => (
  <div className="w-full">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="content-wrapper-card w-full h-64 animate-pulse bg-gray-100 rounded-lg mb-6" />
    ))}
  </div>
);

const ErrorCard = ({ error, tokenAddress }: { error: string; tokenAddress: string }) => (
  <div className="content-wrapper-card w-full h-64">
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <p className="text-error-500">Error: {error}</p>
      <p className="text-gray-600">Token Address: {tokenAddress}</p>
    </div>
  </div>
);

export default CoinCard;
