import { ApolloServer, gql } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { CreateUserInput } from "./types";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Sample data
const users = [
  {
    id: 1,
    name: "Alice",
    age: 30,
    email: "alice@example.com",
    password: "password1",
  },
  {
    id: 2,
    name: "Bob",
    age: 28,
    email: "bob@example.com",
    password: "password2",
  },
  {
    id: 3,
    name: "Charlie",
    age: 22,
    email: "charlie@example.com",
    password: "password3",
  },
];

// GraphQL schema
const typeDefs = gql`
  type User @key(fields: "id") {
    id: ID!
    name: String!
    age: Int!
    email: String!
  }

  input CreateUserInput {
    name: String!
    age: Int!
    email: String!
    password: String!
  }

  type Mutation {
    registerUser(user: CreateUserInput!): User
    loginUser(email: String!, password: String!): User
  }

  type Query {
    getUser(id: ID!): User
    allUsers: [User]
  }
`;

// Resolvers
const resolvers = {
  Query: {
    getUser: (_: any, { id }: { id: string }) =>
      users.find((user) => user.id === parseInt(id)),
    allUsers: () => users,
  },
  Mutation: {
    registerUser: (_: any, { user }: { user: CreateUserInput }) => {
      const newUser = { id: users.length + 1, ...user };
      users.push(newUser);
      const token = jwt.sign(
        { userId: newUser.id },
        process.env.SECRET_KEY || "8000"
      );
      return { ...newUser, token };
    },
    loginUser: (
      _: any,
      { email, password }: { email: string; password: string }
    ) => {
      const user = users.find(
        (u) => u.email === email && u.password === password
      );
      if (user) {
        const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY  || "8000");
        console.log("token", token);
        
        return { ...user, token };
      } else {
        throw new Error("Invalid email or password");
      }
    },
  },
  User: {
    __resolveReference: (user: { id: number }) =>
      users.find((existingUser) => existingUser.id === user.id),
  },
};

// Apollo server setup
const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
});

// Start server
server.listen({ port: 4001 }).then(({ url }: { url: string }) => {
  console.log(`User service running at ${url}`);
});
