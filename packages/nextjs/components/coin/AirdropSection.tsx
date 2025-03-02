import ProgressBar from "../common/ProgressBar";
import { useContractReads } from "wagmi";
import { AirdropContractABI } from "~~/constants/abis";
import { MERKLE_PROOFS, TEST_MERKE_ROOT } from "~~/constants/merkleRoots";
//import { UserIcon } from "~~/icons/symbols";
import { useTokenStore } from "~~/stores/tokenStore";

//TODO: this should be from contract or store in event
function AirdropSection() {
  const { userAddress } = useTokenStore();
  const airdropContractaddress = "0xDE93ec6b61A285D0DF219C8daD8D1D2Fb5C5a4C7";
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        address: airdropContractaddress,
        abi: AirdropContractABI,
        functionName: "totalAirdropAmount",
      },
      {
        address: airdropContractaddress,
        abi: AirdropContractABI,
        functionName: "canClaim",
        args: [userAddress, BigInt(500000), [MERKLE_PROOFS[0].merkleProofs[0]]], //TODO: change to user address, amount should come from event
      },
    ],
  });
  console.log("airdrop data", data);
  if (isError) {
    console.log("error", isError);
  }
  if (isLoading) {
    console.log("loading", isLoading);
  }

  return (
    <div className="content-wrapper-card p-5 flex flex-col gap-5">
      <div className="flex justify-between">
        <h5>Airdrop</h5>
        {/* <div className="flex gap-1 items-center">
          <UserIcon />
          <h5>{subgraphData?.cultToken?.holderCount}</h5>
        </div> */}
      </div>
      {/* <ProgressBar current={20} /> */}
      {/* <p className="text-white-76 text-sm">
        You can claim {subgraphData?.cultToken?.symbol} still available for sale in the bonding curve.
      </p> */}
      <p className="text-white-76 text-sm">
        When the market cap reaches $ 105,548.4 all the liquidity from the bonding curve will be deposited into SunSwap
        and burned. Progression increases as the price goes up.
      </p>
    </div>
  );
}

export default AirdropSection;
