import { useParams } from "next/navigation";
import Pagination from "../common/Pagination";
import Table from "../common/Table";
import { Address } from "../scaffold-eth";
import { useInfiniteQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Address as AddressType, formatEther } from "viem";
//import { TRANSACTIONS_DUMMY_DATA } from "~~/constants/mockData";
import { columns } from "~~/constants/transactionTableColumn";
import { fetchTokenTrades } from "~~/graphql/graphQlClient2";
import { formatLargeNumber } from "~~/lib/utils";
import { TokenTrade } from "~~/types/types";

export const transformTrades = (trades: TokenTrade[]) => {
  return trades.map(trade => ({
    account: <Address address={trade.trader.id as AddressType} format="short" size="xs" onlyEnsOrAddress={true} />,
    type: trade.tradeType,
    eth: formatLargeNumber(formatEther(BigInt(trade.ethAmount)), 6),
    token: formatLargeNumber(formatEther(BigInt(trade.tokenAmount))),
    date: formatDistanceToNow(new Date(Number(trade.timestamp) * 1000), { addSuffix: true }),
    transaction: trade.transactionHash,
  }));
};

const ITEMS_PER_PAGE = 20;
function TransactionHistory() {
  const params = useParams();
  const tokenaddy = params?.id as `0x${string}`;
  const {
    data,
    isLoading,
    isError,
    // isFetchingNextPage,
    // isFetchingPreviousPage,
    // fetchNextPage,
    // fetchPreviousPage,
    // hasNextPage,
    // hasPreviousPage,
    // refetch,
  } = useInfiniteQuery({
    queryKey: ["tokenTrades", tokenaddy],
    queryFn: async ({ pageParam = 1 }) => {
      const skip = (pageParam - 1) * ITEMS_PER_PAGE;
      return fetchTokenTrades(tokenaddy, ITEMS_PER_PAGE, skip);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.tokenTrades.length === ITEMS_PER_PAGE ? allPages.length + 1 : undefined;
    },
    getPreviousPageParam: (firstPage, allPages) => {
      return allPages.length > 1 ? allPages.length - 1 : undefined;
    },
    initialPageParam: 1,
    refetchInterval: 3000,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading data</p>;

  // Flatten data pages into a single array
  const trades = data?.pages.flatMap(page => page.tokenTrades) || [];
  const transformedTrades = transformTrades(trades);
  return (
    <>
      {/* <TradingViewChart
            baseAsset={metadata}
            isPair={true}
            //setFadeIn={setFadeIn}
            //isUsd={isAssetPage ? undefined : !switchedToNative}
            //setPairTrades={setGlobalPairs}
            //shouldLoadMoreTrade={orderBy === "desc"}
            extraCss="min-h-[500px] lg:min-h-[370px] md:min-h-[320px] w-full md:w-full mx-auto h-[520px] lg:h-[420px] md:h-[370px] mt-2.5 md:mt-0"
          /> */}
      <div className="content-card-merger">
        <div className="content-wrapper-card w-200 h-200"></div>
        <div className="flex flex-col gap-5">
          <Table values={transformedTrades} columns={columns} />
          <Pagination totalPages={10} sibling={2} className="w-1/2" />
        </div>
      </div>
    </>
  );
}

export default TransactionHistory;
