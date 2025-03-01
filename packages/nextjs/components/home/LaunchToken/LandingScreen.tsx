import { useState } from "react";
import { readContract, writeContract } from "@wagmi/core";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import InputField from "~~/components/common/InputField";
import FileInput from "~~/components/common/InputField/FileInput";
import { PLOT_FUN_CORE_ABI, PLOT_FUN_TRADING_ABI } from "~~/constants/abis";
import { PLOT_FUN_CORE_ADDRESS, PLOT_FUN_TRADING_ADDRESS } from "~~/constants/addresses";
import { DiscordIcon, GlobeIcon, TelegramIcon, XIcon } from "~~/icons/socials";

const TOTAL_SUPPLY = 1_000_000_000;
const CREATE_FEE = parseEther("0.0001");

// function BuyScreen({ tokenName, handleCreateToken }) {
//   const { isConnected } = useAccount();
//   const [tokenAmount, setTokenAmount] = useState("");
//   const [estimatedEth, setEstimatedEth] = useState("0");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const calculateRequiredEth = async amount => {
//     if (!amount || isNaN(Number(amount))) return "0";
//     try {
//       const amountInTokens = BigInt(Math.floor(Number(amount) * 1e18));
//       const totalSupplyWei = BigInt(TOTAL_SUPPLY) * BigInt(1e18);

//       if (amountInTokens > totalSupplyWei) {
//         setError("Amount exceeds total supply");
//         return "0";
//       }

//       const ethRequired = await readContract({
//         address: PLOT_FUN_TRADING_ADDRESS,
//         abi: PLOT_FUN_TRADING_ABI,
//         functionName: "calculateInitialBuyAmount",
//         args: [amountInTokens],
//       });

//       return formatEther(ethRequired + CREATE_FEE);
//     } catch (error) {
//       console.error("Error:", error);
//       return "0";
//     }
//   };

//   const handleAmountChange = async value => {
//     if (!/^\d*\.?\d*$/.test(value)) return;
//     setTokenAmount(value);
//     setError("");

//     if (value) {
//       setLoading(true);
//       const ethNeeded = await calculateRequiredEth(value);
//       setEstimatedEth(ethNeeded);
//       setLoading(false);
//     } else {
//       setEstimatedEth("0");
//     }
//   };

//   const handleSubmit = async () => {
//     if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
//       setError("Please enter a valid amount");
//       return;
//     }

//     setLoading(true);
//     try {
//       const amountInTokens = BigInt(Math.floor(Number(tokenAmount) * 1e18));
//       await handleCreateToken(amountInTokens.toString());
//     } catch (err) {
//       setError(err.message || "Failed to create token");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-lg flex flex-col gap-4 py-2">
//       {error && <p className="text-red-500 text-sm">{error}</p>}
//       <InputField
//         type="text"
//         endIcon={
//           <div className="flex items-center gap-2">
//             <p className="uppercase">{tokenName}</p>
//             <p className="text-sm text-gray-500">{loading ? "Calculating..." : `≈ ${estimatedEth} ETH`}</p>
//           </div>
//         }
//         placeholder="Enter amount of tokens"
//         value={tokenAmount}
//         onChange={e => handleAmountChange(e.target.value)}
//       />
//       <button
//         className="bg-primary-500 text-white-500 justify-center w-full p-2 rounded disabled:opacity-50"
//         onClick={handleSubmit}
//         disabled={loading || !tokenAmount || !!error}
//       >
//         {loading ? "Processing..." : "Create and Buy Tokens"}
//       </button>
//     </div>
//   );
// }

