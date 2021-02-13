# NOTES

## Links

- [Setting Up Authentication and Authorization with Apollo Federation](https://www.apollographql.com/blog/setting-up-authentication-and-authorization-with-apollo-federation/)
- [mandiwise/apollo-federation-auth-demo](https://github.com/mandiwise/apollo-federation-auth-demo)

## Configure the Accounts Service and the Gateway API

### Use concurrently

use `concurrently` with a **wildcard** to start up all of the scripts with the `server:` prefix at once `concurrently -k npm:server:*`

### Start gateway API and the accounts service

We’re now ready to run npm run server in our project directory to start both the gateway API and the accounts service (on ports 4000 and 4001 respectively). The gateway API will be accessible in GraphQL Playground at <http://localhost:4000/graphql>

> changed ports to `5000` and `5001` to not conflict with nx

don't forget to change wait-on script `"server:gateway": "wait-on tcp:4001 && nodemon ./index.js"` port `4001` with port `5001`, else gateway won't start

```gql
query {
  accounts{
    id
    name
  }
}
```

```gql
query {
  account(id:"12345"){
    id
    name
  }
}
```

## Add JWT-based Authentication with Express Middleware

```shell
# install jwt
$ npm i jsonwebtoken 
# install Express middleware that verifies and decodes the JWT when it’s sent with requests from GraphQL Playground
$ npm i express-jwt
```

```gql
mutation {
  login(email: "alice@email.com", password:"pAsSWoRd!")
}
```

We’ll paste the returned token it into the “HTTP Headers” panel of GraphQL Playground as follows:

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Authorize API Requests with GraphQL Shield

```shell
$ npm i graphql-middleware graphql-shield
```

Try running the account, accounts, and viewer queries with valid access tokens for both Alice and Bob now. You will see that **Alice is authorized to run any query based on her permissions**, but **Bob is only able to run the viewer query or query his specific account by ID**.