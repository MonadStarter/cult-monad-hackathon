import { TableColumnInterface } from "~~/components/common/Table";
import { HIGH_24_COLUMN, MARKET_CAP_COLUMN, NAME_COLUMN, SERIAL_NUMBER_COLUMN } from "~~/constants/columns";

const UPDATED_HIGH_24_COLUMN: TableColumnInterface = {
  ...HIGH_24_COLUMN,
  widthPercentage: 39,
};

const COLUMNS = [SERIAL_NUMBER_COLUMN, NAME_COLUMN, MARKET_CAP_COLUMN, UPDATED_HIGH_24_COLUMN];

export default COLUMNS;
