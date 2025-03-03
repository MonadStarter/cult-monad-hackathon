import { TableColumnInterface, TableValueInterface } from "~~/components/common/Table";
import { EllipsisTransaction, ellipsisTransaction } from "~~/lib/utils";

const ACCOUNT = "account";
const TYPE = "type";
const ETH = "eth";
const TOKEN = "token";
const DATE = "date";
const TRANSACTION = "transaction";

const ACCOUNT_COLUMN: TableColumnInterface = {
  title: "Account",
  accessor: (rowData: TableValueInterface) => rowData[ACCOUNT],
  widthPercentage: 17,
  renderer: (value: string | number) => <h6 className="font-bold text-primary-400">{value}</h6>,
};

const TYPE_COLUMN: TableColumnInterface = {
  title: "Type",
  accessor: (rowData: TableValueInterface) => rowData[TYPE],
  widthPercentage: 13,
  renderer: (value: string | number) => (
    <h6 className={`font-bold capitalize ${value === "buy" ? "text-success-400" : "text-danger-400"}`}>{value}</h6>
  ),
};

const ETH_COLUMN: TableColumnInterface = {
  title: "ETH",
  accessor: (rowData: TableValueInterface) => rowData[ETH],
  widthPercentage: 13,
  renderer: (value: string | number) => <h6 className="font-semibold">{value}</h6>,
};

const TOKEN_COLUMN: TableColumnInterface = {
  title: "TOKEN",
  accessor: (rowData: TableValueInterface) => rowData[TOKEN],
  widthPercentage: 13,
  renderer: (value: string | number) => <h6 className="font-semibold">{value}</h6>,
};

const DATE_COLUMN: TableColumnInterface = {
  title: "Date",
  accessor: (rowData: TableValueInterface) => rowData[DATE],
  widthPercentage: 22,
  renderer: (value: string | number) => <h6 className="font-semibold">{value}</h6>,
};

const TRANSACTION_COLUMN: TableColumnInterface = {
  title: "Transaction",
  accessor: (rowData: TableValueInterface) => EllipsisTransaction({ value: rowData[TRANSACTION].toString() }),
  widthPercentage: 22,
  renderer: (value: string | number) => <h6 className="font-bold text-primary-400">{value}</h6>,
};

const columns = [ACCOUNT_COLUMN, TYPE_COLUMN, ETH_COLUMN, TOKEN_COLUMN, DATE_COLUMN, TRANSACTION_COLUMN];

export { columns };
