import { useState } from "react";
import { useAccount } from "wagmi";
import { useWriteContract } from "wagmi";
import { CultFactoryABI, CultFactoryAddress } from "~~/constants/abis";
import { COMMUNITY_MERKLE_PROOFS, MERKLE_PROOFS } from "~~/constants/merkleRoots";
import { useTransactor } from "~~/hooks/scaffold-eth";
//import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { SocialLink } from "~~/types/types";
import { uploadMetadata, uploadToIPFS } from "~~/utils/externalAPIs/ipfs";

interface TokenCreationData {
  name: string;
  symbol: string;
  description: string;
  socials: SocialLink;
  tokenLogo: string | File | null;
  airdrop: string[];
  airdropPercentage: number;
  initialBuyAmount?: string | number;
}

interface UseTokenCreationProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

function getAirdropMerkleRoot(airdropList: string[]): string[] {
  let airdropMerkleRoot: string[] = [];

  if (airdropList.length > 0) {
    airdropMerkleRoot = airdropList.map((airdropId: string) => {
      if (COMMUNITY_MERKLE_PROOFS[airdropId]) {
        return COMMUNITY_MERKLE_PROOFS[airdropId].MERKLE_ROOT;
      } else {
        console.error(`Airdrop ID '${airdropId}' not found in COMMUNITY_MERKLE_PROOFS.`);
        return ""; // Or handle the error appropriately. Returning an empty string will prevent the code from crashing.
      }
    });
  } else {
    airdropMerkleRoot = [COMMUNITY_MERKLE_PROOFS["diamondHands"].MERKLE_ROOT];
  }

  return airdropMerkleRoot;
}

export const useTokenCreation = ({ onSuccess, onError }: UseTokenCreationProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  //const { writeContractAsync: cultFactory, isMining: stakerPending } = useScaffoldWriteContract("CultFactory");
  const user = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const writeTx = useTransactor();

  const writeCreateAsyncWithParams = async (args: any) => {
    //setIsPendingBuy(true);
    try {
      await writeTx(() =>
        writeContractAsync({
          address: CultFactoryAddress,
          abi: CultFactoryABI,
          functionName: "deploy",
          //value: parseEther(amount),
          args: args,
        }),
      );
    } catch (e: any) {
      console.log(e.message || "Purchase failed");
      //setError(e.message || "Purchase failed");
    }
  };

  const createToken = async (formData: TokenCreationData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.tokenLogo) {
        throw new Error("Token logo is required");
      }
      //const metadataUri = "asdf";

      // Upload logo to IPFS
      const imageUrl = await uploadToIPFS(formData.tokenLogo as File);

      //   // Upload metadata to IPFS
      const metadataUri = await uploadMetadata(
        imageUrl,
        formData.name,
        formData.symbol,
        formData.description,
        formData.socials,
      );

      // Calculate required ETH
      // const { data: totalRequired } = useScaffoldReadContract({
      //   contractName: "BondingCurve",
      //   functionName: "getTokenBuyQuote",
      //   args: [BigInt(10000000), formData.initialBuyAmount],
      //   watch: true,
      // });

      //get merkle root for the categories
      let airdropMerkleRoot: string[] = getAirdropMerkleRoot(formData.airdrop || ["diamondHands"]);
      const airdropPercentage = formData.airdropPercentage * 10000;
      const args = [user.address, metadataUri, formData.name, formData.symbol, airdropMerkleRoot, airdropPercentage];
      console.log("args", args);
      //      console.log("cultFactory", cultFactory);
      await writeCreateAsyncWithParams(args);
      // Create token transaction
      // await cultFactory({
      //   functionName: "deploy",
      //   args: args,
      //   //value: 0,
      // });
      return metadataUri;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create token");
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createToken,
    isLoading,
    error,
  };
};
