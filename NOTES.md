# NOTES

## Links

- [Setting Up Authentication and Authorization with Apollo Federation](https://www.apollographql.com/blog/setting-up-authentication-and-authorization-with-apollo-federation/)

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
