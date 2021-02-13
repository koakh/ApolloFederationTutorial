const { and, or, rule, shield } = require("graphql-shield");

// create a rule that checks if a user is authenticated
// GraphQL Shield’s rule function has all of the same parameters as a 
// resolver function, so we can destructure the user object from the 
// context parameter as we would in a resolver
const isAuthenticated = rule()((parent, args, { user }) => {
  return user !== null;
});

// add authorization for the account and accounts queries by creating
// additional rules that check user permissions. For these rules, 
// we’ll also use GraphQL Shield’s and and or functions to check 
// multiple rules per query:
function getPermissions(user) {
  if (user && user["https://awesomeapi.com/graphql"]) {
    return user["https://awesomeapi.com/graphql"].permissions;
  }
  return [];
}

const canReadAnyAccount = rule()((parent, args, { user }) => {
  const userPermissions = getPermissions(user);
  return userPermissions.includes("read:any_account");
});

const canReadOwnAccount = rule()((parent, args, { user }) => {
  const userPermissions = getPermissions(user);
  return userPermissions.includes("read:own_account");
});

const isReadingOwnAccount = rule()((parent, { id }, { user }) => {
  return user && user.sub === id;
});

const permissions = shield({
  Query: {
    account: or(and(canReadOwnAccount, isReadingOwnAccount), canReadAnyAccount),
    accounts: canReadAnyAccount,
    viewer: isAuthenticated
  }
});

module.exports = { permissions };