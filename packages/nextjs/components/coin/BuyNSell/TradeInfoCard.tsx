import React from "react";
import Image from "next/image";
import { formatEther, formatUnits } from "viem";
import { useTokenStore } from "~~/stores/tokenStore";
import { TokenMetadata, TradeOptions } from "~~/types/types";

interface TradeInfoCardProps {
  tokenQuote?: bigint;
  amount?: string;
  ethBalance?: bigint;
  tokenBalance?: bigint;
  mode?: TradeOptions;
  decimals?: number;
  metadata: TokenMetadata | null;
  onAmountChange: (value: string) => void;
  onMaxClick?: (value: string) => void;
}

function TradeInfoCard({
  tokenQuote,
  amount,
  ethBalance,
  tokenBalance,
  mode,
  decimals,
  onAmountChange,
  onMaxClick,
}: TradeInfoCardProps) {
  const { metadata, isLoading, error } = useTokenStore();

  if (isLoading || !metadata) {
    return (
      <div className="border border-1 border-gray-800 bg-white-4 rounded-2xl py-3 px-4 animate-pulse">
        <div className="flex justify-between">
          <div className="h-7 w-32 bg-gray-300 rounded"></div>
          <div className="h-7 w-24 bg-gray-300 rounded"></div>
        </div>
        <div className="flex justify-between mt-2">
          <div className="h-5 w-20 bg-gray-300 rounded"></div>
          <div className="h-5 w-40 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-1 border-gray-800 bg-white-4 rounded-2xl py-3 px-4">
        <div className="text-error-500">Error: {error.message}</div>
      </div>
    );
  }

  const formattedUsdValue = (Number(amount || 0) * Number(0)).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  }); //tokenData.price

  const handleMaxClick = () => {
    if (onMaxClick) {
      if (mode === "buy" && ethBalance) {
        onMaxClick(formatUnits(ethBalance, 18));
      } else if (mode === "sell" && tokenBalance) {
        onMaxClick(formatUnits(tokenBalance, decimals || 18));
      }
    }
  };

  // Display balance based on mode with ETH showing 2 decimal places
  const displayBalance =
    mode === "buy"
      ? ethBalance
        ? Number(formatUnits(ethBalance, 18)).toFixed(2)
        : "0.00"
      : tokenBalance
        ? Number(formatUnits(tokenBalance, 18)).toFixed(2) // Use nullish coalescing
        : "0.00"; // Consistent formatting with buy side

  // Display symbol based on mode
  const displaySymbol = mode === "buy" ? "ETH" : metadata.symbol;

  return (
    <div className="border border-1 border-gray-800 bg-white-4 rounded-2xl py-3 px-4">
      <div className="flex justify-between">
        <input
          type="text"
          value={amount}
          onChange={e => onAmountChange(e.target.value)}
          placeholder="0.0"
          className="font-medium text-xl bg-transparent border-none outline-none w-32"
        />
        <div className="pill-badge !bg-white-7 flex items-center gap-2">
          {mode === "sell" && metadata?.image && (
            <Image
              src={metadata.image}
              width="16"
              height="16"
              alt={`${metadata.symbol} Token`}
              className="rounded-full"
            />
          )}
          <span>{displaySymbol}</span>
        </div>
      </div>
      <div className="flex justify-between">
        <p className="text-gray-600 text-sm">{formattedUsdValue}</p>
        <div className="flex gap-1 items-center">
          <p className="text-sm text-gray-600">
            Balance: {displayBalance} {displaySymbol}
          </p>
          <button
            onClick={handleMaxClick}
            className="text-primary-400 text-sm hover:text-primary-500 transition-colors cursor-pointer"
          >
            MAX
          </button>
        </div>
      </div>
      <div className="flex w-full">
        <p className="text-sm text-gray-600">
          Receive: {formatEther(tokenQuote || BigInt(0))} {mode === "buy" ? metadata.symbol : "ETH"}
        </p>
      </div>
    </div>
  );
}

export default TradeInfoCard;
