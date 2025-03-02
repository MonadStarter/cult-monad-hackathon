import COLUMNS from "./constants/tradingVolume24HTable.columns";
import Pagination from "~~/components/common/Pagination";
import Table from "~~/components/common/Table";
import { RANKING_DUMMY_DATA } from "~~/constants/mockData";

const TradingVolume24HTable = () => {
  return (
    <div className="flex flex-col gap-5">
      <Table values={RANKING_DUMMY_DATA} columns={COLUMNS} />
      <Pagination totalPages={10} sibling={2} className="w-1/2" />
    </div>
  );
};

export default TradingVolume24HTable;
