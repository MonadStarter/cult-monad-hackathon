import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
//import { Asset, Trade } from "../../features/asset/models";
import { cn } from "../utils";
import { DISABLED_FEATURES, ENABLED_FEATURES } from "./constant";
import { widgetOptionsDefault } from "./helper";
import { overrides } from "./theme";
import { Datafeed } from "./utils/";
import { useTheme } from "next-themes";
import { MON_TOKEN } from "~~/constants/mockData";
import { Timezone } from "~~/public/static/charting_library/charting_library";
import { TokenMetadata, TokenTrade } from "~~/types/types";

interface TradingViewChartProps {
  baseAsset: TokenMetadata | null;
  mobile?: boolean;
  custom_css_url?: string;
  extraCss?: string;
  isPair?: boolean;
  //setPairTrades: Dispatch<SetStateAction<TokenTrade[]>>;
  //setFadeIn?: Dispatch<SetStateAction<string[]>>;
  isUsd?: boolean;
  shouldLoadMoreTrade?: boolean;
}

const TradingViewChart = ({
  baseAsset,
  mobile = false,
  custom_css_url = "../themed.css",
  extraCss,
  isPair = false,
  //setPairTrades,
  //setFadeIn,
  isUsd = true,
  shouldLoadMoreTrade = true,
}: TradingViewChartProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isWhiteMode = resolvedTheme === "light";
  const chartInit = () => {
    if (!baseAsset) return () => {};
    import("~~/public/static/charting_library").then(({ widget: Widget }) => {
      if (!ref.current) return;
      //const baseToken = baseAsset?.[baseAsset?.baseToken];
      const quoteToken = MON_TOKEN;
      const tvWidget = new Widget({
        //datafeed: Datafeed(baseAsset, isPair, shouldLoadMoreTrade, setPairTrades, setFadeIn, isUsd),
        datafeed: Datafeed(baseAsset),
        symbol: isPair
          ? isUsd
            ? baseAsset?.symbol + "/USD"
            : baseAsset?.symbol + "/" + quoteToken?.symbol
          : baseAsset?.symbol + "/USD",
        container: ref.current,
        container_id: ref.current.id,
        locale: "en",
        fullscreen: false,
        enabled_features: ENABLED_FEATURES,
        disabled_features: [...DISABLED_FEATURES, ...(mobile ? ["left_toolbar"] : [])],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as Timezone,
        autosize: true,
        theme: isWhiteMode ? "Light" : "Dark",
        studies_overrides: {
          "volume.volume.color.0": "#ea3943",
          "volume.volume.color.1": "#0ECB81",
        },
        ...widgetOptionsDefault,
      });

      (window as any).tvWidget = tvWidget;

      (window as any).tvWidget.onChartReady(() => {
        // setIsChartLoaded(true);
        (window as any).tvWidget?.applyOverrides(overrides(isWhiteMode) || {});
      });
    });
  };

  useEffect(() => {
    (window as any).tvWidget = null;

    chartInit();

    return () => {
      if ((window as any).tvWidget !== null) {
        (window as any).tvWidget?.remove();
        (window as any).tvWidget = null;
      }
    };
  }, [baseAsset?.tokenAddress, custom_css_url, mobile, isWhiteMode, isUsd, shouldLoadMoreTrade]);

  return (
    <div className="relative">
      <div
        className={cn(
          `flex flex-col rounded-md w-full lg:bg-inherit lg:dark:bg-inherit lg:border-0
      items-center justify-center relative`,
          extraCss,
        )}
        ref={ref}
      />
    </div>
  );
};

export default TradingViewChart;
