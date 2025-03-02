import { TableColumnInterface, TableValueInterface } from "./interfaces";
import "./table.css";

type TableProps = {
  columns?: TableColumnInterface[];
  values?: TableValueInterface[];
};

const Table = ({ columns = [], values = [] }: TableProps) => {
  const buildRow = (values: TableValueInterface, index: number) => {
    return (
      <tr key={index} className="border-b border-gray-900">
        {columns.map((column, idx) => (
          <td key={idx} className={`px-4 py-2 ${idx === columns.length - 1 ? "!text-right" : "!text-left"}`}>
            {column.renderer(column.accessor(values))}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <table className="w-full table-auto">
      <thead>
        <tr className="border-b border-gray-900">
          {columns.map((column, idx) => (
            <th
              key={idx}
              style={{ width: `${column.widthPercentage}%` }}
              className={`px-4 py-2 ${idx === columns.length - 1 ? "text-right" : "text-left"}`}
            >
              <h6 className="font-medium table-header-title">{column.title}</h6>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{values.flatMap(buildRow)}</tbody>
    </table>
  );
};

export type { TableColumnInterface, TableValueInterface };
export default Table;
