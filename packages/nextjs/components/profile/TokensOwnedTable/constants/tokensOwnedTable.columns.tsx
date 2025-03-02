import Image from "next/image";
import { TableColumnInterface, TableValueInterface } from "~~/components/common/Table";
import { TopRightArrow } from "~~/icons/actions";

const SERIAL_NUMBER = "serialNumber";
const PROFILE_URL = "profileUrl";
const COIN_OWNED = "coinOwned";
const COIN_SYMBOL = "coinSymbol";
const CHAIN_COIN_OWNED = "chainCoinWOwned";
const CHAIN_COIN_SYMBOL = "chainCoinSymbol";

const SERIAL_NUMBER_COLUMN: TableColumnInterface = {
  title: "Sr",
  accessor: (rowData: TableValueInterface) => rowData[SERIAL_NUMBER],
  widthPercentage: 5,
  renderer: (value: string | number) => {
    return <h6 className="text-center">{value}</h6>;
  },
  columnHeaderTextAlign: "text-center",
  columnTextAlign: "text-center",
};

const NAME_COLUMN: TableColumnInterface = {
  title: "Name",
  accessor: (rowData: TableValueInterface) => {
    const profileUrl = rowData[PROFILE_URL];
    const coinOwned = rowData[COIN_OWNED];
    const coinSymbol = rowData[COIN_SYMBOL];
    const chainCoinWOwned = rowData[CHAIN_COIN_OWNED];
    const chainCoinSymbol = rowData[CHAIN_COIN_SYMBOL];
    return {
      profileUrl,
      coinOwned,
      coinSymbol,
      chainCoinWOwned,
      chainCoinSymbol,
    };
  },
  widthPercentage: 41,
  renderer: ({
    profileUrl,
    coinOwned,
    coinSymbol,
    chainCoinWOwned,
    chainCoinSymbol,
  }: {
    profileUrl: string;
    coinOwned: string;
    coinSymbol: string;
    chainCoinWOwned: string;
    chainCoinSymbol: string;
  }) => (
    <div className="flex gap-2 items-center">
      <Image src={profileUrl} alt={"profile"} width={28} height={28} className="rounded-full" />
      <div className="flex flex-col">
        <h6 className="text-white-100">
          {coinOwned} {coinSymbol}
        </h6>
        <p className="text-xs text-white-76">
          {chainCoinWOwned} {chainCoinSymbol}
        </p>
      </div>
    </div>
  ),
};

const ACTION_COLUMN: TableColumnInterface = {
  title: "Action",
  accessor: (rowData: TableValueInterface) => {},
  widthPercentage: 54,
  renderer: () => {
    return (
      <div className="flex gap-1 items-center justify-end">
        <h6 className="text-primary-500">View Coin</h6>
        <TopRightArrow />
      </div>
    );
  },
  columnHeaderTextAlign: "text-right",
  columnTextAlign: "text-right",
};

const COLUMNS = [SERIAL_NUMBER_COLUMN, NAME_COLUMN, ACTION_COLUMN];

export default COLUMNS;
