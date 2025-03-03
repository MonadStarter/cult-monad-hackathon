import { BigNumber } from "bignumber.js";
import { fetchTokenTrades } from "~~/graphql/graphQlClient2";
// Install: npm install bignumber.js
import { TokenTrade } from "~~/types/types";

interface LibrarySymbolInfo {
  name: string;
  description: string;
  type: string;
  session: string;
  timezone: string;
  ticker: string;
  exchange: string;
  minmov: number;
  pricescale: number;
  has_intraday: boolean;
  intraday_multipliers: string[];
  has_daily: boolean;
  has_weekly_and_monthly: boolean;
  supported_resolutions: string[];
  volume_precision: number;
  data_status: string;
}

interface LibraryBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type HistoryCallback = (bars: LibraryBar[], meta: { noData: boolean }) => void;
type ErrorCallback = (reason: string) => void;
type SubscribeBarsCallback = (bar: LibraryBar) => void;

export class DataFeed {
  private tokenAddress: string;
  private resolution: string | null = null;
  private lastBar: LibraryBar | null = null;
  private subscribers = new Map<string, SubscribeBarsCallback>();

  constructor(tokenAddress: string) {
    console.log("DataFeed constructor");
    this.tokenAddress = tokenAddress;
  }

  // Required by TradingView: Called when the chart is initialized
  // onReady(callback: (config: { supported_resolutions: string[] }) => void) {
  //   setTimeout(() => callback({ supported_resolutions: ["1", "5", "15", "30", "60", "D", "W"] }), 0);
  // }

  onReady(callback: (config: { supported_resolutions: string[] }) => void) {
    console.log("[onReady]: Method call");
    setTimeout(() => callback({ supported_resolutions: ["1", "5", "15", "30", "60", "D", "W"] }), 0);
  }

  // Required by TradingView: Search for symbols (minimal implementation)
  searchSymbols(userInput: string, exchange: string, symbolType: string, onResult: (symbols: any[]) => void) {
    console.log("[searchSymbols]: Method call");
    onResult([]); // Implement symbol search if needed
  }

