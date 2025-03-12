"use client";

import Pagination from "../common/Pagination";
import { Address } from "../scaffold-eth";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Address as AddressType, formatEther } from "viem";
import Table, { TableColumnInterface, TableValueInterface } from "~~/components/common/Table";
import { fetchTopHolders } from "~~/graphql/graphQlClient2";
import { UserIcon } from "~~/icons/symbols";
import { useTokenStore } from "~~/stores/tokenStore";

export enum ColumnType {
  HOLDER = "account",
  PERCENTAGE = "percentage",
}

const HOLDER_COLUMN: TableColumnInterface = {
  title: "Holder",
  accessor: (rowData: TableValueInterface) => rowData[ColumnType.HOLDER],
  widthPercentage: 22,
  renderer: (value: string | number) => <h6 className="font-bold text-primary-400">{value}</h6>,
};

const PERCENTAGE_COLUMN: TableColumnInterface = {
  title: "Percentage",
  accessor: (rowData: TableValueInterface) => `${rowData[ColumnType.PERCENTAGE]}%`,
  widthPercentage: 22,
  renderer: (value: string | number) => <p className="text-sm text-right">{value}</p>,
};

const BONDING_CURVE_TABLE_COLUMNS = [HOLDER_COLUMN, PERCENTAGE_COLUMN];
const ITEMS_PER_PAGE = 10;
function HolderDistribution() {
  const { tokenAddress, subgraphData, metadata, isLoading } = useTokenStore();

  const {
    data,
    isLoading: isLoadingHolders,
    // isFetchingNextPage,
    // isFetchingPreviousPage,
    // fetchNextPage,
    // fetchPreviousPage,
    // hasNextPage,
    // hasPreviousPage,
    // refetch,
  } = useInfiniteQuery({
    queryKey: ["topHolders", tokenAddress],
    queryFn: async ({ pageParam = 1 }) => {
      const skip = (pageParam - 1) * ITEMS_PER_PAGE;
      return fetchTopHolders(tokenAddress, ITEMS_PER_PAGE, skip);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.tokenBalances.length === ITEMS_PER_PAGE ? allPages.length + 1 : undefined;
    },
    getPreviousPageParam: (firstPage, allPages) => {
      return allPages.length > 1 ? allPages.length - 1 : undefined;
    },
    initialPageParam: 1,
    refetchInterval: 3000,
  });

  console.log("RENDERED HOLDER", data);

  const renderedHolders: TableValueInterface[] =
    data?.pages.flatMap(page =>
      page.tokenBalances.map(holder => ({
        [ColumnType.HOLDER]: (
          <Address address={holder.account.id as AddressType} format="short" size="xs" onlyEnsOrAddress={true} />
        ),
        [ColumnType.PERCENTAGE]: (
          (parseFloat(formatEther(BigInt(holder.value))) / Number(metadata?.circulatingSupply)) *
          100
        ).toFixed(2),
      })),
    ) ?? [];

  //console.log("RENDERED HOLDER", renderedHolders);

  return (
    <div className="content-wrapper-card p-5 flex flex-col gap-5">
      <div className="flex justify-between">
        <h5>Holder Card Distribution</h5>
        <div className="flex gap-1 items-center">
          {isLoading ? (
            <div className="content-wrapper-card w-full h-1 animate-pulse bg-gray-100 rounded-full" />
          ) : (
            <div>
              {" "}
              <UserIcon />
              <h5>{subgraphData?.cultToken?.holderCount}</h5>
            </div>
          )}
        </div>
      </div>
      {isLoadingHolders ? (
        <div className="content-wrapper-card w-full h-1 animate-pulse bg-gray-100 rounded-full" />
      ) : (
        <div>
          {" "}
          <Table values={renderedHolders} columns={BONDING_CURVE_TABLE_COLUMNS} />
          <Pagination totalPages={Math.ceil(renderedHolders.length / 10)} small={true} />{" "}
        </div>
      )}
    </div>
  );
}

export default HolderDistribution;
