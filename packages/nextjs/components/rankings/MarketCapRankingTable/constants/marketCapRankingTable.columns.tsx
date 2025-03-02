import { TableColumnInterface } from "~~/components/common/Table";
import { MARKET_CAP_COLUMN, NAME_COLUMN, SERIAL_NUMBER_COLUMN } from "~~/constants/columns";

const UPDATED_MARKET_CAP_COLUMN: TableColumnInterface = {
  ...MARKET_CAP_COLUMN,
  columnHeaderTextAlign: "text-right",
  columnTextAlign: "text-right",
  widthPercentage: 54,
};

const COLUMNS = [SERIAL_NUMBER_COLUMN, NAME_COLUMN, UPDATED_MARKET_CAP_COLUMN];

export default COLUMNS;
