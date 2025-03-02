import COLUMNS from "./constants/marketCapRankingTable.columns";
import Pagination from "~~/components/common/Pagination";
import Table from "~~/components/common/Table";
import { RANKING_DUMMY_DATA } from "~~/constants/mockData";

const MarketCapRankingTable = () => {
  return (
    <div className="flex flex-col gap-5">
      <Table values={RANKING_DUMMY_DATA} columns={COLUMNS} />
      <Pagination totalPages={10} sibling={2} className="w-1/2" />
    </div>
  );
};

export default MarketCapRankingTable;
