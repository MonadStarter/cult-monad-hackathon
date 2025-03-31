const { expect } = require("chai");
const { ethers } = require("hardhat");
require("@nomicfoundation/hardhat-ethers");
const { BigNumber } = ethers;

describe("BondingCurve", function () {
  let bondingCurve;
  const totalSupply = ethers.parseEther("10000000000"); // 10 billion tokens

  // Helper function to format ETH values for readability
  const formatEth = (wei) => ethers.formatEther(wei);

  // Helper function to calculate market cap in USD
  const calculateMarketCapUSD = (tokenSupply, tokenPriceETH, ethPriceUSD) => {
    const tokenPriceUSD = parseFloat(formatEth(tokenPriceETH)) * ethPriceUSD;
    return tokenPriceUSD * parseInt(tokenSupply.toString());
  };

  beforeEach(async function () {
    const BondingCurve = await ethers.getContractFactory("BondingCurve");
    bondingCurve = await BondingCurve.deploy();
    await bondingCurve.waitForDeployment();

    // Verify the constants
    const A = await bondingCurve.A();
    const B = await bondingCurve.B();

    console.log(`Contract deployed with parameters:`);
    console.log(`- A: ${A.toString()} (${formatEth(A)} ETH)`);
    console.log(`- B: ${B.toString()} (${formatEth(B)})`);
  });

  describe("Constant verification", function () {
    it("Should have the correct A and B values", async function () {
      const A = await bondingCurve.A();
      const B = await bondingCurve.B();

      expect(A).to.equal("120000000000000"); // 0.00000012 ETH
      expect(B).to.equal("259000000"); // 2.59 * 10^-10
    });
  });

  describe("Token Buy Quotes", function () {
    it("Should calculate correct ETH amount for various token buy amounts", async function () {
      const scenarios = [
        { circulatingSupply: 0, buyAmount: ethers.parseEther("100000000") }, // Buy 1% of total supply
        { circulatingSupply: ethers.parseEther("1000000000"), buyAmount: ethers.parseEther("100000000") }, // Buy 1% when 10% is already in circulation
        { circulatingSupply: ethers.parseEther("5000000000"), buyAmount: ethers.parseEther("100000000") }, // Buy 1% when 50% is already in circulation
        { circulatingSupply: ethers.parseEther("9000000000"), buyAmount: ethers.parseEther("100000000") }, // Buy 1% when 90% is already in circulation
      ];

      for (const scenario of scenarios) {
        const ethRequired = await bondingCurve.getTokenBuyQuote(scenario.circulatingSupply, scenario.buyAmount);
        const averagePricePerToken = ethRequired.div(scenario.buyAmount);
        const ethPriceUSD = 5;
        const tokenPriceUSD = parseFloat(formatEth(averagePricePerToken)) * ethPriceUSD;

        console.log(`\nBuy ${formatEth(scenario.buyAmount)} tokens at circulating supply ${formatEth(scenario.circulatingSupply)}:`);
        console.log(
          `- ETH required: ${formatEth(ethRequired)} ETH ($${parseFloat(formatEth(ethRequired)) * ethPriceUSD} USD)`,
        );
        console.log(`- Avg price per token: ${formatEth(averagePricePerToken)} ETH ($${tokenPriceUSD} USD)`);

        // Verify that buying tokens increases in price as circulating supply increases
        if (scenario.circulatingSupply > 0) {
          const prevEthRequired = await bondingCurve.getTokenBuyQuote(
            scenario.circulatingSupply.sub(ethers.parseEther("1000000000")),
            scenario.buyAmount,
          );
          expect(ethRequired).to.be.gt(prevEthRequired);
        }
      }
    });
  });

  describe("Token Sell Quotes", function () {
    it("Should calculate correct ETH amount for various token sell amounts", async function () {
      const scenarios = [
        { circulatingSupply: ethers.parseEther("1000000000"), sellAmount: ethers.parseEther("100000000") }, // Sell 1% when 10% is in circulation
        { circulatingSupply: ethers.parseEther("5000000000"), sellAmount: ethers.parseEther("100000000") }, // Sell 1% when 50% is in circulation
        { circulatingSupply: ethers.parseEther("10000000000"), sellAmount: ethers.parseEther("100000000") }, // Sell 1% when 100% is in circulation
      ];

      for (const scenario of scenarios) {
        const ethReceived = await bondingCurve.getTokenSellQuote(scenario.circulatingSupply, scenario.sellAmount);
        const averagePricePerToken = ethReceived.div(scenario.sellAmount);
        const ethPriceUSD = 5;
        const tokenPriceUSD = parseFloat(formatEth(averagePricePerToken)) * ethPriceUSD;

        console.log(`\nSell ${formatEth(scenario.sellAmount)} tokens at circulating supply ${formatEth(scenario.circulatingSupply)}:`);
        console.log(
          `- ETH received: ${formatEth(ethReceived)} ETH ($${parseFloat(formatEth(ethReceived)) * ethPriceUSD} USD)`,
        );
        console.log(`- Avg price per token: ${formatEth(averagePricePerToken)} ETH ($${tokenPriceUSD} USD)`);

        // Verify that selling tokens decreases in price as circulating supply decreases
        if (scenario.circulatingSupply < totalSupply) {
          const prevEthReceived = await bondingCurve.getTokenSellQuote(
            scenario.circulatingSupply.add(ethers.parseEther("1000000000")),
            scenario.sellAmount,
          );
          expect(ethReceived).to.be.lt(prevEthReceived);
        }
      }
    });

    it("Should revert when trying to sell more tokens than available", async function () {
      await expect(bondingCurve.getTokenSellQuote(ethers.parseEther("1000000000"), ethers.parseEther("2000000000"))).to.be.revertedWith(
        "InsufficientLiquidity",
      );
    });
  });

  describe("ETH Buy Quotes", function () {
    it("Should calculate correct token amount for various ETH buy amounts", async function () {
      const scenarios = [
        { circulatingSupply: 0, ethAmount: ethers.parseEther("0.1") }, // Buy with 0.1 ETH at 0 supply
        { circulatingSupply: ethers.parseEther("1000000000"), ethAmount: ethers.parseEther("0.1") }, // Buy with 0.1 ETH at 10% supply
        { circulatingSupply: ethers.parseEther("5000000000"), ethAmount: ethers.parseEther("0.1") }, // Buy with 0.1 ETH at 50% supply
        { circulatingSupply: ethers.parseEther("9000000000"), ethAmount: ethers.parseEther("0.1") }, // Buy with 0.1 ETH at 90% supply
      ];

      for (const scenario of scenarios) {
        const tokensReceived = await bondingCurve.getEthBuyQuote(scenario.circulatingSupply, scenario.ethAmount);
        const ethPriceUSD = 5;

        console.log(`\nBuy with ${formatEth(scenario.ethAmount)} ETH at circulating supply ${formatEth(scenario.circulatingSupply)}:`);
        console.log(`- Tokens received: ${formatEth(tokensReceived)}`);
        console.log(
          `- Cost per token: ${formatEth(scenario.ethAmount.mul(BigNumber.from(10).pow(18)).div(tokensReceived))} ETH`,
        );

        // Verify that fewer tokens are received as circulating supply increases (price increases)
        if (scenario.circulatingSupply > 0) {
          const prevTokensReceived = await bondingCurve.getEthBuyQuote(
            scenario.circulatingSupply.sub(ethers.parseEther("1000000000")),
            scenario.ethAmount,
          );
          expect(tokensReceived).to.be.lt(prevTokensReceived);
        }
      }
    });
  });

  describe("ETH Sell Quotes", function () {
    it("Should calculate correct token amount for various ETH sell amounts", async function () {
      const scenarios = [
        { circulatingSupply: ethers.parseEther("1000000000"), ethAmount: ethers.parseEther("0.1") }, // Sell for 0.1 ETH at 10% supply
        { circulatingSupply: ethers.parseEther("5000000000"), ethAmount: ethers.parseEther("0.1") }, // Sell for 0.1 ETH at 50% supply
        { circulatingSupply: ethers.parseEther("10000000000"), ethAmount: ethers.parseEther("0.1") }, // Sell for 0.1 ETH at 100% supply
      ];

      for (const scenario of scenarios) {
        const tokensSold = await bondingCurve.getEthSellQuote(scenario.circulatingSupply, scenario.ethAmount);
        const ethPriceUSD = 5;

        console.log(`\nSell for ${formatEth(scenario.ethAmount)} ETH at circulating supply ${formatEth(scenario.circulatingSupply)}:`);
        console.log(`- Tokens sold: ${formatEth(tokensSold)}`);
        console.log(
          `- Price per token: ${formatEth(scenario.ethAmount.mul(BigNumber.from(10).pow(18)).div(tokensSold))} ETH`,
        );

        // Verify that more tokens need to be sold as circulating supply decreases (price decreases)
        if (scenario.circulatingSupply < totalSupply) {
          const prevTokensSold = await bondingCurve.getEthSellQuote(
            scenario.circulatingSupply.add(ethers.parseEther("1000000000")),
            scenario.ethAmount,
          );
          expect(tokensSold).to.be.gt(prevTokensSold);
        }
      }
    });
  });
});