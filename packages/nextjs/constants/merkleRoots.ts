export const TEST_MERKE_ROOT = "0xc8bd7db1a7e3666f36b5e0bc38ee536ccd576db5e1ec4be7cd9b2d4422572aed";

//addresses
// 0x60187Bc4949eE2F01b507a9F77ad615093f44260 - Moandad
// 0x7909bC836c98bE432c43CF58CE9442a6564026aE - Mokai
// 0x27fAa6497818EC151fb1828D68b60fB6966e4063 - Phoenad
// 0x5F16E39c8cE311DF6849be16Fd4A3fd5D90d9767 - Frost

// 0xa0F79a5804d5383E8436cC81630aA52067a1caf9 - flb
// 0xeb39E6F80546f0cE7B2BB2640EE198A8b875b91e - flb
export const MERKLE_PROOFS = [
  {
    MERKLE_ROOT: "0xc8bd7db1a7e3666f36b5e0bc38ee536ccd576db5e1ec4be7cd9b2d4422572aed",
    addresses: ["0x60187Bc4949eE2F01b507a9F77ad615093f44260", "0x4b6fff85ec612a536eb34e97a233ad0b82881dab"],
    merkleProofs: [
      "0xf0c104c887243db54e0cc448b63f1284e3af13a00cde58e538ce7e9d763919c6",
      "0xa5063977a6784561805deb48675126dbb96f4bde95f7a40d1b0a2c9c49da91fa",
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
    //moandad and mokai
    MERKLE_ROOT: "0xa1f997c08e69f3d077c8514ada48bc66ef9c84b6f3d0d672ad282ee0af16b2d4",
    addresses: ["0x60187Bc4949eE2F01b507a9F77ad615093f44260", "0x7909bC836c98bE432c43CF58CE9442a6564026aE"],
    merkleProofs: [
      "0x777357b2386bb31d9acbc7c7be6e0b0dd91fb3bdce906b979005b3e5c0e416a4",
      "0xa5063977a6784561805deb48675126dbb96f4bde95f7a40d1b0a2c9c49da91fa",
    ],
  },
  // flb 1 and flb 2
  azuki: {
    MERKLE_ROOT: "0x98598f2c033a2626b3765133ac6d73c164cd19e18a36c6b9d606c1007988923f",
    addresses: ["0xa0F79a5804d5383E8436cC81630aA52067a1caf9", "0xeb39E6F80546f0cE7B2BB2640EE198A8b875b91e"],
    merkleProofs: [
      "0xbdb0e5f03fbea1f1dcf966914693201ccd0cecbba233660dcb497a98691c2be0",
      "0x51aa349e4b9dae93394261a290e53cdf10e94b9746bc6843b3b8609b405a1d03",
    ],
  },
  // phoenad and frost
  pudgyPenguin: {
    MERKLE_ROOT: "0x2bc5759b3b694a9a54b9bd9bf2db96c9e9b07785838b1370a36c2b91531a8f08",
    addresses: ["0x27fAa6497818EC151fb1828D68b60fB6966e4063", "0x5F16E39c8cE311DF6849be16Fd4A3fd5D90d9767"],
    merkleProofs: [
      "0xa7aac365c5195545ac8f115fe2e2af8c616d034e2b59bf820cf2b1c2e3a60dec",
      "0xb21aef07e5c616828837a9c60736af50b86062f4fac98b79c6bb05366ddb8a73",
    ],
  },
  // moandad and flb 1
  milady: {
    MERKLE_ROOT: "0x3cd9028b873535ff3d633763242b8ee74ab0378661ea624a5136454ead8adacf",
    addresses: ["0x60187Bc4949eE2F01b507a9F77ad615093f44260", "0xa0F79a5804d5383E8436cC81630aA52067a1caf9"],
    merkleProofs: [
      "0x51aa349e4b9dae93394261a290e53cdf10e94b9746bc6843b3b8609b405a1d03",
      "0xa5063977a6784561805deb48675126dbb96f4bde95f7a40d1b0a2c9c49da91fa",
    ],
  },
  // moandad and mokai
  diamondHands: {
    MERKLE_ROOT: "0xa1f997c08e69f3d077c8514ada48bc66ef9c84b6f3d0d672ad282ee0af16b2d4",
    addresses: ["0x60187Bc4949eE2F01b507a9F77ad615093f44260", "0x7909bC836c98bE432c43CF58CE9442a6564026aE"],
    merkleProofs: [
      "0x777357b2386bb31d9acbc7c7be6e0b0dd91fb3bdce906b979005b3e5c0e416a4",
      "0xa5063977a6784561805deb48675126dbb96f4bde95f7a40d1b0a2c9c49da91fa",
    ],
  },
};
