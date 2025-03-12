import { IPFSMetadata, SocialLink } from "~~/types/types";

export const uploadToIPFS = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  console.log("IPFS", process.env.NEXT_PUBLIC_PINATA_PROJECT_ID, process.env.NEXT_PUBLIC_PINATA_SECRET_KEY);

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: process.env.NEXT_PUBLIC_PINATA_PROJECT_ID || "494fdffeaa7d7a658f72",
      pinata_secret_api_key:
        process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "076e95c9429a4d942f3507ac0add974b8eb8faf3b0ddfd41179ae21894bc4e9c",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to upload file: ${response.status} - ${errorData?.message || response.statusText}`);
  }

  const data = await response.json();
  return `ipfs://${data.IpfsHash}`;
};

export const uploadMetadata = async (
  imageUrl: string,
  tokenName: string,
  tokenSymbol: string,
  description: string,
  socials: SocialLink,
): Promise<string> => {
  const metadata: IPFSMetadata = {
    name: tokenName,
    symbol: tokenSymbol,
    description,
    imageUrl,
    socials,
  };

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: process.env.NEXT_PUBLIC_PINATA_PROJECT_ID || "494fdffeaa7d7a658f72",
      pinata_secret_api_key:
        process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "076e95c9429a4d942f3507ac0add974b8eb8faf3b0ddfd41179ae21894bc4e9c",
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to upload metadata: ${response.status} - ${errorData?.message || response.statusText}`);
  }

  const data = await response.json();
  return `ipfs://${data.IpfsHash}`;
};

export interface SocialLink {
  twitter?: string;
  telegram?: string;
  discord?: string;
  website?: string;
}

export interface IPFSMetadata {
  name: string;
  symbol: string;
  description: string;
  socials: SocialLink;
  imageUrl: File | string | null; // For file input
}

export function parseIPFSMetadata(jsonString: string): IPFSMetadata | null {
  try {
    const parsedData = JSON.parse(jsonString);

    let imageUrl = "";
    if (typeof parsedData.imageUrl === "string" && parsedData.imageUrl.startsWith("ipfs://")) {
      const ipfsId = parsedData.imageUrl.replace("ipfs://", "");
      // Ensure ipfsId doesn't start with a leading slash, and if it does, remove it
      const cleanIpfsId = ipfsId.startsWith("/") ? ipfsId.substring(1) : ipfsId;
      imageUrl = `https://gateway.pinata.cloud/ipfs/${cleanIpfsId}`;
    }

    const metadata: IPFSMetadata = {
      name: parsedData.name || "",
      symbol: parsedData.symbol || "",
      description: parsedData.description || "",
      socials: {
        twitter: parsedData.socials?.twitter || undefined,
        telegram: parsedData.socials?.telegram || undefined,
        discord: parsedData.socials?.discord || undefined,
        website: parsedData.socials?.website || undefined,
      },
      imageUrl: imageUrl || null,
    };

    return metadata;
  } catch (error) {
    console.error("Failed to parse IPFS metadata:", error);
    return null;
  }
}

export const fetchMetadataFromIPFS = async (tokenURI?: string): Promise<IPFSMetadata | undefined> => {
  if (!tokenURI) return;

  try {
    if (tokenURI.startsWith("ipfs://")) {
      const ipfsUrl = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      const response = await fetch(ipfsUrl);
      if (response.ok) {
        const metaData = await response.json();
        console.log("META DATA", metaData);
        if (metaData && metaData.imageUrl) {
          if (typeof metaData.imageUrl === "string" && metaData.imageUrl.startsWith("ipfs://")) {
            const ipfsId = metaData.imageUrl.replace("ipfs://", "");
            // Ensure ipfsId doesn't start with a leading slash, and if it does, remove it
            const cleanIpfsId = ipfsId.startsWith("/") ? ipfsId.substring(1) : ipfsId;
            metaData.imageUrl = `https://gateway.pinata.cloud/ipfs/${cleanIpfsId}`;
          }
        }

        return metaData;
      } else {
        // Handle non-ok response, return undefined to indicate failure to fetch metadata
        return undefined;
      }
    } else {
      // Handle cases where tokenURI doesn't start with "ipfs://", return undefined as no IPFS metadata to fetch
      return undefined;
    }
  } catch (err) {
    console.error("Error fetching token metadata from IPFS:", err);
    // Handle error during fetch, return undefined to indicate failure to fetch metadata
    return undefined;
  }
};

// setMetadata({
//   ...metaData,
//   image: metaData.image ? metaData.image.replace("ipfs://", "https://ipfs.io/ipfs/") : "/placeholder.png",
// });

// setMetadata({
//   ...dummyMetadata,
//   name: subgraphData.cultToken.name,
//   symbol: subgraphData.cultToken.symbol,
//   tokenAddress: tokenAddress!,
//   marketCap: "0",
//   description: "No description available",
//   image: "https://picsum.photos/200",
// });
