import NoItems from "../NoItems";
import { isEmpty } from "lodash";
import CoinCard from "~~/components/common/CoinCard";
import { COINS_DUMMY_DATA } from "~~/constants/mockData";
import { RightChevronArrow } from "~~/icons/actions";
import { Union } from "~~/icons/symbols";

const FavouriteTokensTable = () => {
  if (isEmpty(COINS_DUMMY_DATA)) {
    return (
      <NoItems
        icon={<Union />}
        note="No coins in the list"
        button={
          <button className="button bg-gray-800">
            <h6 className="text-xs text-gray-25">Discover tokens</h6>
            <RightChevronArrow />
          </button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      {COINS_DUMMY_DATA.map((coin, idx) => (
        <CoinCard key={`coin-${idx}`} coin={coin} rank={idx + 1} />
      ))}
    </div>
  );
};

export default FavouriteTokensTable;
