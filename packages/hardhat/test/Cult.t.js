const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("CultFactory Airdrop Test", function () {
  // Test variables
  let cultFactory;
  let cultImplementation;
  let bondingCurve;
  let airdropImplementation;
  let owner;
  let tokenCreator;
  let user1, user2, user3;
  let merkleTree;
  let merkleRoot;

  // Airdrop parameters
  const airdropRecipients = [];
  const airdropPercentage = 50000; // 5% in basis points (1,000,000 = 100%)
  const BASIS_POINTS = 1000000;

  // Token parameters
  const tokenName = "Test Cult Token";
  const tokenSymbol = "TCT";
  const tokenURI = "https://example.com/token-metadata";

  // Helper function to get leaf node for Merkle tree - simplified to only use address
  function getLeafNode(address) {
    return Buffer.from(ethers.solidityPackedKeccak256(["address"], [address]).slice(2), "hex");
  }

  beforeEach(async function () {
    // Get signers
    [owner, tokenCreator, user1, user2, user3, ...others] = await ethers.getSigners();

    // Setup airdrop recipients - only storing addresses
    airdropRecipients.push(user1.address);
    airdropRecipients.push(user2.address);
    airdropRecipients.push(user3.address);

    // Create leaves for the Merkle tree - simplified to only use address
    const leaves = airdropRecipients.map(address => getLeafNode(address));

    // Create Merkle tree
    merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    merkleRoot = merkleTree.getRoot();

    // Deploy contracts
    const BondingCurve = await ethers.getContractFactory("BondingCurve");
    bondingCurve = await BondingCurve.deploy();
    await bondingCurve.waitForDeployment();

    const CultRewards = await ethers.getContractFactory("CultRewards");
    const cultRewards = await CultRewards.deploy();
    await cultRewards.waitForDeployment();

    // Mock WETH, Uniswap Position Manager and Router addresses
    const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // Just a placeholder
    const UNISWAP_V3_POSITION_MANAGER = "0x50ff23E9A8D5DAc05744C367c9DDd588D027982B"; // Just a placeholder
    const UNISWAP_V3_SWAP_ROUTER = "0x201B36B26b816D061fC552B679f8279Db0Fbbc6A"; // Just a placeholder

    // Deploy implementation contracts
    const Cult = await ethers.getContractFactory("Cult");
    cultImplementation = await Cult.deploy(
      owner.address,
      cultRewards.target,
      WETH_ADDRESS,
      UNISWAP_V3_POSITION_MANAGER,
      UNISWAP_V3_SWAP_ROUTER,
    );
    await cultImplementation.waitForDeployment();

    const AirdropContract = await ethers.getContractFactory("AirdropContract");
    airdropImplementation = await AirdropContract.deploy();
    await airdropImplementation.waitForDeployment();

    // Deploy CultFactory implementation and proxy
    const CultFactory = await ethers.getContractFactory("CultFactory");
    const cultFactoryImpl = await CultFactory.deploy();
    await cultFactoryImpl.waitForDeployment();

    // Deploy proxy and initialize
    const ProxyFactory = await ethers.getContractFactory("ERC1967Proxy");
    const proxy = await ProxyFactory.deploy(
      cultFactoryImpl.target,
      cultFactoryImpl.interface.encodeFunctionData("initialize", [
        owner.address,
        cultImplementation.target,
        bondingCurve.target,
        airdropImplementation.target,
      ]),
    );
    await proxy.waitForDeployment();

    // Get instance of factory through proxy
    cultFactory = await ethers.getContractAt("CultFactory", proxy.target);

    // Whitelist the merkle root with the number of recipients
    const merkleRootHex = "0x" + merkleRoot.toString("hex");

    // First we need to add the merkle root to the whitelist
    // We'll set it to a non-zero value first since updateMerkleRoot requires an existing value
    await cultFactory.connect(owner).updateMerkleRoot(merkleRootHex, airdropRecipients.length);
  });

  it("Should test all scenarios of the canClaim function", async function () {
    // Prepare merkle roots array for deployment
    const merkleRootHex = "0x" + merkleRoot.toString("hex");
    console.log("CP1");
    // Deploy the Cult token through the factory
    const deployTx = await cultFactory
      .connect(tokenCreator)
      .deploy(
        tokenCreator.address,
        tokenURI,
        tokenName,
        tokenSymbol,
        [merkleRootHex, merkleRootHex, merkleRootHex],
        airdropPercentage,
      );

    console.log("Deployed");
    // Wait for deployment
    const receipt = await deployTx.wait();

    // Get the event ABI from the factory contract
    const eventAbi = cultFactory.interface.getEvent("CultTokenCreated");
    // Find the matching log entry
    const eventLog = receipt.logs.find(log => log.topics[0] === eventAbi.topicHash);

    // Parse the event data
    const parsedEvent = cultFactory.interface.parseLog(eventLog);

    const tokenAddress = parsedEvent.args[7];
    const airdropAddress = parsedEvent.args[9];

    console.log("Got airdrop address", airdropAddress);

    // Get contract instances
    const token = await ethers.getContractAt("Cult", tokenAddress);
    const airdropContract = await ethers.getContractAt("AirdropContract", airdropAddress);

    // Verify the token was created
    expect(await token.name()).to.equal(tokenName);
    expect(await token.symbol()).to.equal(tokenSymbol);

    // Get the total airdrop amount
    const totalAirdropAmount = await airdropContract.totalAirdropAmount();
    expect(totalAirdropAmount).to.be.gt(0);

    console.log("CP2");
    // Test user1's claim eligibility
    // Get merkle proof for user1
    const user1Leaf = getLeafNode(user1.address);
    const user1Proof = merkleTree.getProof(user1Leaf).map(x => "0x" + x.data.toString("hex"));

    // 1. Verify user1 can claim initially
    let canClaim = await airdropContract.canClaim(user1.address, user1Proof);
    expect(canClaim).to.equal(true);
    console.log("CP3");
    // 2. Test with invalid proof
    const user2Leaf = getLeafNode(user2.address);
    const user2Proof = merkleTree.getProof(user2Leaf).map(x => "0x" + x.data.toString("hex"));

    // Using user1's address with user2's proof
    canClaim = await airdropContract.canClaim(user1.address, user2Proof);
    expect(canClaim).to.equal(false);

    // 3. Test with non-whitelisted address
    const nonWhitelistedUser = ethers.Wallet.createRandom();
    canClaim = await airdropContract.canClaim(nonWhitelistedUser.address, user1Proof);
    expect(canClaim).to.equal(false);
    console.log("CP4");
    // 4. Verify user1 can't claim after claiming
    // User1 claims their tokens
    await airdropContract.connect(user1).claim(user1Proof);

    // Check canClaim should now return false
    canClaim = await airdropContract.canClaim(user1.address, user1Proof);
    expect(canClaim).to.equal(false);

    // 5. Test user2 can still claim
    canClaim = await airdropContract.canClaim(user2.address, user2Proof);
    expect(canClaim).to.equal(true);
    console.log("CP5");
    // 6. User2 claims and verify canClaim changes
    await airdropContract.connect(user2).claim(user2Proof);

    canClaim = await airdropContract.canClaim(user2.address, user2Proof);
    expect(canClaim).to.equal(false);

    // 7. Check token balances after claiming
    const user1Balance = await token.balanceOf(user1.address);
    const user2Balance = await token.balanceOf(user2.address);

    // Each recipient should receive an equal amount (totalAirdropAmount / recipientCount)
    const expectedRecipientCount = await airdropContract.totalAirdropRecipientCount();
    const expectedAmount = totalAirdropAmount / expectedRecipientCount;
    console.log("CP6");
    expect(user1Balance).to.equal(expectedAmount);
    expect(user2Balance).to.equal(expectedAmount);
  });

  //   it("Should fail to deploy with non-whitelisted merkle root", async function () {
  //     // Create a different merkle tree with different recipients
  //     const differentRecipients = [ethers.Wallet.createRandom().address, ethers.Wallet.createRandom().address];

  //     const differentLeaves = differentRecipients.map(address => getLeafNode(address));

  //     const differentMerkleTree = new MerkleTree(differentLeaves, keccak256, { sortPairs: true });
  //     const differentMerkleRoot = "0x" + differentMerkleTree.getRoot().toString("hex");

  //     // Attempt to deploy with non-whitelisted merkle root
  //     await expect(
  //       cultFactory
  //         .connect(tokenCreator)
  //         .deploy(tokenCreator.address, tokenURI, tokenName, tokenSymbol, [differentMerkleRoot], airdropPercentage),
  //     ).to.be.revertedWithCustomError(cultFactory, "InvalidMerkleRoot");
  //   });

  //   it("Should properly handle updating merkle root holder count", async function () {
  //     const merkleRootHex = "0x" + merkleRoot.toString("hex");

  //     // Update to a new holder count
  //     const newHolderCount = 10;
  //     await cultFactory.connect(owner).updateMerkleRoot(merkleRootHex, newHolderCount);

  //     // Deploy with the updated merkle root
  //     const deployTx = await cultFactory
  //       .connect(tokenCreator)
  //       .deploy(tokenCreator.address, tokenURI, tokenName, tokenSymbol, [merkleRootHex], airdropPercentage);

  //     const receipt = await deployTx.wait();

  //     // Get the event data
  //     const eventAbi = cultFactory.interface.getEvent("CultTokenCreated");
  //     const eventLog = receipt.logs.find(log => log.topics[0] === eventAbi.topicHash);
  //     const parsedEvent = cultFactory.interface.parseLog(eventLog);

  //     const airdropAddress = parsedEvent.args[9];
  //     const airdropContract = await ethers.getContractAt("AirdropContract", airdropAddress);

  //     // Verify that the total recipient count matches our updated value
  //     expect(await airdropContract.totalAirdropRecipientCount()).to.equal(newHolderCount);
  //   });
});
