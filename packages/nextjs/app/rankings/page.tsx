import SegmentedPanel, { SegmentedPanelOptionType } from "~~/components/common/SegmentedPanel";
import Banner from "~~/components/rankings/Banner/Banner";
import LaunchingSoonTable from "~~/components/rankings/LaunchingSoonTable/LaunchingSoonTable";
import MarketCapRankingTable from "~~/components/rankings/MarketCapRankingTable/MarketCapRankingTable";
import PriseIncrease24HTable from "~~/components/rankings/PriceIncrease24HTable/PriceIncrease24HTable";
import TradingVolume24HTable from "~~/components/rankings/TradingVolume24HTable/TradingVolume24HTable";

const RANKING_OPTIONS: SegmentedPanelOptionType[] = [
  {
    id: "launchingSoon",
    label: "Launching soon!",
    content: <LaunchingSoonTable />,
  },
  {
    id: "marketCapRanking",
    label: "Market Cap Ranking",
    content: <MarketCapRankingTable />,
  },
  {
    id: "24hPriceIncrease",
    label: "24H Price Increase",
    content: <PriseIncrease24HTable />,
  },
  {
    id: "24hTradingVolumeTRX",
    label: "24H Trading Volume(TRX)",
    content: <TradingVolume24HTable />,
  },
];

export default function CoinDetails() {
  return (
    <div>
      <Banner />
      <div className={"page pt-8 pb-4"}>
        <p className="text-base text-center text-gray-500 mb-4">Progress reaches 100%, token deploys on SunSwapV2</p>
        <SegmentedPanel panels={RANKING_OPTIONS} />
      </div>
    </div>
  );
}
