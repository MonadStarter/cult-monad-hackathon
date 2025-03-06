/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  Cult,
  CultFactory,
  Account,
  CultToken,
  TokenBalance,
  TokenIPFSData,
  TokenTrade,
} from "generated";

CultFactory.CultTokenCreated.contractRegister(
  ({ event, context }) => {
    console.log("CultTokenCreated", event.params.tokenAddress);
    context.addCult(event.params.tokenAddress);
    console.log("CultTokenCreated2", event.params.tokenAddress);
  },
  {
    preRegisterDynamicContracts: true,
  }
);

CultFactory.CultTokenCreated.handler(async ({ event, context }) => {
  const tokenAddress = event.params.tokenAddress;
  const tokenCreator = await loadOrCreateAccount(
    event.params.tokenCreator,
    context
  );
  const cultToken: CultToken = {
    id: tokenAddress,
    factoryAddress: event.params.factoryAddress,
    tokenCreator_id: tokenCreator.id,
    protocolFeeRecipient: event.params.protocolFeeRecipient,
    bondingCurve: event.params.bondingCurve,
    tokenURI: event.params.tokenURI,
    name: event.params.name,
    symbol: event.params.symbol,
    tokenAddress: tokenAddress,
    poolAddress: event.params.poolAddress,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.block.hash, // block hash is available instead of transaction hash
    holderCount: BigInt(0),
  };
  context.CultToken.set(cultToken);

  // Handle IPFS data
  const ipfsPrefix = "ipfs://";
  const ipfsIndex = cultToken.tokenURI.indexOf(ipfsPrefix);
  if (ipfsIndex !== -1) {
    const hash = cultToken.tokenURI.substr(ipfsIndex + ipfsPrefix.length);
    const response = await fetch(`https://ipfs.io/ipfs/${hash}`, {
      headers: {
        Accept: "application/json",
      },
    });
    const content = await response.json();
    const ipfsData: TokenIPFSData = {
      content: JSON.stringify(content),
      hash: hash,
      id: `${cultToken.id}_ipfs`,
      token_id: cultToken.id,
    };
    context.TokenIPFSData.set(ipfsData);
  }
});

Cult.CultTokenBuy.handler(async ({ event, context }) => {
  const tokenAddress = event.srcAddress;
  if (tokenAddress) {
    const trader = await loadOrCreateAccount(event.params.buyer, context);
    const recipient = await loadOrCreateAccount(
      event.params.recipient,
      context
    );
    const orderReferrer = await loadOrCreateAccount(
      event.params.orderReferrer,
      context
    );
    const entity: TokenTrade = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      tradeType: "BUY",
      token_id: tokenAddress,
      trader_id: trader.id,
      recipient_id: recipient.id,
      orderReferrer_id: orderReferrer.id,
      totalEth: event.params.totalEth,
      ethFee: event.params.ethFee,
      ethAmount: event.params.ethSold,
      tokenAmount: event.params.tokensBought,
      traderTokenBalance: event.params.buyerTokenBalance,
      totalSupply: event.params.totalSupply,
      marketType: BigInt(event.params.marketType),
      timestamp: BigInt(event.block.timestamp),
      transactionHash: event.block.hash,
    };

    context.TokenTrade.set(entity);

    console.log("BUYING TOKEN");
    // Update token balance
    const cultToken = await context.CultToken.get(tokenAddress);
    if (!cultToken) {
      console.error("CultToken entity not found");
      return;
    }
    updateTokenBalance(
      cultToken,
      trader.id,
      event.params.buyerTokenBalance,
      context
    );
  }
});

