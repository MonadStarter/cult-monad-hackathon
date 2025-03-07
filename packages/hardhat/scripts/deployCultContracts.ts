import { ethers, upgrades, network } from "hardhat"
import { networkConfig, testNetworkChains } from "../helper-hardhat-config"
import { updateContractsJson } from "../utils/updateContracts"


export const setupContracts = async () => {
    let tx, txr, usdAddress, USDC
    const accounts = await ethers.getSigners()
    const networkName = network.name
    const owner = accounts[0].address
    const deployer = networkConfig[networkName].deployer
    // console.log(owner)

    if (deployer?.toLowerCase() !== owner.toLowerCase()) {
        throw Error("Deployer must be the Owner")
    }
    const startBlock: any = await ethers.provider.getBlock("latest")
    // console.log(startBlock!.number)

    const CultRewards = await ethers.getContractFactory("CultRewards")
    const cultRewards = await CultRewards.deploy()
    await cultRewards.waitForDeployment()
    // console.log("CultRewards deployed:", cultRewards.target)

    const CULT_RECS = "0x60187Bc4949eE2F01b507a9F77ad615093f44260"; // CultRecs multisig wallet
    const protocolFeeRecipient = CULT_RECS;
    const protocolRewards = cultRewards.target;
    // const weth = "0x4200000000000000000000000000000000000006";
    // const nonfungiblePositionManager = "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364";
    // const swapRouter = "0x1b81D678ffb9C0263b24A97847620C99d213eB14";
    //monad testnet addresses
    const weth = "0x261D8c5e9742e6f7f1076Fa1F560894524e19cad";
    const nonfungiblePositionManager = "0x50ff23E9A8D5DAc05744C367c9DDd588D027982B";
    const swapRouter = "0x201B36B26b816D061fC552B679f8279Db0Fbbc6A";

    // Deploy Contract
    const CultToken = await ethers.getContractFactory("Cult")
    const cultToken = await CultToken.deploy(protocolFeeRecipient, protocolRewards, weth, nonfungiblePositionManager, swapRouter)
    await cultToken.waitForDeployment()
    console.log("CultToken deployed:", cultToken.target)

    const BondingCurve = await ethers.getContractFactory("BondingCurve")
    const bondingCurve = await BondingCurve.deploy()
    await bondingCurve.waitForDeployment()
    console.log("BondingCurve deployed:", bondingCurve.target)

    const AirdropContract = await ethers.getContractFactory("AirdropContract")
    const airdropContract = await AirdropContract.deploy()
    await airdropContract.waitForDeployment()
    console.log("AirdropContract deployed:", airdropContract.target)

    const CultFactory = await ethers.getContractFactory("CultFactory")
    const cultFactory = await upgrades.deployProxy(CultFactory, [owner, cultToken.target, bondingCurve.target, airdropContract.target])
    await cultFactory.waitForDeployment()
    console.log("CultFactory deployed:", cultFactory.target)

    let contracts = [
        { name: "Cult", address: cultToken.target },
        { name: "BondingCurve", address: bondingCurve.target },
        { name: "CultRewards", address: cultRewards.target },
        { name: "AirdropContract", address: airdropContract.target },
        { name: "CultFactory", address: cultFactory.target },
        { name: "StartBlock", address: startBlock.number },
    ]

    updateContractsJson(contracts)
    console.table(contracts)

    if (
        testNetworkChains.includes(networkName) &&
        process.env.MONAD_API_KEY &&
        process.env.VERIFY_CONTRACTS === "true"
    ) {
        console.log("Verifying...")
        // await verify(cultToken.target.toString(), [protocolFeeRecipient, protocolRewards, weth, nonfungiblePositionManager, swapRouter])
        // await verify(bondingCurve.target.toString(), [])
        // await verify(airdropContract.target.toString(), [])
        // await verify(cultFactory.target.toString(), [cultToken.target, bondingCurve.target, airdropContract.target])
    }
    console.log("🚀🚀🚀 Cult Deployment Successful 🚀🚀🚀")
}

setupContracts()
    .then(() => process.exit(0))
    .catch((error: any) => {
        console.error(error)
        process.exit(1)
    })

