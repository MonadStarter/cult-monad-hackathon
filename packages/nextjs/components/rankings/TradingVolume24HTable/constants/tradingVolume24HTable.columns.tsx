import { TableColumnInterface, TableValueInterface } from "~~/components/common/Table";
import { MARKET_CAP_COLUMN, NAME_COLUMN, SERIAL_NUMBER_COLUMN } from "~~/constants/columns";

const TRADING_VOLUME_24H = "tradingVolume24h";

const TRADING_VOLUME_24_COLUMN: TableColumnInterface = {
  title: "24%H",
  accessor: (rowData: TableValueInterface) => rowData[TRADING_VOLUME_24H],
  widthPercentage: 39,
  renderer: (value: number) => <h6>{value}</h6>,
  columnHeaderTextAlign: "text-right",
  columnTextAlign: "text-right",
};

const COLUMNS = [SERIAL_NUMBER_COLUMN, NAME_COLUMN, MARKET_CAP_COLUMN, TRADING_VOLUME_24_COLUMN];

export default COLUMNS;
