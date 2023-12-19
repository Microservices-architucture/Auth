const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

// Sample data
const users = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 28 },
  { id: 3, name: 'Charlie', age: 22 },
];

// GraphQL schema
const typeDefs = gql`
  type User @key(fields: "id") {
    id: ID!
    name: String!
    age: Int!
  }

  type Query {
    getUser(id: ID!): User
    allUsers: [User]
  }
`;

// Resolvers
const resolvers = {
  Query: {
    getUser: (_, { id }) => users.find(user => user.id === parseInt(id)),
    allUsers: () => users,
  },
  User: {
    __resolveReference(user, { id }) {
      return users.find(existingUser => existingUser.id === parseInt(id));
    },
  },
};

// Apollo server setup
const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
});

// Start server
server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`User service running at ${url}`);
});