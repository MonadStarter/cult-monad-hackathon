import { ethers, network } from "hardhat";
import { networkConfig } from "../helper-hardhat-config";
import { CultFactory } from "../typechain-types";
import { COMMUNITY_MERKLE_PROOFS } from "../../nextjs/constants/merkleRoots";

export const updateMerkleRoot = async () => {
  const accounts = await ethers.getSigners();
  const owner = accounts[0].address;
  const networkName = network.name;
  const deployer = networkConfig[networkName].deployer;
  console.log("Owner:", owner, "Deployer:", deployer);

  if (deployer?.toLowerCase() !== owner.toLowerCase()) {
    throw new Error("Deployer must be the Owner");
  }

  const factoryAddress = "0x817e5E8409130C2bFd1C23c00a0F36d13fFe9093";
  // Connect to the CultFactory contract instance at the provided factory address.
  const CultFactory = await ethers.getContractFactory("CultFactory");
  const cultFactory: CultFactory = CultFactory.attach(factoryAddress);
  console.log("Connected to CultFactory at:", factoryAddress);

    // Expect three parameters: factory address, merkle root, and holder count.
    // const merkleRoot = "0xc8bd7db1a7e3666f36b5e0bc38ee536ccd576db5e1ec4be7cd9b2d4422572aed"; // should be a valid 0x-prefixed 32-byte hex string
    // const holderCount = 2;
  
    // console.log("Merkle roots:", COMMUNITY_MERKLE_PROOFS);
  
    // Extract all merkle roots and their respective holder counts
    const communities = Object.keys(COMMUNITY_MERKLE_PROOFS);
    const merkleRoots = communities.map(community => ({
      name: community,
      root: COMMUNITY_MERKLE_PROOFS[community].MERKLE_ROOT,
      holderCount: COMMUNITY_MERKLE_PROOFS[community].addresses.length
    }));
  
    console.log("Found the following merkle roots to update:");
    merkleRoots.forEach(({ name, root, holderCount }) => {
      console.log(`- ${name}: ${root} (${holderCount} holders)`);
    });

  // Collect all merkle roots and holder counts into arrays
  const allRoots = merkleRoots.map(item => item.root);
  const allHolderCounts = merkleRoots.map(item => item.holderCount);

  console.log("Updating all merkle roots in a single transaction...");
  console.log("Roots:", allRoots);
  console.log("Holder counts:", allHolderCounts);

  // Make a single call with arrays of roots and holder counts
  const tx = await cultFactory.updateMerkleRoot(allRoots, allHolderCounts);
  console.log("Transaction submitted. Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("All merkle roots updated successfully in tx:", tx.hash);
};

updateMerkleRoot()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
