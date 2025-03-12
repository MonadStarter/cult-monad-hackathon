import { Dispatch, SetStateAction } from "react";
//import { Asset, Bar, Trade } from "../../../features/asset/models";
//import { GET } from "../../../utils/fetch";
import { getNextBarTime } from "./stream";
import BigNumber from "bignumber.js";
import { fetchTokenTrades } from "~~/graphql/graphQlClient2";
import { TokenMetadata, TokenTrade } from "~~/types/types";

export const supportedResolutions = ["1", "5", "15", "60", "120", "240", "24H", "7D", "30D"];

const lastBarsCache = new Map();
const sockets = new Map();

async function fetchHistoricalData(tokenAddress: string, from: number, to: number): Promise<TokenTrade[]> {
  const ITEMS_PER_PAGE = 100;
  const allTrades = [];
  let page = 1;
  let hasMore = true;

  const response = await fetchTokenTrades(tokenAddress as `0x${string}`, ITEMS_PER_PAGE, (page - 1) * ITEMS_PER_PAGE);
  console.log("RESPONSE FOR GRAPH", response);
  allTrades.push(...response.tokenTrades);
  hasMore = response.tokenTrades.length === ITEMS_PER_PAGE;

  //Filter trades by time range
  return allTrades.filter(trade => {
    const timestamp = parseInt(trade.timestamp);
    return timestamp >= from && timestamp <= to;
  });
  //return allTrades;
}

function resolutionToMilliseconds(resolution: any) {
  const numeric = parseInt(resolution);
  if (isNaN(numeric)) {
    switch (resolution.toUpperCase()) {
      case "D":
        return 86400000;
      case "W":
        return 604800000;
      default:
        return 86400000;
    }
  }
  return numeric * 60000;
}

function processTradesToOHLC(trades: TokenTrade[], resolution: string): any[] {
  const bars = [];
  const resolutionMs = resolutionToMilliseconds(resolution);

  trades.sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));

  let currentBar = null;

  for (const trade of trades) {
    const timestampMs = parseInt(trade.timestamp) * 1000;
    const barTime = Math.floor(timestampMs / resolutionMs) * resolutionMs;

    const ethAmount = new BigNumber(trade.ethAmount);
    const tokenAmount = new BigNumber(trade.tokenAmount);

    if (tokenAmount.isZero()) continue;

    // Scale the price to be more manageable (multiply by 10^12 to bring to a normal range)
    const price = ethAmount.dividedBy(tokenAmount).multipliedBy(1e12).toNumber();

    // Scale down the volume to a reasonable range (divide by 10^18)
    const volume = tokenAmount.dividedBy(1e18).toNumber();

    if (!currentBar || currentBar.time !== barTime) {
      if (currentBar) bars.push(currentBar);
      currentBar = {
        time: barTime,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: volume,
      };
    } else {
      currentBar.high = Math.max(currentBar.high, price);
      currentBar.low = Math.min(currentBar.low, price);
      currentBar.close = price;
      currentBar.volume = (currentBar.volume || 0) + volume;
    }
  }

  if (currentBar) bars.push(currentBar);
  return bars;
}

