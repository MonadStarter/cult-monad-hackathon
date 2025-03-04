"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import "./page.css";
import { useQuery } from "@tanstack/react-query";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";
import AirdropSection from "~~/components/coin/AirdropSection";
import BackButton from "~~/components/coin/BackButton";
import BondingCurveProgress from "~~/components/coin/BondingCurveProgress";
import TradeInfo from "~~/components/coin/BuyNSell";
import CoinDetailCard from "~~/components/coin/CoinDetailCard";
import CommentsSection from "~~/components/coin/Comments";
import TradingViewChart from "~~/components/coin/TradingView";
import TransactionHistory from "~~/components/coin/TransactionHistory";
import SegmentedPanel from "~~/components/common/SegmentedPanel";
import { dummyMetadata } from "~~/constants/content";
import { fetchTokenPageData } from "~~/graphql/graphQlClient2";
import useGetMktCap from "~~/hooks/fetchPrice";
import { useTokenStore } from "~~/stores/tokenStore";
import { TradeOptions } from "~~/types/types";
import { CultTokenPageData, TokenMetadata } from "~~/types/types";
import { fetchMetadataFromIPFS, parseIPFSMetadata } from "~~/utils/externalAPIs/ipfs";

// const Transactions = React.memo(TransactionHistory);

// const LEFT_PANEL = [
//   {
//     id: "TRANSACTION_HISTORY",
//     label: "Transaction history",
//     content: <Transactions />,
//   },
//   {
//     id: "COMMENTS",
//     label: "Comments",
//     content: <CommentsSection />,
//   },
// ];

const TRADE_OPTIONS = [
  {
    id: "buy",
    label: "Buy",
    content: <TradeInfo tradeType={TradeOptions.BUY} />,
  },
  {
    id: "sell",
    label: "Sell",
    content: <TradeInfo tradeType={TradeOptions.SELL} />,
  },
];

function InfoSection() {
  return (
    <div className="content-card-merger">
      <AirdropSection />
      <BondingCurveProgress />
    </div>
  );
}

// const MOBILE_SEGMENTED_LAYOUT = [
//   {
//     id: "INFO",
//     label: "Info",
//     content: <InfoSection />,
//   },
//   {
//     id: "TRADE",
//     label: "Trade",
//     content: <Transactions />,
//   },
//   {
//     id: "COMMENTS",
//     label: "Comments",
//     content: <CommentsSection />,
//   },
// ];

export default function CoinPage() {
  const params = useParams();
  const tokenaddy = params?.id as `0x${string}`;
  const { address: accountAddress } = useAccount();
  //const { price, marketCap, circulatingSupply } = useGetMktCap({ tokenAddress: tokenaddy });
  const price = "0";
  const marketCap = "0";
  const circulatingSupply = "0";
  const { setStateFromSubgraph } = useTokenStore();

  // Fetch subgraph data via React Query using the store's tokenAddress.
  const {
    data: subgraphDataFromQuery,
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery<CultTokenPageData>({
    queryKey: ["cultTokenData", tokenaddy, accountAddress],
    queryFn: () => fetchTokenPageData(tokenaddy!),
    enabled: !!tokenaddy,
  });

  console.log("subgraphDataFromQuery", subgraphDataFromQuery);

  // Update store based on query results.
  useEffect(() => {
    const ipfsMetadata = subgraphDataFromQuery?.cultToken?.ipfsData?.content
      ? parseIPFSMetadata(subgraphDataFromQuery?.cultToken?.ipfsData?.content)
      : null;
    const metadata: TokenMetadata = {
      name: ipfsMetadata?.name || dummyMetadata.name,
      description: ipfsMetadata?.description || dummyMetadata.description,
      image: ipfsMetadata?.imageUrl || dummyMetadata.image,
      tokenAddress: tokenaddy,
      socials: ipfsMetadata?.socials || dummyMetadata.socials,
      symbol: ipfsMetadata?.symbol || dummyMetadata.symbol, // Add symbol to metadata for consistency
      marketCap: marketCap || "0", // Placeholder value
      price: price || "0", // Placeholder value
      circulatingSupply: circulatingSupply || "0", // Placeholder value
    };

    if (subgraphDataFromQuery) {
      setStateFromSubgraph(accountAddress as `0x${string}`, tokenaddy, metadata, subgraphDataFromQuery, refetch);
    }
  }, [subgraphDataFromQuery]);

  if (queryError) {
    console.log("queryError", queryError);
  }

  if (queryLoading) {
    console.log("queryLoading", queryLoading);
  }

  // useEffect(() => {
  //   if (queryError) {
  //     setError(queryError);
  //     setLoading(false);
  //   }
  // }, [queryError]);

  // // Reflect query loading state in the store.
  // useEffect(() => {
  //   if (queryLoading) {
  //     setLoading(queryLoading);
  //   }
  // }, [queryLoading]);

  return (
    <div className={"page pt-4"}>
      {/* <TradingViewChart tokenAddress={tokenaddy} interval="H" theme="light" autosize={true} /> */}

      <BackButton />
      <CoinDetailCard />
      {/* <SegmentedPanel panels={MOBILE_SEGMENTED_LAYOUT} className="sm:hidden" /> */}
      <div className="flex gap-4 max-sm:hidden">
        <div className="w-2/3 flex flex-col gap-4">
          {/* <SegmentedPanel panels={LEFT_PANEL} segmentedClassName="w-1/2" /> */}
        </div>
        <div className="w-1/3 flex flex-col gap-4">
          <SegmentedPanel panels={TRADE_OPTIONS} />
          {/* <AirdropSection />
          <BondingCurveProgress /> */}
        </div>
      </div>
    </div>
  );
}
