"use client";

import React, { Suspense, useEffect, useState } from "react";
import CoinCard from "./CoinCard";
import DiscoverFilters from "./Filters";
import LoadMoreButton from "./LoadMoreButton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArrowUpIcon } from "lucide-react";
import { dummyMetadata } from "~~/constants/content";
import { fetchDiscoverTokenData } from "~~/graphql/graphQlClient2";
import { RefreshIcon, SettingsIcon } from "~~/icons/actions";
import { CultTokenMetadata, TokenMetadata } from "~~/types/types";
import { parseIPFSMetadata } from "~~/utils/externalAPIs/ipfs";

const ITEMS_PER_PAGE = 12;

function DiscoverCoins() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll events for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const {
    data: tokenListData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey: ["latestCoins"],
    queryFn: async ({ pageParam = 1 }) => {
      const skip = (pageParam - 1) * ITEMS_PER_PAGE;
      return fetchDiscoverTokenData(ITEMS_PER_PAGE, skip);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.cultTokens.length === ITEMS_PER_PAGE ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Create a deduped tokens array by using a Map with tokenAddress as the key
  const tokensMap = new Map();
  if (tokenListData?.pages) {
    tokenListData.pages.forEach(page => {
      page.cultTokens.forEach(token => {
        if (!tokensMap.has(token.tokenAddress)) {
          tokensMap.set(token.tokenAddress, token);
        }
      });
    });
  }
  const tokens: CultTokenMetadata[] = Array.from(tokensMap.values());

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      scrollToTop();
    } catch (error) {
      console.error("Error refreshing token data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <section className="page py-20 flex flex-col gap-12">
        <div className="max-w-screen-2xl mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Discover Tokens</h2>
            <p className="text-[#787689]">Explore the latest cultural tokens on Monad</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingCard key={`loading-${index}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page py-20 flex flex-col gap-12 relative">
      <div className="max-w-screen-2xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Discover Tokens</h2>
            <p className="text-[#787689]">
              Explore the latest cultural tokens on Monad
            </p>
          </div>
          <button 
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg 
              ${isRefreshing ? 'bg-[#272536] cursor-not-allowed' : 'bg-[#27253680] hover:bg-[#272536]'} 
              transition-colors
            `}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <span className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}>
              <RefreshIcon />
            </span>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 mb-4 rounded-full bg-[#27253680] flex items-center justify-center">
              <span className="w-10 h-10 text-[#787689]">
                <SettingsIcon />
              </span>
            </div>
            <h3 className="text-xl font-medium mb-2">No tokens found</h3>
            <p className="text-[#787689] max-w-md">No tokens have been created yet. Be the first to launch a cultural token on Monad!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                    rank={idx + 1}
                    loading={false}
                    error={null}
                  />
                );
              })}
            </div>
            
            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center mt-10">
                <LoadMoreButton 
                  onClick={fetchNextPage} 
                  disabled={isFetchingNextPage} 
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <ArrowUpIcon className="w-6 h-6 text-white" />
        </button>
      )}
    </section>
  );
}

const LoadingCard = () => <div className="content-wrapper-card w-full h-64 animate-pulse bg-[#272536] rounded-xl" />;

export default DiscoverCoins;
