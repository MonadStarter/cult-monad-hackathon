"use client";

import { useEffect, useRef } from "react";
import { DataFeed } from "~~/lib/tradingView/tradingviewDataFeed";

interface TradingViewChartProps {
  tokenAddress: string;
  interval?: string;
  theme?: "light" | "dark";
  autosize?: boolean;
}

const TradingViewChart = ({ tokenAddress, interval = "D", theme = "dark", autosize = true }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const dataFeedRef = useRef<DataFeed | null>(null);

  // Load and initialize the TradingView widget
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
    console.log("initializeWidget");
    const initializeWidget = () => {
      if (typeof (window as any).TradingView === "undefined" || !containerRef.current) return;

      // Initialize the custom DataFeed with the token address
      dataFeedRef.current = new DataFeed("0x0555de41fef0cdc94b8af276e12c75d14ae2bc76");
      console.log("dataFeedRef.current");
      widgetRef.current = new (window as any).TradingView.widget({
        autosize: autosize,
        symbol: "0x0555de41fef0cdc94b8af276e12c75d14ae2bc76", // Token address serves as the chart symbol
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1", // Candlestick chart
        locale: "en",
        enable_publishing: false,
        allow_symbol_change: false,
        container_id: "tradingview-chart-container",
        datafeed: dataFeedRef.current, // Custom data feed for token data
      });
      console.log("widgetRef.current", widgetRef);
    };
    console.log("loadScript");
    loadScript();

    // Cleanup on unmount
    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
      if (dataFeedRef.current) {
        dataFeedRef.current = null; // Reset data feed reference
      }
    };
  }, [tokenAddress, interval, theme, autosize]);

  // Handle window resize for responsive chart sizing
  useEffect(() => {
    const handleResize = () => {
      if (widgetRef.current && widgetRef.current._widgetOptions && autosize && containerRef.current) {
        widgetRef.current._widgetOptions.width = containerRef.current.clientWidth;
        widgetRef.current._widgetOptions.height = containerRef.current.clientHeight;
        widgetRef.current.setAttribute("width", containerRef.current.clientWidth);
        widgetRef.current.setAttribute("height", containerRef.current.clientHeight);
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
