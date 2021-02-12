const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");
const { accounts } = require("../data");
const port = 5001;

// This federated schema is configured much like a regular schema, but with three notable differences.
// The first difference is that we use the @key directive to make the Account type an entity so 
// it can be extended and referenced by any other implementing services we create in the future. 
// We must add an accompanying reference resolver for the Account entity as well.
// 
// The second difference is that we use the buildFederatedSchema function imported from the 
// Apollo Federation package to add federation support to this schema.
// We pass typeDefs and resolvers into buildFederatedSchema and use its return value for the
// schema option in the ApolloServer constructor (rather than passing the typeDefs and resolvers 
// into the new ApolloServer directly).
//
// The final difference is that we use the extend keyword in front of type Query because the 
// Query and Mutation types originate at the gateway level so the Apollo documentation says that all implementing services should extend these types with any additional operations

// notes for `@key` and `extend`
const typeDefs = gql`
  type Account @key(fields: "id") {
    id: ID!
    name: String
  }
  extend type Query {
    account(id: ID!): Account
    accounts: [Account]
  }`;

const resolvers = {
  Account: {
    _resolveReference(object) {
      return accounts.find(account => account.id === object.id);
    }
  },
  Query: {
    account(parent, { id }) {
      return accounts.find(account => account.id === id);
    },
    accounts() {
      return accounts;
    }
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

server.listen({ port }).then(({ url }) => {
  console.log(`Accounts service ready at ${url}`);
});
