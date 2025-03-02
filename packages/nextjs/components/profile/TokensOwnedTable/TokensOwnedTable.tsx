import Table from "../../common/Table";
import NoItems from "../NoItems";
import COLUMNS from "./constants/tokensOwnedTable.columns";
import { isEmpty } from "lodash";
import Pagination from "~~/components/common/Pagination";
import { TOKEN_OWNED_DUMMY_DATA } from "~~/constants/mockData";
import { CheckIcon, PlusCircleIcon } from "~~/icons/actions";
import { TokenIcon } from "~~/icons/symbols";

const TokensOwnedTable = () => {
  const buildAddIcon = () => (
    <button className="button bg-gray-800">
      <PlusCircleIcon />
      <h6 className="text-xs text-gray-25">Add Coin</h6>
    </button>
  );

  if (isEmpty(TOKEN_OWNED_DUMMY_DATA)) {
    return <NoItems icon={<TokenIcon />} note="No coins in the list" button={buildAddIcon()} />;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-4">
        {buildAddIcon()}
        <button className="button border border-gray-800 bg-white-7">
          <CheckIcon />
          <h6 className="text-xs text-gray-25">Listed on DEXx</h6>
        </button>
      </div>
      <Table values={TOKEN_OWNED_DUMMY_DATA} columns={COLUMNS} />
      <div className="mt-3 w-3/5">
        <Pagination totalPages={10} />
      </div>
    </div>
  );
};

export default TokensOwnedTable;