Cult.CultTokenSell.handler(async ({ event, context }) => {
  const tokenAddress = event.srcAddress;
  if (tokenAddress) {
    const trader = await loadOrCreateAccount(event.params.seller, context);
    const recipient = await loadOrCreateAccount(
      event.params.recipient,
      context
    );
    const orderReferrer = await loadOrCreateAccount(
      event.params.orderReferrer,
      context
    );
    const entity: TokenTrade = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      tradeType: "SELL",
      token_id: tokenAddress,
      trader_id: trader.id,
      recipient_id: recipient.id,
      orderReferrer_id: orderReferrer.id,
      totalEth: event.params.totalEth,
      ethFee: event.params.ethFee,
      ethAmount: event.params.ethBought,
      tokenAmount: event.params.tokensSold,
      traderTokenBalance: event.params.sellerTokenBalance,
      totalSupply: event.params.totalSupply,
      marketType: BigInt(event.params.marketType),
      timestamp: BigInt(event.block.timestamp),
      transactionHash: event.block.hash,
    };

    context.TokenTrade.set(entity);

    // Update token balance
    const cultToken = await context.CultToken.get(tokenAddress);
    if (!cultToken) {
      console.error("CultToken entity not found");
      return;
    }
    updateTokenBalance(
      cultToken,
      trader.id,
      event.params.sellerTokenBalance,
      context
    );
  }
});

Cult.CultTokenTransfer.handler(async ({ event, context }) => {
  console.log("TRANSFERING TOKEN");
  let token = await context.CultToken.get(event.srcAddress);
  if (!token) {
    return;
  }

  let from = event.params.from;
  let to = event.params.to;

  let fromAccount = await loadOrCreateAccount(from, context);
  let toAccount = await loadOrCreateAccount(to, context);

  if (fromAccount.id !== "0x0000000000000000000000000000000000000000") {
    updateTokenBalance(
      token,
      fromAccount.id,
      event.params.fromTokenBalance,
      context
    );
  }
  updateTokenBalance(token, toAccount.id, event.params.toTokenBalance, context);
});

// Function to load or create an account
async function loadOrCreateAccount(
  address: string,
  context: any
): Promise<Account> {
  let account = await context.Account.get(address);
  if (!account) {
    account = { id: address };
    context.Account.set(account);
  }
  return account;
}

function updateTokenBalance(
  token: CultToken,
  accountId: string,
  newValue: BigInt,
  context: any
): void {
  // Load the existing balance (if any)
  console.log("UPDATING TOKEN BALANCE");
  let tokenBalance = context.TokenBalance.get(token.id + "-" + accountId);

  // Track the old balance so we know if it was zero or > 0
  let oldValue = BigInt(0);
  if (!tokenBalance) {
    // If no entity yet, create one
    const entity: TokenBalance = {
      id: token.id + "-" + accountId,
      token_id: token.id,
      account_id: accountId,
      value: BigInt(newValue.toString()),
    };
    context.TokenBalance.set(entity);
    tokenBalance = entity;
  } else {
    oldValue = tokenBalance.value;
  }

  // If your token entity was already loaded as the "token" argument,
  // you don't need to re-load it. But if you want to be safe, you
  // can do: let updatedToken = CultToken.load(token.id)!
  let updatedToken: CultToken = token;

  // Make sure holderCount is never undefined
  if (!updatedToken.holderCount) {
    updatedToken = {
      ...updatedToken,
      holderCount: BigInt(0),
    };
  }

  // oldValue = 0, newValue > 0 => new holder
  if (oldValue === BigInt(0) && BigInt(newValue.toString()) > BigInt(0)) {
    updatedToken = {
      ...updatedToken,
      holderCount: updatedToken.holderCount + BigInt(1),
    };
  }
  // oldValue > 0, newValue = 0 => holder lost all tokens
  else if (oldValue > BigInt(0) && BigInt(newValue.toString()) === BigInt(0)) {
    updatedToken = {
      ...updatedToken,
      holderCount: updatedToken.holderCount - BigInt(1),
    };
  }

  context.CultToken.set(updatedToken);
}

/// Note: Command to debug:
/// `pnpm run dev` - To run envio indexer (Hosura DB)
/// `TUI_OFF=true pnpm start` in `subgraph/envio/cult` directory
