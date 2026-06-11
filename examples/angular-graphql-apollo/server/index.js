import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import { readFileSync } from 'node:fs';

const typeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8');

let nextId = 3;
let items = [
  { id: '1', name: 'Angular' },
  { id: '2', name: 'GraphQL' },
];

const resolvers = {
  Query: {
    items: () => items,
  },
  Mutation: {
    addItem: (_parent, { name }) => {
      const item = { id: String(nextId++), name };
      items = [...items, item];
      return item;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

const app = express();
app.use('/graphql', cors(), express.json(), expressMiddleware(server));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`GraphQL server ready at http://localhost:${port}/graphql`);
});
