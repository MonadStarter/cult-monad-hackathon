"use client";

import React, { Suspense, useEffect, useState } from "react";
import CoinCard from "./CoinCard";
import DiscoverFilters from "./Filters";
import LoadMoreButton from "./LoadMoreButton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { dummyMetadata } from "~~/constants/content";
import { fetchDiscoverTokenData } from "~~/graphql/graphQlClient";
import { RefreshIcon, SettingsIcon } from "~~/icons/actions";
import { CultTokenMetadata, TokenMetadata } from "~~/types/types";
import { parseIPFSMetadata } from "~~/utils/externalAPIs/ipfs";

const ITEMS_PER_PAGE = 12;

function DiscoverCoins() {
  const {
    data: tokenListData, // Renamed to avoid confusion with metadata data
    isLoading,
    // isFetchingNextPage,
    // isFetchingPreviousPage,
    // fetchNextPage,
    // fetchPreviousPage,
    // hasNextPage,
    // hasPreviousPage,
    //refetch: refetchList, // Renamed to differentiate from metadata refetching
  } = useInfiniteQuery({
    queryKey: ["latestCoins"],
    queryFn: async ({ pageParam = 1 }) => {
      const skip = (pageParam - 1) * ITEMS_PER_PAGE;
      return fetchDiscoverTokenData(ITEMS_PER_PAGE, skip);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.cultTokens.length === ITEMS_PER_PAGE ? allPages.length + 1 : undefined;
    },
    // getPreviousPageParam: (firstPage, allPages) => {
    //   return allPages.length > 1 ? allPages.length - 1 : undefined;
    // },
    // Keep data in the cache for faster subsequent queries
    //    staleTime: Infinity,

    initialPageParam: 1,
  });

  const tokens: CultTokenMetadata[] = tokenListData?.pages.flatMap(page => page.cultTokens) || [];

  if (isLoading || tokens.length === 0) {
    <section className="page py-20 flex flex-col gap-12 justify-center items-center">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, index) => (
          <LoadingCard key={`loading-${index}`} />
        ))}
      </div>
    </section>;
  }

  //console.log("RENDERING", tokenListData, tokens, isLoading);
  return (
    <section className="page py-20 flex flex-col gap-12 justify-center items-center">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {tokens.map((token, idx) => {
          const ipfsMetadata = token?.ipfsData?.content ? parseIPFSMetadata(token.ipfsData.content) : null;
          const metadata: TokenMetadata = {
            name: token.name,
            description: ipfsMetadata?.description || dummyMetadata.description,
            image: ipfsMetadata?.imageUrl || dummyMetadata.image,
            tokenAddress: token.tokenAddress,
            socials: ipfsMetadata?.socials || dummyMetadata.socials,
            symbol: token.symbol,
            marketCap: "0", // Placeholder value
          };

          return (
            <CoinCard
              key={token.tokenAddress}
              metadata={metadata}
              rank={idx}
              loading={false} // No additional async loading since metadata is parsed instantly
              error={null} // No need for error handling on metadata fetch
            />
          );
        })}
      </div>
      {/* {hasNextPage && (
        <LoadMoreButton isLoading={isFetchingNextPage} onClick={fetchNextPage}>
          Load More
        </LoadMoreButton>
      )} */}
    </section>
  );
}

const LoadingCard = () => <div className="content-wrapper-card w-full h-64 animate-pulse bg-gray-100 rounded-lg" />;

export default DiscoverCoins;
