function createGetCultTokensQuery(first: number, skip: number): string {
  return `
    query GetCultTokens {
      CultToken(limit: ${first}, offset: ${skip}) {
       tokenAddress
       tokenCreator {
        id # Creator's address
       }
       name
       symbol
       ipfsData {
        content
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
  return fetch("http://localhost:8080/v1/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: operationsDoc,
      variables,
      operationName,
    }),
  }).then((result) => result.json());
}

async function fetchCertainTokenTrades() {
  const query = createGetCultTokensQuery(10, 0);
  const response = await fetchGraphQL(query, "GetCultTokens", {});
  console.log(JSON.stringify(response, null, 2));
  return response;
}

fetchCertainTokenTrades();
