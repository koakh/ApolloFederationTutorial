const { ApolloGateway } = require("@apollo/gateway");
const { ApolloServer } = require("apollo-server-express");
// use Express integration, not apollo server
const express = require("express");

// To integrate Express with Apollo Server, we call the applyMiddleware method on the 
// new ApolloServer instance and pass in the top-level Express app. 
// Additionally, to turn this Apollo Server into a gateway, we create a new instance off
// ApolloGateway and pass it an array containing an object describing our single implementing service.

const port = 5000;
const app = express();

const gateway = new ApolloGateway({
  serviceList: [{ name: "accounts", url: "http://localhost:5001" }]
});

const server = new ApolloServer({
  gateway,
  subscriptions: false
});

server.applyMiddleware({ app });

app.listen({ port }, () =>
  console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`)
);