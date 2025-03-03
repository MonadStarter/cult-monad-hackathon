import Image from "next/image";
import { TableColumnInterface, TableValueInterface } from "~~/components/common/Table";
import { GoldenTrophy } from "~~/icons/symbols";

const SERIAL_NUMBER = "serialNumber";
const PROFILE_URL = "profileUrl";
const NAME = "name";
const COIN_SYMBOL = "coinSymbol";
const CHAIN_SYMBOL = "chainSymbol";
const MARKET_CAP = "marketCap";
const HIGH_24 = "high24";

const SERIAL_NUMBER_COLUMN: TableColumnInterface = {
  title: "Sr",
  accessor: (rowData: TableValueInterface) => rowData[SERIAL_NUMBER],
  widthPercentage: 5,
  renderer: (value: string | number) => {
    if (typeof value === "string") return "-";
    if ([1, 2, 3].includes(value)) {
      return (
        <div className="flex justify-center">
          <GoldenTrophy />
        </div>
      );
    }
    return <h6 className="text-center">{value}</h6>;
  },
  columnHeaderTextAlign: "text-center",
  columnTextAlign: "text-center",
};

const NAME_COLUMN: TableColumnInterface = {
  title: "Name",
  accessor: (rowData: TableValueInterface) => {
    const profileUrl = rowData[PROFILE_URL];
    const name = rowData[NAME];
    const coinSymbol = rowData[COIN_SYMBOL];
    const chainSymbol = rowData[CHAIN_SYMBOL];
    return {
      profileUrl,
      name,
      coinSymbol,
      chainSymbol,
    };
  },
  widthPercentage: 41,
  renderer: ({
    profileUrl,
    name,
    coinSymbol,
    chainSymbol,
  }: {
    profileUrl: string;
    name: string;
    coinSymbol: string;
    chainSymbol: string;
  }) => (
    <div className="flex gap-1">
      <Image src={profileUrl} alt={name} width={24} height={24} className="rounded-full" />
      <h6>{`${name}($${coinSymbol})/${chainSymbol}`}</h6>
    </div>
  ),
};

const HIGH_24_COLUMN: TableColumnInterface = {
  title: "24%H",
  accessor: (rowData: TableValueInterface) => rowData[HIGH_24],
  widthPercentage: 34,
  renderer: (value: number) => <h6>+{value}%</h6>,
  columnHeaderTextAlign: "text-right",
  columnTextAlign: "text-right",
};

const MARKET_CAP_COLUMN: TableColumnInterface = {
  title: "Market Cap",
  accessor: (rowData: TableValueInterface) => rowData[MARKET_CAP],
  widthPercentage: 15,
  renderer: (value: string) => <h6>{value}</h6>,
};

export { SERIAL_NUMBER_COLUMN, NAME_COLUMN, MARKET_CAP_COLUMN, HIGH_24_COLUMN };
