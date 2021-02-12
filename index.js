const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");
const { ApolloServer } = require('apollo-server-express');
// use Express integration, not apollo server
const express = require('express');
const expressJwt = require('express-jwt');

// To integrate Express with Apollo Server, we call the applyMiddleware method on the 
// new ApolloServer instance and pass in the top-level Express app. 
// Additionally, to turn this Apollo Server into a gateway, we create a new instance off
// ApolloGateway and pass it an array containing an object describing our single implementing service.

const port = 5000;
const portAccountsService = 5001;
// same secret on apolloServer and gateway
// same secret and algorithm on apolloServer and gateway
const secret = 'f1BtnWgD3VKY';
const algorithm = 'HS256';

const app = express();

const gateway = new ApolloGateway({
  serviceList: [{ name: 'accounts', url: `http://localhost:${portAccountsService}` }],
  // With Apollo Federation, adding the user object to the gateway API’s
  // context doesn’t automatically make this information available to
  // the resolvers in the implementing services.
  // To pass the user data on to the accounts service, we’ll need to
  // add a buildService method to the ApolloGateway configuration.
  // The buildService method must return an object that implements the
  // GraphQLDataSource interface, so for our purposes, we will return a
  // RemoteGraphQLDataSource (available in the @apollo/gateway package).
  // This object represents a connection between our gateway API and
  // accounts service and it exposes a willSendRequest method to modify
  // a request from the gateway to the implementing service before it’s sent.
  // The willSendRequest method has access to the gateway’s context object,
  // so we will retrieve the user data from it and add it as an
  // HTTP header to the request the gateway sends to the accounts service:
  buildService({ name, url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        request.http.headers.set(
          'user',
          context.user ? JSON.stringify(context.user) : null
        );
      }
    });
  }
});

const server = new ApolloServer({
  gateway,
  subscriptions: false,
  // Below, we’ll extract the user data from the request and add it to
  // the gateway API’s context
  context: ({ req }) => {
    const user = req.user || null;
    return { user };
  }
});

// add the middleware to the gateway’s index.js file,
// using the same secret that was used to sign the JWT in the mutation, choosing the same signing algorithm, and setting the credentialsRequired option to false so Express won’t throw an error if a JWT hasn’t been included (which would be the case for the initial login mutation or when GraphQL Playground polls for schema updates):
// The middleware we just added to Express will get the token from the 
// Authorization header, decode it, and add it to the request object 
// as req.user. It’s a common practice to add decoded tokens to
// Apollo Server’s context because the context object is conveniently
// available in every resolver and it’s recreated with every request
// so we won’t have to worry about access tokens going stale.
app.use(
  expressJwt({
    secret,
    algorithms: [algorithm],
    credentialsRequired: false
  })
);

// after add middleware's to app we can apply it to server
server.applyMiddleware({ app });

app.listen({ port }, () =>
  console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`)
);