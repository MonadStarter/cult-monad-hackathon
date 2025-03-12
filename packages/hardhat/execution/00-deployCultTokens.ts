0x2eb671e6e0cd965a79a80caf35c5123b7a5d8ebb;

import { ethers, network } from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import netMap from "../constants/networkMapping.json";
import { forkedChain } from "../helper-hardhat-config";
import { CultFactory } from "../typechain-types";
import CultFactoryABI from "../constants/abis/CultFactory.json";
import { generateMerkleTreeAndProofs } from "../scripts/createMerkleProofs";

const main = async () => {
  let tx, txr, deployer;
  const networkName: any = network.name as keyof typeof netMap;

  if (forkedChain.includes(networkName)) {
    await helpers.mine();
    const provider = ethers.provider;
    deployer = new ethers.Wallet(
      process.env.PRIVATE_KEY_ADMIN!.toString(),
      provider
    );
  } else {
    [deployer] = await ethers.getSigners();
  }

  const cultFactory: CultFactory = new ethers.Contract(
    netMap[networkName].CultFactory,
    CultFactoryABI,
    deployer
  );

  const addresses = [
    "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
    "0x7909bC836c98bE432c43CF58CE9442a6564026aE",
  ];

  const merkleRoot = await generateMerkleTreeAndProofs(addresses);
  console.log("Merkle Root", merkleRoot);

  tx = await cultFactory.updateMerkleRoot(
    "0x4baf9b443159aead6555661e406ef9f0e21dea084fee185a5b226015d77ffadc",
    50000
  );
  txr = await tx.wait();
  console.log("Merkle Root updated", tx.hash);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance", balance);
  tx = await cultFactory.deploy(
    deployer.address,
    "ipfs://Qmchtxo6xqjASjfLa1SSxfs8HM1NW2ceshjNir1KXSy5Br",
    "Cult Token",
    "CT",
    ["0x4baf9b443159aead6555661e406ef9f0e21dea084fee185a5b226015d77ffadc"],
    50000,
    // {
    //   value: ethers.parseEther("0.001"),
    // }
  );
  txr = await tx.wait();
  console.log("Cult Token deployed", tx.hash);
  console.log("txr", txr?.logs);

}

main()
  .then(() => process.exit(0))
  .catch((error: any) => {
    console.error(error);
    process.exit(1);
  });