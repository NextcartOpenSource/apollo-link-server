/* eslint-env jest */
import { ApolloServer } from "apollo-server-micro";
import gql from "graphql-tag";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ServerLink } from "../apolloLinkServer";

const TYPE_DEFS = gql`
  type TestResponse {
    string: String
  }

  type Query {
    Test: TestResponse
  }

  schema {
    query: Query
  }
`;

const TYPENAME = "TestResponse";

const TEST_RESPONSE = {
  __typename: TYPENAME,
  string: "test",
};

const RESOLVERS = {
  Query: {
    Test: (_parent: any, _args: any, _context: any, _info: any): {} =>
      TEST_RESPONSE,
  },
};

const APOLLO_SERVER = new ApolloServer({
  resolvers: RESOLVERS,
  typeDefs: TYPE_DEFS,
});

const SERVER_LINK = new ServerLink(APOLLO_SERVER);

const APOLLO_CLIENT = new ApolloClient({
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: "network-only", // Do not use the cache
    },
  },
  link: SERVER_LINK,
});

test("ServerLink", async () => {
  const query = gql`
    query TestQuery {
      Test {
        string
      }
    }
  `;
  expect(await APOLLO_CLIENT.query({ query })).toHaveProperty("data", {
    Test: { ...TEST_RESPONSE, __typename: TYPENAME },
  });
});