function LandingScreen({ handleNext }: { handleNext: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const { isConnected } = useAccount();

  // const [socials, setSocials] = useState({
  //   twitter: "",
  //   telegram: "",
  //   discord: "",
  //   website: "",
  // });

  // const uploadToIPFS = async file => {
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
  //     method: "POST",
  //     headers: {
  //       pinata_api_key: process.env.NEXT_PUBLIC_PINATA_PROJECT_ID || "",
  //       pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "",
  //     },
  //     body: formData,
  //   });

  //   if (!response.ok) throw new Error("Failed to upload file");
  //   const data = await response.json();
  //   return `ipfs://${data.IpfsHash}`;
  // };

  // const uploadMetadata = async imageUrl => {
  //   const metadata = {
  //     name: tokenName,
  //     symbol: tokenSymbol,
  //     description,
  //     image: imageUrl,
  //     socials,
  //   };

  //   const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       pinata_api_key: process.env.NEXT_PUBLIC_PINATA_PROJECT_ID || "",
  //       pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "",
  //     },
  //     body: JSON.stringify(metadata),
  //   });

  //   if (!response.ok) throw new Error("Failed to upload metadata");
  //   const data = await response.json();
  //   return `ipfs://${data.IpfsHash}`;
  // };

  // const handleInitialStep = async () => {
  //   setError("");

  //   if (!tokenName || !tokenSymbol) {
  //     setError("Token name and symbol are required");
  //     return;
  //   }

  //   const fileInput = document.querySelector('input[type="file"]');
  //   if (!fileInput?.files?.[0]) {
  //     setError("Please upload a logo");
  //     return;
  //   }

  //   try {
  //     setIsUploading(true);
  //     const imageUrl = await uploadToIPFS(fileInput.files[0]);
  //     const metadataUrl = await uploadMetadata(imageUrl);
  //     setMetadataUri(metadataUrl);
  //     setCurrentStep(2);
  //   } catch (error) {
  //     console.error("Error:", error);
  //     setError("Failed to prepare token creation");
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  // const handleCreateToken = async initialBuyAmount => {
  //   try {
  //     const totalRequired = await readContract({
  //       address: PLOT_FUN_CORE_ADDRESS,
  //       abi: PLOT_FUN_CORE_ABI,
  //       functionName: "calculateRequiredEth",
  //       args: [initialBuyAmount],
  //     });

  //     const { request } = await prepareWriteContract({
  //       address: PLOT_FUN_CORE_ADDRESS,
  //       abi: PLOT_FUN_CORE_ABI,
  //       functionName: "createToken",
  //       args: [
  //         tokenName,
  //         tokenSymbol,
  //         metadataUri,
  //         [], // airdropRecipients
  //         [], // airdropPercentages
  //         initialBuyAmount,
  //       ],
  //       value: totalRequired,
  //     });

  //     const { hash } = await writeContract(request);
  //     console.log("Transaction hash:", hash);
  //     handleNext();
  //   } catch (error) {
  //     throw new Error(error.message || "Failed to create token");
  //   }
  // };

  // if (currentStep === 2) {
  //   return <BuyScreen tokenName={tokenName} handleCreateToken={handleCreateToken} />;
  // }

  return (
    <form className="py-4 flex flex-col gap-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-4">
        <div className="w-4/6 flex flex-col gap-4">
          <InputField
            placeholder="Enter token name"
            label="Token Name"
            inputClassName="text-sm"
            value={tokenName}
            onChange={e => setTokenName(e.target.value)}
          />
          <InputField
            placeholder="Enter token symbol"
            label="Token Symbol"
            inputClassName="text-sm"
            value={tokenSymbol}
            onChange={e => setTokenSymbol(e.target.value)}
          />
        </div>
        <div className="w-2/6 flex flex-col gap-1">
          <p className="text-sm">Token Logo*</p>
          <FileInput />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm">Description</p>
        <div className="input-field-container !h-full">
          <textarea
            rows={4}
            className="input-field resize-none text-sm"
            placeholder="Add a description for a token"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm">Social Links</p>
        <div className="grid grid-cols-2 gap-2">
          <InputField
            placeholder="X (twitter)"
            endIcon={<SocialIcon icon={<XIcon />} />}
            value={socials.twitter}
            onChange={e => setSocials({ ...socials, twitter: e.target.value })}
          />
          <InputField
            placeholder="Telegram"
            endIcon={<SocialIcon icon={<TelegramIcon />} />}
            value={socials.telegram}
            onChange={e => setSocials({ ...socials, telegram: e.target.value })}
          />
          <InputField
            placeholder="Discord"
            endIcon={<SocialIcon icon={<DiscordIcon />} />}
            value={socials.discord}
            onChange={e => setSocials({ ...socials, discord: e.target.value })}
          />
          <InputField
            placeholder="Website"
            endIcon={<SocialIcon icon={<GlobeIcon />} />}
            value={socials.website}
            onChange={e => setSocials({ ...socials, website: e.target.value })}
          />
        </div>
      </div>
      <button
        type="button"
        className="bg-primary-500 text-white-500 w-full justify-center p-2 rounded disabled:opacity-50"
        // onClick={handleInitialStep}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Next"}
      </button>
    </form>
  );
}

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => <div className="p-2 bg-primary-500 rounded-lg">{icon}</div>;

export default LandingScreen;
