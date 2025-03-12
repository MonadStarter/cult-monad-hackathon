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

  // Filter trades by time range
  // return allTrades.filter(trade => {
  //   const timestamp = parseInt(trade.timestamp);
  //   return timestamp >= from && timestamp <= to;
  // });
  return allTrades;
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
    const price = ethAmount.dividedBy(tokenAmount).toNumber();
    const volume = tokenAmount.toNumber();

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
      pricescale: Math.min(10 ** String(Math.round(10000 / price)).length, 10000000000000000),
      has_intraday: true,
      intraday_multipliers: ["1", "15", "30", "60"],
      supported_resolution: supportedResolutions,
      volume_precision: 8,
      data_status: "streaming",
    };
    onResolve(params);
  },
  getBars: async (symbolInfo, resolution: string, periodParams, onResult: Function) => {
    console.log("[getBars]: Method call", symbolInfo);

    const rawTrades = await fetchHistoricalData(baseAsset.tokenAddress, periodParams.from, periodParams.to);
    console.log("RAW TRADES", rawTrades);
    const bars = processTradesToOHLC(rawTrades, resolution);

    onResult(bars, {
      noData: bars.length !== periodParams.countBack,
    });

    if (periodParams.firstDataRequest) {
      lastBarsCache.set(baseAsset.name, bars[bars.length - 1]);
    }
  },
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
