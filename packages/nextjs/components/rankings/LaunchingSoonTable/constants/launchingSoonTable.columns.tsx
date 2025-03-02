import ProgressBar from "~~/components/common/ProgressBar";
import { TableColumnInterface } from "~~/components/common/Table";
import { HIGH_24_COLUMN, MARKET_CAP_COLUMN, NAME_COLUMN, SERIAL_NUMBER_COLUMN } from "~~/constants/columns";

const UPDATED_HIGH_24_COLUMN: TableColumnInterface = {
  ...HIGH_24_COLUMN,
  renderer: (value: number) => (
    <div className="flex items-center justify-end gap-2">
      <div className="w-28">
        <ProgressBar bgColorClass="bg-gray-900" current={value} />
      </div>
      <h6>{value}%</h6>
    </div>
  ),
  widthPercentage: 39,
};

const COLUMNS = [SERIAL_NUMBER_COLUMN, NAME_COLUMN, MARKET_CAP_COLUMN, UPDATED_HIGH_24_COLUMN];
export default COLUMNS;
