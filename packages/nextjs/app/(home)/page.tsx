import "./page.css";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import DiscoverCoins from "~~/components/home/DiscoverCoins";
import LaunchToken from "~~/components/home/LaunchToken";
import PlatformMetrics from "~~/components/home/PlatformMetrics";
import TopCoins from "~~/components/home/TopCoins";
import { fetchDiscoverTokenData, fetchTopCoins } from "~~/graphql/graphQlClient2";
import { CultTokensResponse } from "~~/types/types";

const ITEMS_PER_PAGE = 12;

export default async function Home() {
  const queryClient = new QueryClient();

  // Fetch data for TopCoins and DiscoverCoins in parallel
  await Promise.all([
    // Prefetch data for TopCoins
    queryClient.prefetchQuery({
      queryKey: ["topCoins"],
      queryFn: fetchTopCoins,
    }),

    // Prefetch infinite query data for DiscoverCoins
    queryClient.prefetchInfiniteQuery({
      queryKey: ["latestCoins"],
      async queryFn({ pageParam = 1 }): Promise<CultTokensResponse> {
        return await fetchDiscoverTokenData(ITEMS_PER_PAGE, pageParam * ITEMS_PER_PAGE);
      },
      getNextPageParam: (lastPage: CultTokensResponse, allPages: CultTokensResponse[]) => {
        return lastPage.cultTokens.length === ITEMS_PER_PAGE ? allPages.length + 1 : undefined;
      },
      initialPageParam: 1,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="relative">
        {/* Hero section with animated background */}
        <section className="hero-section">
          {/* Floating particles effect */}
          <div className="particles-container">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
          </div>
          
          <div className="page py-20 px-24 flex items-center justify-between flex-col sm:flex-row gap-10 sm:gap-0">
            <div className="hero-text-section">
              <h1 className="hero-title">Create Cults on Monad.</h1>
              <p className="hero-description text-gray-500 font-medium">
                Your ultimate destination for cultural tokens. Join the fun and explore the latest trends in the crypto
                world!
              </p>
              <div className="launch-button-container mt-8 flex items-center">
                <LaunchToken />
                <div className="ml-4 bg-[#272536]/50 backdrop-blur-sm px-3 py-2 rounded-lg hidden md:block">
                  <p className="text-sm text-[#787689]">
                    <span className="text-white-500">250+</span> tokens launched
                  </p>
                </div>
              </div>
            </div>
            <TopCoins />
          </div>
        </section>
        
        {/* Discover section with scroll reveal */}
        <div className="discover-section">
          <DiscoverCoins />
        </div>
        
        {/* Platform metrics with counter animation */}
        {/* <div className="metrics-reveal">
          <PlatformMetrics />
        </div> */}
      </div>
    </HydrationBoundary>
  );
}
