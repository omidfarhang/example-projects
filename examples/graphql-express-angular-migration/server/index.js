import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import { readFileSync } from 'node:fs';

const typeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8');

let nextId = 3;
let users = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: '2', name: 'Grace Hopper', email: 'grace@example.com' },
];

const resolvers = {
  Query: {
    users: () => users,
    user: (_parent, { id }) => users.find((user) => user.id === id),
  },
  Mutation: {
    createUser: (_parent, { name, email }) => {
      const user = { id: String(nextId++), name, email };
      users = [...users, user];
      return user;
    },
  },
};

const app = express();
const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

app.use(cors());
app.use(express.json());

app.get('/api/users', (_req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const user = { id: String(nextId++), name: req.body.name, email: req.body.email };
  users = [...users, user];
  res.status(201).json(user);
});

app.use('/graphql', expressMiddleware(server));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`REST + GraphQL server ready at http://localhost:${port}`);
});
