"use client";

import TableSection from "./TableSection";
import { useQuery } from "@tanstack/react-query";
import { GlobeIcon } from "lucide-react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
//import BackButton from "~~/components/coin/BackButton/BackButton";
import { Address } from "~~/components/scaffold-eth";
import { fetchTokensCreated } from "~~/graphql/graphQlClient2";
import { Panda } from "~~/icons/symbols";
import { Balance, TokenCreated, TokensCreatedResponse } from "~~/types/types";

export default function Profile() {
  const { address: accountAddress } = useAccount();

  const {
    data: profileData,
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery<TokensCreatedResponse>({
    queryKey: ["userProfileData", accountAddress],
    queryFn: () => fetchTokensCreated(accountAddress!),
    enabled: !!accountAddress,
  });

  if (queryError) {
    console.log("queryError", queryError);
  }

  if (queryLoading) {
    console.log("queryLoading", queryLoading);
  }

  console.log("PROFILE DATA", profileData);

  let tokensOwned = profileData?.accountData?.balances;
  if (!tokensOwned || tokensOwned.length === 0) {
    tokensOwned = [];
  }

  let tokensCreated = profileData?.accountData?.created;
  if (!tokensCreated || tokensCreated.length === 0) {
    tokensCreated = [];
  }

  return (
    <div className="p-12 py-32 w-full h-screen flex flex-col items-center">
      <div className="flex gap-4 mt-5 items-start w-full">
        <div className="content-wrapper-card w-2/6 p-5">
          <div className="flex flex-col gap-y-5">
            <div className="flex justify-between items-start">
              <div className="rounded-full border border-white-12 overflow-hidden">
                <Panda />
              </div>
              <h6 className="text-xs py-1 px-2 bg-white-7 rounded-xl">
                {Number(formatEther(BigInt(profileData?.accountData?.feeCollected || "0"))).toFixed(5)} ETH
              </h6>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-y-1 items-start">
                <h3>{profileData?.accountData?.slug || "James"}</h3>
                <div className="flex gap-1 items-center">
                  <Address address={accountAddress} size="xl" />
                </div>
              </div>
              <div className="flex flex-col gap-y-1 items-end">
                <h3 className="text-blue-500">{profileData?.accountData?.diamondHandProbability}%</h3>
                <a
                  href={"x.com/cultdottrade"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gray-badge hover:bg-gray-700 transition-colors"
                >
                  <GlobeIcon className="m-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="w-"> */}
        {/* <NoAccountAdded /> */}
        <TableSection tokensOwned={tokensOwned} tokensCreated={tokensCreated} />
        {/* </div> */}
      </div>
    </div>
  );
}
