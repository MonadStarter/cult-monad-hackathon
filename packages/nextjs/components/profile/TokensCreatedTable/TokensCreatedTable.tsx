import NoItems from "../NoItems";
import TokenCard from "../TokenCard";
import { isEmpty } from "lodash";
import { CREATED_TOKEN_DUMMY_DATA } from "~~/constants/mockData";
import { RightChevronArrow } from "~~/icons/actions";
import { TokenIcon } from "~~/icons/symbols";

const TokenCreatedTable = () => {
  if (isEmpty(CREATED_TOKEN_DUMMY_DATA)) {
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

  return (
    <div>
      {CREATED_TOKEN_DUMMY_DATA.map((data, idx) => (
        <TokenCard {...data} key={idx} shouldHideTopDivider={idx === 0} />
      ))}
    </div>
  );
};

export default TokenCreatedTable;
