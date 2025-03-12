"use client";

import { useEffect, useRef } from "react";
import { DataFeed } from "~~/lib/tradingView/tradingviewDataFeed.js";

const TradingViewChart = ({ tokenAddress, interval = "D", theme = "dark", autosize = true }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const dataFeedRef = useRef(null);

  useEffect(() => {
    const loadScript = () => {
      if (document.getElementById("tradingview-script")) return;

      const script = document.createElement("script");
      script.id = "tradingview-script";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = initializeWidget;
      document.body.appendChild(script);
    };

    const initializeWidget = () => {
      if (typeof window.TradingView === "undefined" || !containerRef.current) return;

      dataFeedRef.current = new DataFeed(tokenAddress);
      console.log("DataFeed initialized with token:", tokenAddress);

      widgetRef.current = new window.TradingView.widget({
        autosize: autosize,
        symbol: "TST", // Use tokenAddress directly as symbol
        interval: interval,
        timezone: "Etc/UTC",
        theme: theme,
        style: "1", // Candlestick chart
        locale: "en",
        enable_publishing: false,
        allow_symbol_change: false,
        container_id: "tradingview-chart-container",
        datafeed: dataFeedRef.current,
      });
    };

    loadScript();

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
      dataFeedRef.current = null;
    };
  }, [tokenAddress, interval, theme, autosize]);

  useEffect(() => {
    const handleResize = () => {
      if (widgetRef.current && autosize && containerRef.current) {
        widgetRef.current.onChartReady(() => {
          widgetRef.current.changeSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [autosize]);

  return (
    <div
      ref={containerRef}
      id="tradingview-chart-container"
      style={{ width: "100%", height: "100%", minHeight: "500px" }}
    />
  );
};

export default TradingViewChart;
