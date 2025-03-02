const { MerkleTree } = require("merkletreejs");
const { ethers } = require("ethers");

const addresses = [
  "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
  "0x7909bC836c98bE432c43CF58CE9442a6564026aE",
];

async function generateMerkleTreeAndProofs(addresses: string[]) {
  const totalAmountInBasisPoints = 1000000; // 100% = 1,000,000 basis points
  const percentagePerUser = totalAmountInBasisPoints / addresses.length;

  const leaves = addresses.map((address) =>
    ethers.keccak256(
      ethers.solidityPacked(["address", "uint256"], [address, percentagePerUser])
    )
  );

  const tree = new MerkleTree(leaves, ethers.keccak256, {
    sortPairs: true,
  });
  const root = tree.getHexRoot();

  const proofs = addresses.map((_, index) => tree.getHexProof(leaves[index]));
  console.log("Merkle Root:", root);
  console.log("Proof for first address:", proofs[0]);


  return { root, proofs };
}

export default generateMerkleTreeAndProofs;
