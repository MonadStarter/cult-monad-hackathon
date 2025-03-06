import { useState } from "react";
import { useAccount } from "wagmi";
import { MERKLE_PROOFS, TEST_MERKE_ROOT } from "~~/constants/merkleRoots";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { SocialLink } from "~~/types/types";
import { uploadMetadata, uploadToIPFS } from "~~/utils/externalAPIs/ipfs";

interface TokenCreationData {
  name: string;
  symbol: string;
  description: string;
  socials: SocialLink;
  tokenLogo: string | File | null;
  categories?: string[];
  initialBuyAmount?: string | number;
}

interface UseTokenCreationProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useTokenCreation = ({ onSuccess, onError }: UseTokenCreationProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { writeContractAsync: cultFactory, isMining: stakerPending } = useScaffoldWriteContract("CultFactory");
  const user = useAccount();

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

      formData.categories = formData.categories || [];
      //get merkle root for the categories

      // Create token transaction
      await cultFactory({
        functionName: "deploy",
        args: [user.address, metadataUri, formData.name, formData.symbol, MERKLE_PROOFS[0].MERKLE_ROOT, 50000, 604800],
        //value: 0,
      });
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
