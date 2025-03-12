import Image from "next/image";
import { TableColumnInterface, TableValueInterface } from "~~/components/common/Table";
import { TopRightArrow } from "~~/icons/actions";

const ID = "id";
const NAME = "name";
const SYMBOL = "symbol";
const IMAGE = "image";

const ID_COLUMN: TableColumnInterface = {
  title: "ID",
  accessor: (rowData: TableValueInterface) => rowData[ID],
  widthPercentage: 20,
  renderer: (value: string | number) => {
    return <h6 className="text-left">{value}</h6>;
  },
  columnHeaderTextAlign: "text-left",
  columnTextAlign: "text-left",
};

const NAME_COLUMN: TableColumnInterface = {
  title: "Name",
  accessor: (rowData: TableValueInterface) => rowData[NAME],
  widthPercentage: 25,
  renderer: (value: string | number) => {
    return <h6 className="text-left">{value}</h6>;
  },
  columnHeaderTextAlign: "text-left",
  columnTextAlign: "text-left",
};

const SYMBOL_COLUMN: TableColumnInterface = {
  title: "Symbol",
  accessor: (rowData: TableValueInterface) => rowData[SYMBOL],
  widthPercentage: 15,
  renderer: (value: string | number) => {
    return <h6 className="text-left">{value}</h6>;
  },
  columnHeaderTextAlign: "text-left",
  columnTextAlign: "text-left",
};

const IMAGE_COLUMN: TableColumnInterface = {
  title: "Image",
  accessor: (rowData: TableValueInterface) => rowData[IMAGE],
  widthPercentage: 20,
  renderer: (value: string | File | undefined) => {
    if (typeof value === "string") {
      return <Image src={value} alt="Token Image" width={35} height={35} className="rounded-full" />;
    } else if (value) {
      // Handle File object if needed
      return <p>File Image</p>; // Or your file rendering logic
    }
    return <p>No Image</p>;
  },
  columnHeaderTextAlign: "text-left",
  columnTextAlign: "text-left",
};

const ACTION_COLUMN: TableColumnInterface = {
  title: "Action",
  accessor: (rowData: TableValueInterface) => rowData[ID],
  widthPercentage: 20,
  renderer: (value: string) => {
    return (
      <div className="flex gap-1 items-center justify-end">
        <a className="text-primary-500" href={`/coin/${value}`}>
          View Coin
        </a>
        <TopRightArrow />
      </div>
    );
  },
  columnHeaderTextAlign: "text-right",
  columnTextAlign: "text-right",
};

const COLUMNS = [IMAGE_COLUMN, NAME_COLUMN, SYMBOL_COLUMN, ACTION_COLUMN];

export default COLUMNS;
