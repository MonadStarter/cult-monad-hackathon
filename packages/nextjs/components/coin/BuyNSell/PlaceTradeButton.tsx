import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useAccount, useContractRead, useWriteContract } from "wagmi";
import { CultContractABI } from "~~/constants/abis";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { TradeOptions } from "~~/types/types";

export default function TradeButton({
  tradeType,
  amount,
  tokenAddress,
  userAddress,
  refetchData,
}: {
  tradeType: TradeOptions;
  amount: string;
  tokenAddress: `0x${string}`;
  userAddress: `0x${string}`;
  refetchData: (() => void) | null;
}) {
  const { chain } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const writeTx = useTransactor();

  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [isPendingBuy, setIsPendingBuy] = useState(false);
  const [isPendingSell, setIsPendingSell] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read allowance to determine if approval is needed
  const { data: allowance, refetch } = useContractRead({
    address: tokenAddress,
    abi: CultContractABI,
    functionName: "allowance",
    args: [userAddress, tokenAddress],
  });

  const hasApproval = allowance && BigInt(allowance) >= parseEther(amount);

  //console.log("Allowance", hasApproval, hasApproval);

  useEffect(() => {
    refetch();
  }, [userAddress, tokenAddress]);

  const writeBuyAsyncWithParams = async () => {
    setIsPendingBuy(true);
    try {
      await writeTx(() =>
        writeContractAsync({
          address: tokenAddress,
          abi: CultContractABI,
          functionName: "buy",
          value: parseEther(amount),
          args: [
            userAddress as `0x${string}`,
            userAddress as `0x${string}`,
            userAddress,
            "",
            0,
            parseEther(amount), //TODO: change based on slippage and current price
            parseEther("0"),
          ],
        }),
      );
      if (refetchData) {
        refetchData();
      }
      refetch();
    } catch (e: any) {
      setError(e.message || "Purchase failed");
    }
    setIsPendingBuy(false);
  };

  const writeSellAsyncWithParams = async () => {
    setIsPendingSell(true);
    try {
      await writeTx(() =>
        writeContractAsync({
          address: tokenAddress,
          abi: CultContractABI,
          functionName: "sell",
          args: [
            parseEther(amount),
            userAddress as `0x${string}`,
            userAddress as `0x${string}`,
            "",
            0,
            parseEther("0"), //TODO: change based on slippage and current price
            parseEther("0"),
          ],
        }),
      );
      if (refetchData) {
        refetchData();
      }
      refetch();
    } catch (e: any) {
      setError(e.message || "Sale failed");
    }
    setIsPendingSell(false);
  };

  const writeApproveAsyncWithParams = async () => {
    setIsPendingApproval(true);
    try {
      await writeTx(() =>
        writeContractAsync({
          address: tokenAddress,
          abi: CultContractABI,
          functionName: "approve",
          args: [tokenAddress, parseEther(amount)],
        }),
      );
      if (refetchData) {
        refetchData();
      }
      refetch();
    } catch (e: any) {
      setError(e.message || "Approval failed");
    }
    setIsPendingApproval(false);
  };

  const getButtonConfig = () => {
    if (tradeType === TradeOptions.SELL) {
      if (isPendingApproval) {
        return { text: "Waiting for Approval Confirmation...", handler: () => {}, disabled: true };
      }
      if (!hasApproval) {
        return {
          text: isPendingApproval ? "Confirm Approval in Wallet..." : "Approve Tokens",
          handler: writeApproveAsyncWithParams,
          disabled: isPendingApproval,
        };
      }
      if (isPendingSell) {
        return { text: "Waiting for Sell Confirmation...", handler: () => {}, disabled: true };
      }
      return {
        text: isPending ? "Confirm Sale in Wallet..." : "Sell Tokens",
        handler: writeSellAsyncWithParams,
        disabled: isPending || isPendingSell,
      };
    }

    if (isPendingBuy) {
      return { text: "Waiting for Buy Confirmation...", handler: () => {}, disabled: true };
    }
    return {
      text: isPending ? "Confirm Purchase in Wallet..." : "Buy Tokens",
      handler: writeBuyAsyncWithParams,
      disabled: isPending || isPendingBuy,
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <div>
      <button
        onClick={buttonConfig.handler}
        disabled={buttonConfig.disabled || !amount || Number(amount) <= 0}
        className="bg-primary-500 w-full mt-2 justify-center px-4 py-2 rounded-lg text-white hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {buttonConfig.text}
      </button>
      {error && <p className="text-error-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
