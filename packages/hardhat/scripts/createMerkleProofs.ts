import { MerkleTree } from "merkletreejs";
import { ethers } from "ethers";

export async function generateMerkleTreeAndProofs(addresses: string[]) {
  // const totalAmountInBasisPoints = 1000000; // 100% = 1,000,000 basis points
  // const percentagePerUser = totalAmountInBasisPoints / addresses.length;
  // @note: not needed as we are calculating amount per recipient inside the contract

  const leaves = addresses.map(address => ethers.keccak256(ethers.solidityPacked(["address"], [address])));

  const tree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true });
  const root = tree.getHexRoot();

  const proofs = addresses.map((_, index) => tree.getHexProof(leaves[index]));
  return { root, proofs };
}

async function main() {
  const addresses = ["0x60187Bc4949eE2F01b507a9F77ad615093f44260", "0x7909bC836c98bE432c43CF58CE9442a6564026aE"];
  const { root, proofs } = await generateMerkleTreeAndProofs(addresses);
  console.log("Returned Merkle Root:", root);
  console.log("Returned Proofs:", proofs);
}

main().catch(console.error);
