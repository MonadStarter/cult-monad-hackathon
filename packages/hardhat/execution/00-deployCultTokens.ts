0x2eb671e6e0cd965a79a80caf35c5123b7a5d8ebb;

import { ethers, network } from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import netMap from "../constants/networkMapping.json";
import { forkedChain, networkConfig } from "../helper-hardhat-config";
import { Cult, CultFactory } from "../typechain-types";
import CultFactoryABI from "../constants/abis/CultFactory.json";
import CultABI from "../constants/abis/Cult.json";
import generateMerkleTreeAndProofs from "../scripts/createMerkleProofs";

const main = async () => {
  let tx, txr, deployer;
  const networkName: any = network.name as keyof typeof netMap;

  if (forkedChain.includes(networkName)) {
    console.log("here");
    await helpers.mine();
    const provider = ethers.provider;
    deployer = new ethers.Wallet(
      process.env.PRIVATE_KEY_ADMIN!.toString(),
      provider
    );
  } else {
    [deployer] = await ethers.getSigners();
  }

  console.log(deployer);

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

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance", balance);
  tx = await cultFactory.deploy(
    deployer.address,
    "ipfs://Qmchtxo6xqjASjfLa1SSxfs8HM1NW2ceshjNir1KXSy5Br",
    "Cult Token",
    "CT",
    merkleRoot.root,
    50000,
    604800,
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


// By Moandad
// "monadTestnet": {
//   "Cult": "0xc63fc6bE9A45d3D96e849eC8c6489367a6f1Aa16",
//   "BondingCurve": "0x5441d4dACe413ab97D1Ee2461E5c77E825417911",
//   "CultRewards": "0xF4590dCEF3450b80ac2DF5c024A1fd0c152109dC",
//   "AirdropContract": "0xF241d9BdEb9c5a4ffCDD7FDDb539cFD16C0649d7",
//   "CultFactory": "0x86CF9229546e021b2C926E208591A8A312aC52f0",
//   "StartBlock": 4946342
// },