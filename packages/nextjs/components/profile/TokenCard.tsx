import Image from "next/image";
import { CopyIcon } from "~~/icons/actions";
import { ellipsisToken } from "~~/lib/utils";

type TokenCardInterface = {
  tokenImageUrl: string;
  tokenName: string;
  tokenId: string;
  registered: string;
  marketCap: string;
  contract: string;
  designedBy: string;
  info: string;
  shouldHideTopDivider?: boolean;
};

const TokenCard = ({
  tokenImageUrl,
  tokenName,
  tokenId,
  registered,
  marketCap,
  contract,
  designedBy,
  info,
  shouldHideTopDivider = false,
}: TokenCardInterface) => {
  return (
    <>
      {!shouldHideTopDivider && <div className="border-t border-white-7"></div>}
      <div className="flex gap-4 py-4 px-5 items-start">
        <Image className="rounded-lg !h-full" src={tokenImageUrl} width={90} height={90} alt="token" />
        <div className="w-full">
          <div className="flex justify-between">
            <div className="flex gap-3">
              <h5 className="text-white-25">{tokenName}</h5>
              <h6 className="text-gray-600">${tokenId}</h6>
            </div>
            <h6 className="text-gray-500">{registered}</h6>
          </div>
          <p className="text-white-76 text-sm line-clamp-2">{info}</p>
          <div className="flex gap-4 mt-3">
            <div className="flex gap-1">
              <h6 className="text-gray-600 font-medium">Market Cap:</h6>
              <h6 className="font-bold">${marketCap}</h6>
            </div>
            <h6 className="text-gray-600">•</h6>
            <div className="flex gap-1 items-center">
              <h6 className="text-gray-600 font-medium">Contract:</h6>
              <h6 className="font-bold text-primary-500">{ellipsisToken(contract)}</h6>
              <CopyIcon />
            </div>
            <h6 className="text-gray-600">•</h6>
            <div className="flex gap-1 items-center">
              <h6 className="text-gray-600 font-medium">Designed By:</h6>
              <h6 className="font-bold text-primary-500">{ellipsisToken(designedBy)}</h6>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TokenCard;
export type { TokenCardInterface };
