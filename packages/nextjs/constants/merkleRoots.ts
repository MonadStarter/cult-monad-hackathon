export const TEST_MERKE_ROOT = "0x5a5cafa93d753e8edd361f8b15dc879bacd79e660cc46dea8952b6d16d342e13";

export const MERKLE_PROOFS = [
  {
    MERKLE_ROOT: "0x5a5cafa93d753e8edd361f8b15dc879bacd79e660cc46dea8952b6d16d342e13",
    addresses: ["0x60187Bc4949eE2F01b507a9F77ad615093f44260", "0xA2A0a7C6C29143bF7F9612B0025CBB61c74bC06d"],
    merkleProofs: [
      "0x36b5f3f09fdb3b80fccbf57449a4b09064623df4d30916bbf995464cae87c5a4",
      "0x60a64c03e232af0472106a3c7ac8ea916fa559f38b4964435e642a452e23f435",
    ],
  },
];

export const NFTList = [
  { value: "monadverse", label: "Monadverse" },
  { value: "diamondHands", label: "Diamond Hands" },
  { value: "azuki", label: "azuki" },
  { value: "pudgyPenguin", label: "Pudgy Penguins" },
  { value: "milady", label: "Milady" },
];

export const diamondList = [];

export const COMMUNITY_MERKLE_PROOFS: {
  [key: string]: { MERKLE_ROOT: string; addresses: string[]; merkleProofs: string[] };
} = {
  monadverse: {
    MERKLE_ROOT: "0x5a5cafa93d753e8edd361f8b15dc879bacd79e660cc46dea8952b6d16d342e13",
    addresses: ["0x60187Bc4949eE2F01b507a9F77ad615093f44260", "0xA2A0a7C6C29143bF7F9612B0025CBB61c74bC06d"],
    merkleProofs: [
      "0x36b5f3f09fdb3b80fccbf57449a4b09064623df4d30916bbf995464cae87c5a4",
      "0x60a64c03e232af0472106a3c7ac8ea916fa559f38b4964435e642a452e23f435",
    ],
  },
  azuki: {
    MERKLE_ROOT: "0x5a5cafa93d753e8edd361f8b15dc879bacd79e660cc46dea8952b6d16d342e13",
    addresses: ["0x60187Bc4949eE2F01b507a9F77ad615093f44260", "0xA2A0a7C6C29143bF7F9612B0025CBB61c74bC06d"],
    merkleProofs: [
      "0x36b5f3f09fdb3b80fccbf57449a4b09064623df4d30916bbf995464cae87c5a4",
      "0x60a64c03e232af0472106a3c7ac8ea916fa559f38b4964435e642a452e23f435",
    ],
  },
  pudgyPenguin: {
    MERKLE_ROOT: "0x5a5cafa93d753e8edd361f8b15dc879bacd79e660cc46dea8952b6d16d342e13",
    addresses: ["0x60187Bc4949eE2F01b507a9F77ad615093f44260", "0xA2A0a7C6C29143bF7F9612B0025CBB61c74bC06d"],
    merkleProofs: [
      "0x36b5f3f09fdb3b80fccbf57449a4b09064623df4d30916bbf995464cae87c5a4",
      "0x60a64c03e232af0472106a3c7ac8ea916fa559f38b4964435e642a452e23f435",
    ],
  },
  milady: {
    MERKLE_ROOT: "0x5a5cafa93d753e8edd361f8b15dc879bacd79e660cc46dea8952b6d16d342e13",
    addresses: ["0x60187Bc4949eE2F01b507a9F77ad615093f44260", "0xA2A0a7C6C29143bF7F9612B0025CBB61c74bC06d"],
    merkleProofs: [
      "0x36b5f3f09fdb3b80fccbf57449a4b09064623df4d30916bbf995464cae87c5a4",
      "0x60a64c03e232af0472106a3c7ac8ea916fa559f38b4964435e642a452e23f435",
    ],
  },
  diamondHands: {
    MERKLE_ROOT: "0x5a5cafa93d753e8edd361f8b15dc879bacd79e660cc46dea8952b6d16d342e13",
    addresses: ["0x60187Bc4949eE2F01b507a9F77ad615093f44260", "0xA2A0a7C6C29143bF7F9612B0025CBB61c74bC06d"],
    merkleProofs: [
      "0x36b5f3f09fdb3b80fccbf57449a4b09064623df4d30916bbf995464cae87c5a4",
      "0x60a64c03e232af0472106a3c7ac8ea916fa559f38b4964435e642a452e23f435",
    ],
  },
};
