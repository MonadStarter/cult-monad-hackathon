import { TableColumnInterface, TableValueInterface } from "./interfaces";
import "./table.css";

type TableProps = {
  columns?: TableColumnInterface[];
  values?: TableValueInterface[];
};

const Table = ({ columns = [], values = [] }: TableProps) => {
  const buildRow = (values: TableValueInterface, index: number) => {
    return (
      <tr key={index} className="border-b border-[#272536] hover:bg-[#272536]/30 transition-colors">
        {columns.map((column, idx) => (
          <td key={idx} className={`px-4 py-4 ${idx === columns.length - 1 ? "!text-right" : "!text-left"}`}>
            {column.renderer(column.accessor(values))}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl bg-[#1c1a29]/60">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-[#272536]">
            {columns.map((column, idx) => (
              <th
                key={idx}
                style={{ width: `${column.widthPercentage}%` }}
                className={`px-4 py-3 ${idx === columns.length - 1 ? "text-right" : "text-left"}`}
              >
                <h6 className="font-medium text-sm table-header-title">{column.title}</h6>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.length > 0 ? (
            values.flatMap(buildRow)
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export type { TableColumnInterface, TableValueInterface };
export default Table;
