import ProgressBar from "../common/ProgressBar";
import { UserIcon } from "~~/icons/symbols";
import { useTokenStore } from "~~/stores/tokenStore";

function HolderCoinDist() {
  const { subgraphData } = useTokenStore();
  return (
    <div className="content-wrapper-card p-5 flex flex-col gap-5">
      <div className="flex justify-between">
        <h5>Holder Card Distribution</h5>
        <div className="flex gap-1 items-center">
          <UserIcon />
          <h5>{subgraphData?.cultToken?.holderCount}</h5>
        </div>
      </div>
      <ProgressBar current={20} />
      <p className="text-white-76 text-sm">
        There are {"tradingBalance"} {subgraphData?.cultToken?.symbol} still available for sale in the bonding curve.
      </p>
      <p className="text-white-76 text-sm">
        When the market cap reaches $ 105,548.4 all the liquidity from the bonding curve will be deposited into SunSwap
        and burned. Progression increases as the price goes up.
      </p>
    </div>
  );
}

export default HolderCoinDist;
