import { BigNumber } from "bignumber.js";
import { fetchTokenTrades } from "~~/graphql/graphQlClient2";

export class DataFeed {
  constructor(tokenAddress) {
    console.log("DataFeed constructor");
    this.tokenAddress = tokenAddress;
    this.resolution = null;
    this.lastBar = null;
    this.subscribers = new Map();
  }

  onReady(callback) {
    console.log("[onReady]: Method call");
    setTimeout(() => callback({ supported_resolutions: ["1", "5", "15", "30", "60", "D", "W"] }), 0);
  }

  searchSymbols(userInput, exchange, symbolType, onResult) {
    console.log("[searchSymbols]: Method call");
    onResult([]); // You could implement search logic here if needed
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    console.log("[resolveSymbol]: Method call", symbolName);
    // Ensure the symbol matches the token address or a meaningful name
    const symbolInfo = {
      name: symbolName, // Use the tokenAddress or a readable name
      full_name: `${this.tokenAddress}/ETH`, // More descriptive
      description: `Token at ${this.tokenAddress}`,
      type: "crypto",
      session: "24x7",
      timezone: "Etc/UTC",
      exchange: "CULT",
      ticker: symbolName,
      minmov: 1,
      pricescale: 10 ** 18,
      has_intraday: true,
      intraday_multipliers: ["1", "5", "15", "30", "60"],
      has_daily: true,
      has_weekly_and_monthly: false,
      supported_resolutions: ["1", "5", "15", "30", "60", "D", "W"],
      volume_precision: 8,
      data_status: "streaming",
    };
    setTimeout(() => onSymbolResolvedCallback(symbolInfo), 0);
  }

  async getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback) {
    console.log("[getBars]: Method call", symbolInfo);
    try {
      const rawTrades = await this.fetchHistoricalData(from, to);
      console.log("RAW TRADES", rawTrades);
      const bars = this.processTradesToOHLC(rawTrades, resolution);
      if (bars.length === 0) {
        onHistoryCallback([], { noData: true });
      } else {
        onHistoryCallback(bars, { noData: false });
      }
    } catch (error) {
      console.error("Error fetching bars:", error);
      onErrorCallback("Failed to fetch data");
    }
  }

  async fetchHistoricalData(from, to) {
    const ITEMS_PER_PAGE = 20;
    const allTrades = [];
    let page = 1;
    let hasMore = true;

    const response = await fetchTokenTrades(this.tokenAddress, ITEMS_PER_PAGE, (page - 1) * ITEMS_PER_PAGE);
    console.log("RESPONSE FOR GRAPH", response);
    allTrades.push(...response.tokenTrades);
    hasMore = response.tokenTrades.length === ITEMS_PER_PAGE;

    // Filter trades by time range
    return allTrades.filter(trade => {
      const timestamp = parseInt(trade.timestamp);
      return timestamp >= from && timestamp <= to;
    });
  }

  processTradesToOHLC(trades, resolution) {
    const bars = [];
    const resolutionMs = this.resolutionToMilliseconds(resolution);

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

  resolutionToMilliseconds(resolution) {
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

  subscribeBars(symbolInfo, resolution, onTick, subscriberUID) {
    console.log("[subscribeBars]: Method call with subscriberUID:", subscriberUID);
    this.resolution = resolution;
    this.subscribers.set(subscriberUID, onTick);
  }

  unsubscribeBars(subscriberUID) {
    this.subscribers.delete(subscriberUID);
  }
}