export const Datafeed = (
  baseAsset: TokenMetadata,
  //isPair: boolean,
  //shouldLoadMoreTrade: boolean,
  //setPairTrades: Dispatch<SetStateAction<TokenTrade[]>>,
  //setFadeIn?: Dispatch<SetStateAction<string[]>>,
  //isUsd?: boolean,
) => ({
  onReady: (callback: Function) => {
    console.log("[onReady]: Method call");
    callback({ supported_resolutions: supportedResolutions });
  },
  resolveSymbol: (symbolName: string, onResolve: Function) => {
    console.log("[resolveSymbol]: Method call", symbolName);
    const price = Number(baseAsset.price) || 1;
    const params = {
      name: symbolName,
      description: "",
      type: "crypto",
      session: "24x7",
      ticker: symbolName,
      minmov: 1,
      // pricescale: Math.min(10 ** String(Math.round(10000 / price)).length, 10000000000000000),
      pricescale: 1000000,
      has_intraday: true,
      intraday_multipliers: ["1", "15", "30", "60"],
      supported_resolution: supportedResolutions,
      volume_precision: 2,
      data_status: "streaming",
    };
    onResolve(params);
  },
  getBars: async (symbolInfo, resolution: string, periodParams, onResult: Function) => {
    console.log("GetBars params:", {
      symbol: symbolInfo.name,
      resolution,
      from: new Date(periodParams.from * 1000).toISOString(),
      to: new Date(periodParams.to * 1000).toISOString(),
      firstRequest: periodParams.firstDataRequest,
    });
    try {
      const rawTrades = await fetchHistoricalData(baseAsset.tokenAddress, periodParams.from, periodParams.to);
      console.log(`Fetched ${rawTrades.length} trades`);

      const bars = processTradesToOHLC(rawTrades, resolution);
      console.log(`Generated ${bars.length} bars`);

      // Important: ensure you're returning the right noData value
      // If we found any bars, set noData to false
      const noData = bars.length === 0;

      onResult(bars, { noData });

      if (periodParams.firstDataRequest && bars.length > 0) {
        lastBarsCache.set(baseAsset.name, bars[bars.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching bars:", error);
      onResult([], { noData: true });
    }
  },

  // getBars: async (symbolInfo, resolution: string, periodParams, onResult: Function) => {
  //   // For testing, generate some fake data to see if the chart works at all
  //   console.log("GetBars called with", { resolution, from: periodParams.from, to: periodParams.to });
  //   const testBars = [];
  //   const now = Math.floor(Date.now() / 1000);

  //   // Generate 10 test bars
  //   for (let i = 0; i < 10; i++) {
  //     const time = (now - (10 - i) * 3600) * 1000; // hourly bars
  //     testBars.push({
  //       time: time,
  //       open: 10000 + i * 100,
  //       high: 10000 + i * 100 + 50,
  //       low: 10000 + i * 100 - 50,
  //       close: 10000 + i * 100 + (Math.random() * 100 - 50),
  //       volume: 1000 + Math.random() * 1000,
  //     });
  //   }

  //   console.log("Test bars:", testBars);
  //   onResult(testBars, { noData: true });
  // },

  searchSymbols: () => {},
  subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) => {
    console.log("Subscribinnnng");
    // const socket = new WebSocket(process.env.NEXT_PUBLIC_PRICE_WSS_ENDPOINT as string);
    // const params = {
    //   interval: 5,
    // };

    // if (isPair) params["address"] = baseAsset?.address;
    // else {
    //   (params["asset"] = baseAsset.contracts[0]), (params["blockchain"] = baseAsset.blockchains[0]);
    // }

    // socket.addEventListener("open", () => {
    //   socket.send(
    //     JSON.stringify({
    //       type: "pair",
    //       authorization: process.env.NEXT_PUBLIC_PRICE_KEY,
    //       payload: params,
    //     }),
    //   );
    // });

    // socket.addEventListener("message", event => {
    //   const trade = JSON.parse(event.data) as Trade;
    //   try {
    //     if (trade?.blockchain && setPairTrades && shouldLoadMoreTrade)
    //       setPairTrades(prev => [trade, ...prev.slice(0, prev.length - 1)]);

    //     setFadeIn(prev => [...prev, trade?.hash]);
    //     const timeout = setTimeout(() => setFadeIn([]), 2000);

    //     const price = trade.token_amount_usd / trade.token_amount;

    //     const lastDailyBar = lastBarsCache.get(baseAsset.name);
    //     const nextDailyBarTime = getNextBarTime(resolution, lastDailyBar.time);
    //     let bar: Bar;

    //     if (trade.date >= nextDailyBarTime) {
    //       bar = {
    //         time: nextDailyBarTime,
    //         open: lastDailyBar.close,
    //         high: price,
    //         low: price,
    //         close: price,
    //       };
    //     } else {
    //       bar = {
    //         ...lastDailyBar,
    //         high: Math.max(lastDailyBar.high, price),
    //         low: Math.min(lastDailyBar.low, price),
    //         close: price,
    //       };
    //     }

    //     onRealtimeCallback(bar);

    //     return () => clearTimeout(timeout);
    //   } catch (e) {
    //     // console.log(e);
    //   }
    // });

    // console.log("Subscribe", baseAsset.name + "-" + subscriberUID);
    // sockets.set(baseAsset.name + "-" + subscriberUID, socket);
  },
  unsubscribeBars: subscriberUID => {
    console.log("Unsubscribe", baseAsset.name + "-" + subscriberUID);
    //sockets.get(baseAsset.name + "-" + subscriberUID).close();
  },
  getMarks: () => ({}),
  getTimeScaleMarks: () => ({}),
  getServerTime: () => ({}),
});
