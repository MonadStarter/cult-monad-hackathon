"use client";

import { formatEther } from "viem";
import { useContractReads, useWriteContract } from "wagmi";
import { AirdropContractABI } from "~~/constants/abis";
import { MERKLE_PROOFS } from "~~/constants/merkleRoots";
import { useTransactor } from "~~/hooks/scaffold-eth/useTransactor";
//import { UserIcon } from "~~/icons/symbols";
import { useTokenStore } from "~~/stores/tokenStore";

//TODO: this should be from contract or store in event
function AirdropSection() {
  const { userAddress, subgraphData } = useTokenStore();

  const { writeContractAsync } = useWriteContract();
  const writeTx = useTransactor();

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        address: subgraphData?.cultToken?.airdropContract.id,
        abi: AirdropContractABI,
        functionName: "totalAirdropAmount",
      },
      {
        address: subgraphData?.cultToken?.airdropContract.id,
        abi: AirdropContractABI,
        functionName: "canClaim",
        args: [userAddress, BigInt(500000), [MERKLE_PROOFS[0].merkleProofs[0]]], //TODO: change to user address, amount should come from event
      },
    ],
    query: {
      enabled: !!subgraphData?.cultToken?.airdropContract.id,
    },
  });
  if (subgraphData?.cultToken?.airdropContract.id === undefined) {
    return <div>Loading...</div>;
  }

  const writeBuyAsyncWithParams = async () => {
    try {
      await writeTx(() =>
        writeContractAsync({
          address: subgraphData?.cultToken?.airdropContract.id!,
          abi: AirdropContractABI,
          functionName: "claim",
          args: [BigInt(500000), [MERKLE_PROOFS[0].merkleProofs[0]]],
        }),
      );
    } catch (e: any) {
      console.log(e.message || "Purchase failed");
    }
  };

  if (isError) {
    console.log("error", isError);
  }
  if (isLoading) {
    console.log("loading", isLoading);
  }

  const claimAmount = data?.[0].result ? formatEther(data?.[0].result.toString()) / 2 : 0;
  const canClaim = data?.[1].result ? data?.[1].result : false;

  console.log("claimAmount", subgraphData);
  console.log("canClaim", canClaim);

  return (
    <div className="content-wrapper-card p-5 flex flex-col gap-5">
      <div className="flex justify-between">
        <h5>Airdrop</h5>
        {/* <div className="flex gap-1 items-center">
          <UserIcon />
          <h5>{subgraphData?.cultToken?.holderCount}</h5>
        </div> */}
      </div>
      {/* <ProgressBar current={20} /> */}
      {/* <p className="text-white-76 text-sm">
        You can claim {subgraphData?.cultToken?.symbol} still available for sale in the bonding curve.
      </p> */}
      {canClaim ? (
        <p className="text-white-76 text-sm">
          You can claim {claimAmount} {subgraphData?.cultToken?.symbol} allocation for your airdrop
        </p>
      ) : (
        <p className="text-white-76 text-sm">
          You do not have any allocation, diamond hand tokens to increase chances of next airdrop
        </p>
      )}

      {canClaim && (
        <button
          onClick={() => writeBuyAsyncWithParams()}
          className="bg-primary-500 w-full mt-2 justify-center px-4 py-2 rounded-lg text-white hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Claim
        </button>
      )}
    </div>
  );
}

export default AirdropSection;
