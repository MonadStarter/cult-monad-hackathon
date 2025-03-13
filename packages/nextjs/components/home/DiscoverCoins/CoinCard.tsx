"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import ProgressBar from "../../common/ProgressBar";
import Socials from "../../common/Socials";
import { rankingColors } from "~~/constants/content";
import useGetMktCap from "~~/hooks/fetchPrice";
import { TokenMetadata } from "~~/types/types";

const MINIMUM_MARKETCAP_USD = 100000;

interface CoinCardProps {
  metadata: TokenMetadata | null;
  rank: number;
  loading: boolean;
  error: string | null;
}

const CoinCard: React.FC<CoinCardProps> = React.memo(({ metadata, rank, loading, error }) => {
  const {
    marketCap = "0",
  } = useGetMktCap({ tokenAddress: metadata?.tokenAddress }) ?? {};
  
  if (loading || !metadata) {
    return <LoadingCard />;
  }

  if (error) {
    return <ErrorCard error={error} tokenAddress={metadata.tokenAddress} />;
  }

  const progress = Math.min((Number(marketCap) / MINIMUM_MARKETCAP_USD) * 100, 100);
  const formattedCurrentMarketCap = Number(marketCap).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Default image fallback
  const imageSrc = typeof metadata.image === 'string' ? metadata.image : '/placeholder-token.png';

  return (
    <div className="w-full overflow-hidden rounded-xl bg-gradient-to-b from-[#1F1D2B] to-[#18162280] border border-[#2A293580] hover:border-[#4A4880] transition-all duration-300 hover:shadow-lg hover:shadow-[#4A488033] group">
      <div className="relative">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={imageSrc}
            alt={metadata.name}
            fill
            style={{ objectFit: 'cover' }}
            className="group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F1D2B] to-transparent opacity-40"></div>
        </div>
        
        {rank <= 3 && (
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full font-bold text-sm
            ${rank === 0 ? 'bg-[#7371FC] text-white' : 
              rank === 1 ? 'bg-[#F7931A] text-white' : 
                rank === 2 ? 'bg-[#2EBD85] text-white' : 'bg-[#7371FC] text-white'}`}>
            #{rank}
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-4 p-5">
        <Link href={`/coin/${metadata.tokenAddress}`} className="group-hover:text-[#9990FF] transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{metadata.name}</h3>
              <p className="text-[#787689] text-sm font-medium">${metadata.symbol}</p>
            </div>
          </div>
        </Link>
        
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#787689]">Market Cap:</span>
            <span className="font-semibold text-white">${formattedCurrentMarketCap}</span>
          </div>
          <ProgressBar current={progress} />
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-[#2A293580]">
          <Socials
            website={metadata.socials?.website}
            discord={metadata.socials?.discord}
            x={metadata.socials?.twitter}
            telegram={metadata.socials?.telegram}
            className="!gap-3"
          />
        </div>
      </div>
    </div>
  );
});

const LoadingCard = () => (
  <div className="w-full">
    <div className="rounded-xl bg-[#1F1D2B] border border-[#2A293580] overflow-hidden">
      <div className="h-48 animate-pulse bg-[#272535]"></div>
      <div className="p-5 space-y-4">
        <div className="h-6 animate-pulse bg-[#272535] rounded-md w-3/4"></div>
        <div className="h-4 animate-pulse bg-[#272535] rounded-md w-1/4"></div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 animate-pulse bg-[#272535] rounded-md w-1/3"></div>
            <div className="h-4 animate-pulse bg-[#272535] rounded-md w-1/4"></div>
          </div>
          <div className="h-2 animate-pulse bg-[#272535] rounded-md"></div>
        </div>
        <div className="pt-3 border-t border-[#2A293580]">
          <div className="h-5 animate-pulse bg-[#272535] rounded-md w-1/2"></div>
        </div>
      </div>
    </div>
  </div>
);

const ErrorCard = ({ error, tokenAddress }: { error: string; tokenAddress: string }) => (
  <div className="rounded-xl bg-[#1F1D2B] border border-[#2A293580] overflow-hidden h-64">
    <div className="h-full flex flex-col items-center justify-center gap-4 p-5">
      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-red-500 font-medium text-center">Error: {error}</p>
      <p className="text-[#787689] text-xs text-center">{tokenAddress}</p>
    </div>
  </div>
);

CoinCard.displayName = 'CoinCard';
export default CoinCard;
