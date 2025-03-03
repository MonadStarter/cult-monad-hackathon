const { MerkleTree } = require("merkletreejs");
const { ethers } = require("ethers");

const addresses = ["0x60187Bc4949eE2F01b507a9F77ad615093f44260", "0x4b6fff85ec612a536eb34e97a233ad0b82881dab"];

async function generateMerkleTreeAndProofs(addresses: string[]) {
  const totalAmountInBasisPoints = 1000000; // 100% = 1,000,000 basis points
  const percentagePerUser = totalAmountInBasisPoints / addresses.length;

  const leaves = addresses.map(address =>
    ethers.keccak256(ethers.solidityPacked(["address", "uint256"], [address, percentagePerUser])),
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
