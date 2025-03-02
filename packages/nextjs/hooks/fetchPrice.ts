// Assuming this path is correct for your project
import { Address, formatEther, parseEther } from "viem";
import { useContractRead, useContractReads } from "wagmi";
// Assuming you are using wagmi, adjust import if using a different library
import { CultContractABI } from "~~/constants/abis";
import { ETH_PRICE_USD } from "~~/constants/mockData";

// Or import from ethers if using ethers

interface UseTokenPriceProps {
  tokenAddress?: `0x${string}`; // Allow Address type from viem, string, or undefined
}

interface UseTokenPriceResult {
  price: string | undefined;
  circulatingSupply: string | undefined;
  marketCap: string | undefined;
  priceRefetch: () => void; // Adjust return type of refetch if needed based on your library
  priceLoading: boolean;
  priceError: Error | null;
}

const useGetMktCap = ({ tokenAddress }: UseTokenPriceProps) => {
  const {
    data: priceData,
    refetch: priceRefetch,
    isLoading: priceLoading,
    error: priceError,
  } = useContractReads({
    contracts: [
      {
        address: "0x0555de41fef0cdc94b8af276e12c75d14ae2bc76",
        abi: CultContractABI,
        functionName: "getTokenBuyQuote",
        args: [parseEther("1")],
      },
      {
        address: "0x0555de41fef0cdc94b8af276e12c75d14ae2bc76",
        abi: CultContractABI,
        functionName: "totalSupply",
      },
    ],
  });

  console.log("Address", tokenAddress as Address);
  console.log("CultContractABI", CultContractABI);

  let price: string | undefined = undefined;
  let circulatingSupply: string | undefined = undefined;
  let marketCap: string | undefined = undefined;

  console.log("PRICE DATA", priceData);

  if (priceData?.[0]?.result && priceData?.[1]?.result) {
    price = formatEther(priceData[0].result); // Convert price from wei to ether
    circulatingSupply = formatEther(priceData[1].result); // Convert supply from wei to ether

    // Calculate market cap by multiplying two string-based ETH values
    marketCap = (parseFloat(price) * parseFloat(circulatingSupply) * ETH_PRICE_USD).toString();
  }

  //console.log("priceData", price, circulatingSupply, marketCap);

  return {
    price,
    circulatingSupply,
    marketCap,
    priceRefetch,
    priceLoading,
    priceError,
  };
};

export default useGetMktCap;
