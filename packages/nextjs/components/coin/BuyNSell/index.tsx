"use client";

import React, { useState } from "react";
import TradeButton from "./PlaceTradeButton";
import TradeInfoCard from "./TradeInfoCard";
import { formatUnits, parseEther, parseUnits } from "viem";
import { useBalance, useContractRead } from "wagmi";
import { CultContractABI } from "~~/constants/abis";
import { useTokenStore } from "~~/stores/tokenStore";
// import { useTokenStore } from "~~/stores/tokenStore";
import { TradeOptions } from "~~/types/types";

const STEPPER_PERCENTAGES = ["25", "50", "75", "100"];

function Trade({ tradeType }: { tradeType: TradeOptions }) {
  const { tokenAddress, userAddress, metadata, isLoading, error, refetch } = useTokenStore();
  //const { tokenAddress, userAddress, refetch } = useTokenStore();
  const [amount, setAmount] = useState("");
  //const { address: userAddress } = useAccount();

  const { data: ethBuyQuote } = useContractRead({
    address: tokenAddress,
    abi: CultContractABI,
    functionName: "getEthBuyQuote",
    args: [parseEther(amount)],
  });

  const { data: tokenSellQuote } = useContractRead({
    address: tokenAddress,
    abi: CultContractABI,
    functionName: "getTokenSellQuote",
    args: [parseEther(amount)],
  });

  // Fetch ETH balance for buy
  const { data: ethBalance } = useBalance({
    address: userAddress,
    query: {
      enabled: tradeType === "buy" && !!userAddress,
    },
    unit: "wei",
  });

  const { data: tokenBalance } = useBalance({
    address: userAddress,
    token: tokenAddress as string,
    query: {
      enabled: tradeType === "sell" && !!userAddress && !!tokenAddress,
    },
    unit: "wei",
  });

  const decimals = 18;

  const handlePercentageClick = (percentage: string) => {
    if (!userAddress) return;

    const balance = tradeType === "buy" ? ethBalance?.value : tokenBalance?.value;
    const tokenDecimals = decimals || 18;

    if (balance) {
      const maxAmount = formatUnits(balance, tokenDecimals);
      const calculatedAmount = (Number(maxAmount) * Number(percentage)) / 100;
      setAmount(calculatedAmount.toString());
    }
  };

  const handleAmountChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const sanitizedValue = value.replace(/[^\d.]/g, "");

    // Ensure only one decimal point
    const decimalCount = (sanitizedValue.match(/\./g) || []).length;
    if (decimalCount > 1) return;

    // Prevent more than 18 decimal places
    const parts = sanitizedValue.split(".");
    if (parts[1] && parts[1].length > 18) return;

    setAmount(sanitizedValue);
  };

  const handleMaxClick = (maxAmount: string) => {
    setAmount(maxAmount);
  };

  return (
    <div className="flex flex-col gap-4">
      <TradeInfoCard
        tokenQuote={tradeType === "buy" ? ethBuyQuote : tokenSellQuote}
        amount={amount}
        ethBalance={ethBalance?.value}
        tokenBalance={tokenBalance?.value}
        mode={tradeType}
        decimals={tokenBalance?.decimals}
        metadata={metadata}
        onAmountChange={handleAmountChange}
        onMaxClick={handleMaxClick}
      />
      <div className="flex gap-2">
        {STEPPER_PERCENTAGES.map((step, idx) => (
          <button
            key={idx}
            onClick={() => handlePercentageClick(step)}
            className="pill-badge !bg-white-7 hover:bg-gray-700 transition-colors cursor-pointer"
          >
            {step}%
          </button>
        ))}
      </div>
      <TradeButton
        tradeType={tradeType}
        amount={amount}
        userAddress={userAddress as `0x${string}`}
        tokenAddress={tokenAddress}
        refetchData={refetch}
      />
    </div>
  );
}

export default Trade;
