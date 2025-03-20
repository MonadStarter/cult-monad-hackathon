const { expect } = require("chai");
// const { ethers } = require("hardhat");
const { ethers } = require("ethers");

const { BigNumber } = ethers;

describe("BondingCurve", function () {
  let bondingCurve;
  const totalSupply = ethers.utils.parseEther("10000000000"); // 10 billion tokens

  // Helper function to format ETH values for readability
  const formatEth = wei => ethers.utils.formatEther(wei);

  // Helper function to calculate market cap in USD
  const calculateMarketCapUSD = (tokenSupply, tokenPriceETH, ethPriceUSD) => {
    const tokenPriceUSD = parseFloat(formatEth(tokenPriceETH)) * ethPriceUSD;
    return tokenPriceUSD * parseInt(tokenSupply.toString());
  };

  beforeEach(async function () {
    const BondingCurve = await ethers.getContractFactory("BondingCurve");
    bondingCurve = await BondingCurve.deploy();
    await bondingCurve.deployed();

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

      expect(A).to.equal(BigNumber.from("120000000000000")); // 0.00000012 ETH
      expect(B).to.equal(BigNumber.from("259000000")); // 2.59 * 10^-10
    });
  });

  describe("Market cap verification", function () {
    it("Should start with approximately $6k market cap at 0 supply", async function () {
      const ethPriceUSD = 5; // $5 per ETH
      const zeroSupply = BigNumber.from("0");

      // Token price at 0 supply should be equal to A
      const A = await bondingCurve.A();
      const initialTokenPriceETH = A;
      const initialMarketCapUSD = calculateMarketCapUSD(totalSupply, initialTokenPriceETH, ethPriceUSD);

      console.log(
        `Initial token price: ${formatEth(initialTokenPriceETH)} ETH ($${formatEth(initialTokenPriceETH) * ethPriceUSD} USD)`,
      );
      console.log(`Initial market cap: $${initialMarketCapUSD}`);

      expect(initialMarketCapUSD).to.be.approximately(6000, 100); // Around $6k with some tolerance
    });

    it("Should reach approximately $80k market cap at full supply", async function () {
      const ethPriceUSD = 5; // $5 per ETH

      // Calculate token price at full supply using the bonding curve formula
      const buyAmount = await bondingCurve.getTokenBuyQuote(BigNumber.from("0"), totalSupply);
      const tokenPriceAtFullSupply = buyAmount.div(totalSupply);

      const finalMarketCapUSD = calculateMarketCapUSD(totalSupply, tokenPriceAtFullSupply, ethPriceUSD);

      console.log(
        `Final token price: ${formatEth(tokenPriceAtFullSupply)} ETH ($${formatEth(tokenPriceAtFullSupply) * ethPriceUSD} USD)`,
      );
      console.log(`Final market cap: $${finalMarketCapUSD}`);

      expect(finalMarketCapUSD).to.be.approximately(80000, 5000); // Around $80k with some tolerance
    });
  });

  describe("Token Buy Quotes", function () {
    it("Should calculate correct ETH amount for various token buy amounts", async function () {
      const scenarios = [
        { supply: 0, buyAmount: totalSupply.div(100) }, // Buy 1% of total supply
        { supply: totalSupply.div(10), buyAmount: totalSupply.div(100) }, // Buy 1% when 10% is already in circulation
        { supply: totalSupply.div(2), buyAmount: totalSupply.div(100) }, // Buy 1% when 50% is already in circulation
        { supply: totalSupply.mul(9).div(10), buyAmount: totalSupply.div(100) }, // Buy 1% when 90% is already in circulation
      ];

      for (const scenario of scenarios) {
        const ethRequired = await bondingCurve.getTokenBuyQuote(scenario.supply, scenario.buyAmount);
        const averagePricePerToken = ethRequired.div(scenario.buyAmount);
        const ethPriceUSD = 5;
        const tokenPriceUSD = parseFloat(formatEth(averagePricePerToken)) * ethPriceUSD;

        console.log(`\nBuy ${scenario.buyAmount.toString()} tokens at supply ${scenario.supply.toString()}:`);
        console.log(
          `- ETH required: ${formatEth(ethRequired)} ETH ($${parseFloat(formatEth(ethRequired)) * ethPriceUSD} USD)`,
        );
        console.log(`- Avg price per token: ${formatEth(averagePricePerToken)} ETH ($${tokenPriceUSD} USD)`);

        // Verify that buying tokens increases in price as supply increases
        if (scenario.supply > 0) {
          const prevEthRequired = await bondingCurve.getTokenBuyQuote(
            scenario.supply.sub(totalSupply.div(10)),
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
        { supply: totalSupply.div(10), sellAmount: totalSupply.div(100) }, // Sell 1% when 10% is in circulation
        { supply: totalSupply.div(2), sellAmount: totalSupply.div(100) }, // Sell 1% when 50% is in circulation
        { supply: totalSupply, sellAmount: totalSupply.div(100) }, // Sell 1% when 100% is in circulation
      ];

      for (const scenario of scenarios) {
        const ethReceived = await bondingCurve.getTokenSellQuote(scenario.supply, scenario.sellAmount);
        const averagePricePerToken = ethReceived.div(scenario.sellAmount);
        const ethPriceUSD = 5;
        const tokenPriceUSD = parseFloat(formatEth(averagePricePerToken)) * ethPriceUSD;

        console.log(`\nSell ${scenario.sellAmount.toString()} tokens at supply ${scenario.supply.toString()}:`);
        console.log(
          `- ETH received: ${formatEth(ethReceived)} ETH ($${parseFloat(formatEth(ethReceived)) * ethPriceUSD} USD)`,
        );
        console.log(`- Avg price per token: ${formatEth(averagePricePerToken)} ETH ($${tokenPriceUSD} USD)`);

        // Verify that selling tokens decreases in price as supply decreases
        if (scenario.supply < totalSupply) {
          const prevEthReceived = await bondingCurve.getTokenSellQuote(
            scenario.supply.add(totalSupply.div(10)),
            scenario.sellAmount,
          );
          expect(ethReceived).to.be.lt(prevEthReceived);
        }
      }
    });

    it("Should revert when trying to sell more tokens than available", async function () {
      await expect(bondingCurve.getTokenSellQuote(totalSupply.div(10), totalSupply.div(5))).to.be.revertedWith(
        "InsufficientLiquidity",
      );
    });
  });

  describe("ETH Buy Quotes", function () {
    it("Should calculate correct token amount for various ETH buy amounts", async function () {
      const scenarios = [
        { supply: 0, ethAmount: ethers.utils.parseEther("0.1") }, // Buy with 0.1 ETH at 0 supply
        { supply: totalSupply.div(10), ethAmount: ethers.utils.parseEther("0.1") }, // Buy with 0.1 ETH at 10% supply
        { supply: totalSupply.div(2), ethAmount: ethers.utils.parseEther("0.1") }, // Buy with 0.1 ETH at 50% supply
        { supply: totalSupply.mul(9).div(10), ethAmount: ethers.utils.parseEther("0.1") }, // Buy with 0.1 ETH at 90% supply
      ];

      for (const scenario of scenarios) {
        const tokensReceived = await bondingCurve.getEthBuyQuote(scenario.supply, scenario.ethAmount);
        const ethPriceUSD = 5;

        console.log(`\nBuy with ${formatEth(scenario.ethAmount)} ETH at supply ${scenario.supply.toString()}:`);
        console.log(`- Tokens received: ${tokensReceived.toString()}`);
        console.log(
          `- Cost per token: ${formatEth(scenario.ethAmount.mul(BigNumber.from(10).pow(18)).div(tokensReceived))} ETH`,
        );

        // Verify that fewer tokens are received as supply increases (price increases)
        if (scenario.supply > 0) {
          const prevTokensReceived = await bondingCurve.getEthBuyQuote(
            scenario.supply.sub(totalSupply.div(10)),
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
        { supply: totalSupply.div(10), ethAmount: ethers.utils.parseEther("0.1") }, // Sell for 0.1 ETH at 10% supply
        { supply: totalSupply.div(2), ethAmount: ethers.utils.parseEther("0.1") }, // Sell for 0.1 ETH at 50% supply
        { supply: totalSupply, ethAmount: ethers.utils.parseEther("0.1") }, // Sell for 0.1 ETH at 100% supply
      ];

      for (const scenario of scenarios) {
        const tokensSold = await bondingCurve.getEthSellQuote(scenario.supply, scenario.ethAmount);
        const ethPriceUSD = 5;

        console.log(`\nSell for ${formatEth(scenario.ethAmount)} ETH at supply ${scenario.supply.toString()}:`);
        console.log(`- Tokens sold: ${tokensSold.toString()}`);
        console.log(
          `- Price per token: ${formatEth(scenario.ethAmount.mul(BigNumber.from(10).pow(18)).div(tokensSold))} ETH`,
        );

        // Verify that more tokens need to be sold as supply decreases (price decreases)
        if (scenario.supply < totalSupply) {
          const prevTokensSold = await bondingCurve.getEthSellQuote(
            scenario.supply.add(totalSupply.div(10)),
            scenario.ethAmount,
          );
          expect(tokensSold).to.be.gt(prevTokensSold);
        }
      }
    });
  });

  describe("Curve visualization", function () {
    it("Should generate data points to visualize the curve", async function () {
      const dataPoints = 10;
      const results = [];

      console.log("\nBonding Curve Data Points (Supply, Token Price in ETH):");
      for (let i = 0; i <= dataPoints; i++) {
        const supply = totalSupply.mul(BigNumber.from(i)).div(BigNumber.from(dataPoints));
        let tokenPrice;

        if (i === 0) {
          // At zero supply, price equals A
          tokenPrice = await bondingCurve.A();
        } else {
          // Buy a small amount to get the price at this supply
          const smallAmount = totalSupply.div(1000);
          const ethRequired = await bondingCurve.getTokenBuyQuote(supply, smallAmount);
          tokenPrice = ethRequired.mul(BigNumber.from(10).pow(18)).div(smallAmount);
        }

        results.push({
          supply: supply.toString(),
          tokenPriceETH: formatEth(tokenPrice),
          marketCapUSD: calculateMarketCapUSD(totalSupply, tokenPrice, 5), // $5 ETH price
        });

        console.log(
          `${i * 10}% Supply: ${supply.toString()} tokens => Price: ${formatEth(tokenPrice)} ETH, Market Cap: $${calculateMarketCapUSD(totalSupply, tokenPrice, 5)}`,
        );
      }
    });
  });
});
