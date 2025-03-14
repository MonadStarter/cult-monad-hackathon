export interface networkConfigItem {
  chainId: number;
  deployer: string;
  StartBlock?: number;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  hardhat: {
    chainId: 31337,
    deployer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  },
  localhost: {
    chainId: 31337,
    deployer: "0x7909bC836c98bE432c43CF58CE9442a6564026aE",
  },
  monadTestnet: {
    chainId: 10143,
    // deployer: "0x60187Bc4949eE2F01b507a9F77ad615093f44260",
    deployer: "0x7909bC836c98bE432c43CF58CE9442a6564026aE",
  },
};

export const forkedChain = ["localhost"];
export const testNetworkChains = ["monadTestnet"];
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
