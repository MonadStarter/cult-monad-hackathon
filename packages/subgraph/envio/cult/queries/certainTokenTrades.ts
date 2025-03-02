function createCertainTokenTradesQuery(tokenID: string): string {
  return `
    query CertainTokenTrades {
      CultToken(where: {id: {_eq: "${tokenID}"}}) {
        tokenAddress
        tokenCreator_id
        protocolFeeRecipient
        name
        symbol
        trades(limit: 5, order_by: {timestamp: desc}) {
          tradeType
          trader_id
          recipient_id
          ethAmount
          tokenAmount
          marketType
          timestamp
        }
      }
    }
  `;
}

async function fetchGraphQL(
  operationsDoc: string,
  operationName: string,
  variables: Record<string, any>
) {
  return fetch('http://localhost:8080/v1/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: operationsDoc,
      variables,
      operationName,
    }),
  }).then(result => result.json());
}

async function fetchCertainTokenTrades(tokenID: string) {
  const query = createCertainTokenTradesQuery(tokenID);
  const response = await fetchGraphQL(query, "CertainTokenTrades", {});
  console.log(JSON.stringify(response, null, 2));
  return response;
}

const tokenID = "0xEACD276e02d588dbEbC10EC19EdaB7311C5CD1F6";
fetchCertainTokenTrades(tokenID)