  //Required by TradingView: Resolve symbol details
  resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: (symbolInfo: LibrarySymbolInfo) => void,
    onResolveErrorCallback: (reason: string) => void,
  ) {
    console.log("[resolveSymbol]: Method call", symbolName);
    const symbolInfo: LibrarySymbolInfo = {
      name: symbolName,
      description: "",
      type: "crypto",
      session: "24x7",
      timezone: "Etc/UTC",
      exchange: "CULT",
      ticker: symbolName,
      minmov: 1,
      pricescale: 10 ** 18, // Adjust based on token decimals if needed
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

  // Fetch and process historical bars
  // async getBars(
  //   symbolInfo: LibrarySymbolInfo,
  //   resolution: string,
  //   from: number,
  //   to: number,
  //   onHistoryCallback: HistoryCallback,
  //   onError: ErrorCallback,
  // ) {
  //   console.log("[getBars]: Method call", symbolInfo);
  //   try {
  //     const rawTrades = await this.fetchHistoricalData(from, to);
  //     console.log("RAW TRADES", rawTrades);
  //     const bars = this.processTradesToOHLC(rawTrades, resolution);
  //     onHistoryCallback(bars, { noData: !bars.length });
  //   } catch (error) {
  //     onError("Failed to fetch data");
  //   }
  // }

  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    from: number,
    to: number,
    onHistoryCallback: HistoryCallback,
  ) {
    const bars = [
      { time: Date.now() - 3600000, open: 1.0, high: 1.1, low: 0.9, close: 1.05, volume: 100 },
      { time: Date.now(), open: 1.05, high: 1.2, low: 1.0, close: 1.15, volume: 150 },
    ];
    onHistoryCallback(bars, { noData: false });
  }

  // Fetch historical trade data (assumes fetchTokenTrades is defined elsewhere)
  private async fetchHistoricalData(from: number, to: number): Promise<TokenTrade[]> {
    const ITEMS_PER_PAGE = 20; // Define based on your API
    const allTrades: TokenTrade[] = [];
    let page = 1;
    let hasMore = true;

    // while (hasMore) {
    const response = await fetchTokenTrades(
      this.tokenAddress as `0x${string}`,
      ITEMS_PER_PAGE,
      (page - 1) * ITEMS_PER_PAGE,
    );
    console.log("RESPONSE FOR GRAPH", response);
    allTrades.push(...response.tokenTrades);
    hasMore = response.tokenTrades.length === ITEMS_PER_PAGE;
    page++;
    // }

    // Filter trades within the time range (assuming timestamp is in seconds)
    return allTrades; //.filter(trade => parseInt(trade.timestamp) >= from && parseInt(trade.timestamp) <= to);
  }

  // Aggregate trades into OHLC bars
  private processTradesToOHLC(trades: TokenTrade[], resolution: string): LibraryBar[] {
    const bars: LibraryBar[] = [];
    const resolutionMs = this.resolutionToMilliseconds(resolution);

    // Sort trades by timestamp
    trades.sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));

    let currentBar: Partial<LibraryBar> | null = null;

    for (const trade of trades) {
      const timestampMs = parseInt(trade.timestamp) * 1000; // Convert to milliseconds
      const barTime = Math.floor(timestampMs / resolutionMs) * resolutionMs;

      // Calculate price: ethAmount / tokenAmount using BigNumber for precision
      const ethAmount = new BigNumber(trade.ethAmount);
      const tokenAmount = new BigNumber(trade.tokenAmount);
      if (tokenAmount.isZero()) continue; // Skip trades with zero token amount to avoid division by zero
      const price = ethAmount.dividedBy(tokenAmount).toNumber();

      // Volume: tokenAmount
      const volume = tokenAmount.toNumber();

      if (!currentBar || currentBar.time !== barTime) {
        if (currentBar) bars.push(currentBar as LibraryBar);
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

    if (currentBar) bars.push(currentBar as LibraryBar);
    return bars;
  }

  // Convert resolution to milliseconds
  private resolutionToMilliseconds(resolution: string): number {
    const numeric = parseInt(resolution);
    if (isNaN(numeric)) {
      switch (resolution.toUpperCase()) {
        case "D":
          return 86400000; // 24 hours
        case "W":
          return 604800000; // 7 days
        default:
          return 86400000;
      }
    }
    return numeric * 60000; // Minutes to milliseconds
  }

  // Subscribe to real-time updates
  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    onTick: SubscribeBarsCallback,
    subscriberUID: string,
  ) {
    console.log("[subscribeBars]: Method call with subscriberUID:", subscriberUID);
    // this.resolution = resolution;
    // this.subscribers.set(subscriberUID, onTick);
    // this.setupRealTimeUpdates();
  }

  // Unsubscribe from real-time updates
  unsubscribeBars(subscriberUID: string) {
    this.subscribers.delete(subscriberUID);
  }

  // Set up real-time updates (simulated WebSocket connection)
  // private setupRealTimeUpdates() {
  //   // Replace with your actual WebSocket URL
  //   const ws = new WebSocket("wss://your-websocket-url");

  //   ws.onmessage = event => {
  //     const newTrade: TokenTrade = JSON.parse(event.data);
  //     const newBar = this.updateBarWithTrade(newTrade);
  //     this.subscribers.forEach(callback => callback(newBar));
  //   };

  //   // Handle WebSocket errors and reconnection logic as needed
  //   ws.onerror = error => console.error("WebSocket error:", error);
  //   ws.onclose = () => console.log("WebSocket connection closed");
  // }

  // // Update the current bar with a new trade
  // private updateBarWithTrade(trade: TokenTrade): LibraryBar {
  //   if (!this.resolution) throw new Error("Resolution not set");
  //   const resolutionMs = this.resolutionToMilliseconds(this.resolution);
  //   const timestampMs = parseInt(trade.timestamp) * 1000;
  //   const barTime = Math.floor(timestampMs / resolutionMs) * resolutionMs;

  //   const ethAmount = new BigNumber(trade.ethAmount);
  //   const tokenAmount = new BigNumber(trade.tokenAmount);
  //   if (tokenAmount.isZero()) throw new Error("Token amount cannot be zero");
  //   const price = ethAmount.dividedBy(tokenAmount).toNumber();
  //   const volume = tokenAmount.toNumber();

  //   if (!this.lastBar || this.lastBar.time !== barTime) {
  //     this.lastBar = {
  //       time: barTime,
  //       open: price,
  //       high: price,
  //       low: price,
  //       close: price,
  //       volume: volume,
  //     };
  //   } else {
  //     this.lastBar = {
  //       ...this.lastBar,
  //       high: Math.max(this.lastBar.high, price),
  //       low: Math.min(this.lastBar.low, price),
  //       close: price,
  //       volume: (this.lastBar.volume || 0) + volume,
  //     };
  //   }
  //   return this.lastBar;
  // }
}
