"use client";

import TableSection from "./TableSection";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCopyIcon, GlobeIcon, InfoIcon } from "lucide-react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
//import BackButton from "~~/components/coin/BackButton/BackButton";
import { Address } from "~~/components/scaffold-eth";
import EditProfile from "~~/components/profile/EditProfile";
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

  const copyAddress = () => {
    if (accountAddress) {
      navigator.clipboard.writeText(accountAddress);
    }
  };

  return (
    <div className="p-12 py-32 w-full min-h-screen flex flex-col items-center bg-[#080610]">
      <div className="flex flex-col lg:flex-row gap-6 mt-5 items-start w-full max-w-7xl">
        <div className="content-wrapper-card w-full lg:w-1/3 p-6 bg-[#1c1a29] rounded-2xl shadow-lg">
          {/* Profile Header */}
          <div className="flex flex-col gap-6">
            {/* User Avatar and ETH Balance */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="overflow-hidden rounded-full bg-[#2c2a39]">
                  <Panda />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-semibold text-white">James</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-sm text-gray-400 font-mono">
                      {accountAddress ? `0x${accountAddress.slice(2, 6)}...${accountAddress.slice(-4)}` : ""}
                    </div>
                    <button 
                      onClick={copyAddress} 
                      className="text-gray-400 hover:text-primary-500 transition-colors"
                      title="Copy address"
                    >
                      <ClipboardCopyIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-[#2c2a39] py-2 px-4 rounded-full text-sm">
                <span className="text-white">
                  {Number(formatEther(BigInt(profileData?.accountData?.feeCollected || "0"))).toFixed(5)} ETH
                </span>
              </div>
            </div>
            
            {/* Diamond Hand Score */}
            <div className="bg-[#272536] p-5 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-lg font-medium text-[#7e96ff]">Diamond Hand Airdrop Chance</h4>
                <button className="text-[#7e96ff]" title="Information">
                  <InfoIcon size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-400">Based on your trading activity</p>
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-[#7e96ff] font-bold text-5xl">3<span className="text-2xl">%</span></span>
                <div className="bg-[#2c2a39] p-4 rounded-full">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#7e96ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z" stroke="#7e96ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Stats Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#272536] p-4 rounded-xl">
                <h5 className="text-sm text-gray-400 mb-1">Tokens Owned</h5>
                <p className="text-3xl font-bold text-white">0</p>
              </div>
              <div className="bg-[#272536] p-4 rounded-xl">
                <h5 className="text-sm text-gray-400 mb-1">Tokens Created</h5>
                <p className="text-3xl font-bold text-white">0</p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex justify-between items-center mt-2 pt-5 border-t border-gray-800">
              <button className="bg-[#272536] p-3 rounded-lg">
                <GlobeIcon size={20} className="text-gray-400" />
              </button>
              <EditProfile />
            </div>
          </div>
        </div>
        
        <TableSection tokensOwned={tokensOwned} tokensCreated={tokensCreated} />
      </div>
    </div>
  );
}
