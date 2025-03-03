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
      queryFn: fetchTopCoins, // No need for `async/await` here since `fetchTopCoins` is already a promise
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
        <section className="hero-section">
          <div className="page py-20 px-24 flex items-center justify-between flex-col sm:flex-row gap-10 sm:gap-0">
            <div className="hero-text-section">
              <h1>The First Meme fair launch platform on Monad.</h1>
              <p className="text-gray-500 font-medium">
                Your ultimate destination for meme coins. Join the fun and explore the latest trends in the crypto
                world!
              </p>
              <LaunchToken />
            </div>
            <TopCoins />
          </div>
        </section>
        <DiscoverCoins />
        <PlatformMetrics />
      </div>
    </HydrationBoundary>
  );
}
