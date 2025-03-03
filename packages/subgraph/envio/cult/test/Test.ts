import assert from "assert";
import { 
  TestHelpers,
  CultToken
} from "generated";
const { MockDb, CultFactory } = TestHelpers;

describe("CultFactory contract CultTokenCreated event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for CultFactory contract CultTokenCreated event
  const event = CultFactory.CultTokenCreated.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("CultFactory_CultTokenCreated is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await CultFactory.CultTokenCreated.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualCultFactoryCultTokenCreated = mockDbUpdated.entities.CultToken.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedCultFactoryCultTokenCreated: CultToken = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      factoryAddress: event.params.factoryAddress,
      tokenCreator_id: event.params.tokenCreator,
      protocolFeeRecipient: event.params.protocolFeeRecipient,
      bondingCurve: event.params.bondingCurve,
      tokenURI: event.params.tokenURI,
      name: event.params.name,
      symbol: event.params.symbol,
      tokenAddress: event.params.tokenAddress,
      poolAddress: event.params.poolAddress,
      blockNumber: BigInt(event.block.number),
      blockTimestamp: BigInt(event.block.timestamp),
      holderCount: BigInt(0),
      transactionHash: event.block.hash,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualCultFactoryCultTokenCreated, expectedCultFactoryCultTokenCreated, "Actual CultFactoryCultTokenCreated should be the same as the expectedCultFactoryCultTokenCreated");
  });
});
