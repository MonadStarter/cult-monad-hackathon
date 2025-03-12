import { ethers, network } from "hardhat";
import { networkConfig } from "../helper-hardhat-config.js";
import { CultFactory } from "../typechain-types";
export const updateMerkleRoot = async () => {
  // Expect three parameters: factory address, merkle root, and holder count.
  const factoryAddress = "0x817e5E8409130C2bFd1C23c00a0F36d13fFe9093";
  const merkleRoot = "0xc8bd7db1a7e3666f36b5e0bc38ee536ccd576db5e1ec4be7cd9b2d4422572aed"; // should be a valid 0x-prefixed 32-byte hex string
  const holderCount = 2;

  const accounts = await ethers.getSigners();
  const owner = accounts[0].address;
  const networkName = network.name;
  const deployer = networkConfig[networkName].deployer;
  console.log("Owner:", owner, "Deployer:", deployer);

  if (deployer?.toLowerCase() !== owner.toLowerCase()) {
    throw new Error("Deployer must be the Owner");
  }

  // Connect to the CultFactory contract instance at the provided factory address.
  const CultFactory = await ethers.getContractFactory("CultFactory");
  const cultFactory: CultFactory = CultFactory.attach(factoryAddress);
  console.log("Connected to CultFactory at:", factoryAddress);

  // Call updateMerkleRoot function.
  const tx = await cultFactory.updateMerkleRoot(merkleRoot, holderCount);
  console.log("Transaction submitted. Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("Merkle root updated successfully in tx:", tx.hash);
};

updateMerkleRoot()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
