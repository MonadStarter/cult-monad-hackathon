import Table from "../../common/Table";
import { TableValueInterface } from "../../common/Table";
import NoItems from "../NoItems";
import COLUMNS from "./constants/tokensOwnedTable.columns";
import { isEmpty } from "lodash";
import Pagination from "~~/components/common/Pagination";
import { TOKEN_OWNED_DUMMY_DATA } from "~~/constants/mockData";
import { CheckIcon, PlusCircleIcon } from "~~/icons/actions";
import { TokenIcon } from "~~/icons/symbols";
import { Balance } from "~~/types/types";

const TokensOwnedTable = ({ tokensOwned }: { tokensOwned: Balance[] | [] }) => {
  // const buildAddIcon = () => (
  //   <button className="button bg-gray-800">
  //     <PlusCircleIcon />
  //     <h6 className="text-xs text-gray-25">Add Coin</h6>
  //   </button>
  // );

  // if (isEmpty(TOKEN_OWNED_DUMMY_DATA)) {
  //   return <NoItems icon={<TokenIcon />} note="No coins in the list" button={buildAddIcon()} />;
  // }

  if (isEmpty(tokensOwned)) {
    return (
      <div className="py-20 px-4 flex items-center justify-center">
        <p className="text-lg text-white font-medium">You do not have any coins, buy some</p>
      </div>
    );
  }

  // const tableValues: TableValueInterface[] = tokensOwned.map(token => ({
  //   ID: token.token_id,
  //   "Last Bought": token.lastBought,
  //   "Last Sold": token.lastSold,
  //   Name: token.name,
  //   Symbol: token.symbol,
  //   Value: token.value,
  //   Image: token.image ? <img src={token.image as string} alt="Token Image" width="50" height="50" /> : "No Image",
  // }));

  const tableValues: TableValueInterface[] = tokensOwned.map(token => ({
    id: token.id,
    name: token.name,
    symbol: token.symbol,
    value: token.value,
    image: token.image
      ? typeof token.image === "string"
        ? token.image
        : URL.createObjectURL(token.image)
      : "No Image",
  }));

  console.log("tokensOwned", tokensOwned, tableValues);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-4">
        {/* {buildAddIcon()} */}
        <button className="bg-[#272536] border border-[#3c3a49] rounded-lg py-2 px-4 text-sm text-white flex items-center gap-2 hover:bg-[#32304a] transition-colors">
          <CheckIcon />
          <span className="text-white">Listed on DEXx</span>
        </button>
      </div>
      <Table values={tableValues} columns={COLUMNS} />
      <div className="mt-3 w-full sm:w-3/5 mx-auto">
        <Pagination totalPages={10} />
      </div>
    </div>
  );
};

export default TokensOwnedTable;
