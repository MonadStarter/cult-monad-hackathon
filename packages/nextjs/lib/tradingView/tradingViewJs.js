// tradingviewDataFeed.js
class DataFeed {
  constructor(tokenAddress) {
    this.tokenAddress = tokenAddress; // Store the token address
    this.customTokenData = {
      // Move custom data inside the class
      CUSTOMTOKEN: {
        name: "Custom Token",
        description: "A custom token for testing",
        pricescale: 100,
        data: [
          { time: Date.now() - 86400000 * 3, open: 10, high: 12, low: 9, close: 11 },
          { time: Date.now() - 86400000 * 2, open: 11, high: 13, low: 10, close: 12 },
          { time: Date.now() - 86400000, open: 12, high: 14, low: 11, close: 13 },
          { time: Date.now(), open: 13, high: 15, low: 12, close: 14 },
        ],
      },
      ANOTHERTOKEN: {
        name: "Another Token",
        description: "Another custom token for testing",
        pricescale: 1000,
        data: [
          { time: Date.now() - 86400000 * 3, open: 50, high: 60, low: 45, close: 55 },
          { time: Date.now() - 86400000 * 2, open: 55, high: 65, low: 50, close: 60 },
          { time: Date.now() - 86400000, open: 60, high: 70, low: 55, close: 65 },
          { time: Date.now(), open: 65, high: 75, low: 60, close: 70 },
        ],
      },
    };
    this.configurationData = {
      // Move configuration inside the class
      supported_resolutions: ["1D", "1W", "1M"],
      exchanges: [],
      symbols_types: [{ name: "custom", value: "custom" }],
    };
  }

  onReady(callback) {
    console.log("[onReady]: Method call");
    setTimeout(() => callback(this.configurationData));
  }

  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    console.log("[searchSymbols]: Method call");
    const symbols = Object.keys(this.customTokenData).map(token => ({
      symbol: token,
      ticker: token,
      description: this.customTokenData[token].description,
      exchange: "CUSTOM",
      type: "custom",
    }));

    const filteredSymbols = symbols.filter(symbol => symbol.ticker.toLowerCase().includes(userInput.toLowerCase()));

    onResultReadyCallback(filteredSymbols);
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    console.log("[resolveSymbol]: Method call", symbolName);
    const tokenData = this.customTokenData[symbolName];

    if (!tokenData) {
      onResolveErrorCallback("Cannot resolve symbol");
      return;
    }

    const symbolInfo = {
      ticker: symbolName,
      name: tokenData.name,
      description: tokenData.description,
      type: "custom",
      session: "24x7",
      timezone: "Etc/UTC",
      exchange: "CUSTOM",
      minmov: 1,
      pricescale: tokenData.pricescale,
      has_intraday: false,
      visible_plots_set: "ohlc",
      has_weekly_and_monthly: false,
      supported_resolutions: this.configurationData.supported_resolutions,
      volume_precision: 2,
      data_status: "streaming",
    };

    onSymbolResolvedCallback(symbolInfo);
  }

  getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
    const { from, to } = periodParams; // No need for firstDataRequest
    console.log("[getBars]: Method call", symbolInfo, resolution, from, to);

    const tokenData = this.customTokenData[symbolInfo.ticker];
    if (!tokenData) {
      onErrorCallback("Token data not found");
      return;
    }

    const bars = tokenData.data
      .filter(bar => bar.time >= from && bar.time < to)
      .map(bar => ({
        time: bar.time,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
      }));

    onHistoryCallback(bars, { noData: bars.length === 0 });
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID) {
    console.log("[subscribeBars]: Method call with subscriberUID:", subscriberUID);
    // Implement real-time updates if needed.
  }

  unsubscribeBars(subscriberUID) {
    console.log("[unsubscribeBars]: Method call with subscriberUID:", subscriberUID);
    // Clean up any subscriptions.
  }
}

export { DataFeed }; // Export the DataFeed class
