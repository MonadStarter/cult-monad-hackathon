import { ethers, network } from "hardhat";
import { networkConfig } from "../helper-hardhat-config";
import { CultFactory } from "../typechain-types";
export const updateMerkleRoot = async () => {
  // Expect three parameters: factory address, merkle root, and holder count.
  const factoryAddress = "0x72c06FFD9015aCd5314C4f550DcA15a2055be9c4";
  const merkleRoot = "0xa1f997c08e69f3d077c8514ada48bc66ef9c84b6f3d0d672ad282ee0af16b2d4"; // should be a valid 0x-prefixed 32-byte hex string
  const holderCount = 2;

  const accounts = await ethers.getSigners();
  //const owner = accounts[0].address;
  const networkName = network.name;
  const deployer = networkConfig[networkName].deployer;
  const owner = deployer;
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
