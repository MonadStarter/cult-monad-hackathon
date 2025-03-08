import Table from "../../common/Table";
import NoItems from "../NoItems";
import TokenCard from "../TokenCard";
import COLUMNS from "./constants/TokensCreatedTable.columns";
import { isEmpty } from "lodash";
import Pagination from "~~/components/common/Pagination";
import { TableValueInterface } from "~~/components/common/Table";
import { CREATED_TOKEN_DUMMY_DATA } from "~~/constants/mockData";
import { RightChevronArrow } from "~~/icons/actions";
import { TokenIcon } from "~~/icons/symbols";
import { TokenCreated } from "~~/types/types";

const TokenCreatedTable = ({ tokensCreated }: { tokensCreated: TokenCreated[] | [] }) => {
  if (isEmpty(tokensCreated)) {
    return (
      <NoItems
        icon={<TokenIcon />}
        note="No coins in the list"
        button={
          <button className="button bg-primary-500">
            <h6 className="text-xs text-gray-25">Launch token</h6>
            <RightChevronArrow />
          </button>
        }
      />
    );
  }

  const tableValues: TableValueInterface[] = tokensCreated.map(token => ({
    id: token.id,
    name: token.name,
    symbol: token.symbol,
    image: token.image
      ? typeof token.image === "string"
        ? token.image
        : URL.createObjectURL(token.image)
      : "No Image",
  }));

  console.log("tableValues", tableValues);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-4">
        {/* {buildAddIcon()} */}
        {/* <button className="button border border-gray-800 bg-white-7">
          <CheckIcon />
          <h6 className="text-xs text-gray-25">Listed on DEXx</h6>
        </button> */}
      </div>
      <Table values={tableValues} columns={COLUMNS} />
      <div className="mt-3 w-3/5">
        <Pagination totalPages={10} />
      </div>
    </div>
  );

  // return (
  //   <div>
  //     {CREATED_TOKEN_DUMMY_DATA.map((data, idx) => (
  //       <TokenCard {...data} key={idx} shouldHideTopDivider={idx === 0} />
  //     ))}
  //   </div>
  // );
};

export default TokenCreatedTable;
