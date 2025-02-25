import { ethers, network } from "hardhat"
import { networkConfig } from "../helper-hardhat-config"
import { updateContractsJson } from "../utils/updateContracts"

export const deployContracts = async () => {
    const accounts = await ethers.getSigners()
    const networkName = network.name
    const owner = accounts[0].address
    // console.log(owner)
    const deployer = networkConfig[networkName].deployer
    console.log(deployer)

    const startBlock: any = await ethers.provider.getBlock("latest")
    // console.log(startBlock!.number)

    const BondingCurve = await ethers.getContractFactory("BondingCurve")
    const bondingCurve = await BondingCurve.deploy()
    await bondingCurve.waitForDeployment()
    console.log("BondingCurve deployed:", bondingCurve.target)

    let contracts = [
        { name: "BondingCurve", address: bondingCurve.target },
        { name: "StartBlock", address: startBlock.number },
    ]

    updateContractsJson(contracts)
    console.table(contracts)

    console.log("🚀🚀🚀 Cult Deployment Successful 🚀🚀🚀")
}

deployContracts()
    .then(() => process.exit(0))
    .catch((error: any) => {
        console.error(error)
        process.exit(1)
    })

