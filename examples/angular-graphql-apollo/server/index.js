import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import { readFileSync } from 'node:fs';
import { GraphQLError } from 'graphql';

const typeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8');

let nextId = 3;
let items = [
  { id: '1', name: 'Angular' },
  { id: '2', name: 'GraphQL' },
];

function findItemIndex(id) {
  return items.findIndex((item) => item.id === id);
}

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
    updateItem: (_parent, { id, name }) => {
      const index = findItemIndex(id);
      if (index === -1) {
        throw new GraphQLError(`Item ${id} not found`, {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      const item = { id, name };
      items = items.map((entry) => (entry.id === id ? item : entry));
      return item;
    },
    deleteItem: (_parent, { id }) => {
      const index = findItemIndex(id);
      if (index === -1) {
        throw new GraphQLError(`Item ${id} not found`, {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      const [removed] = items.splice(index, 1);
      items = [...items];
      return removed;
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
