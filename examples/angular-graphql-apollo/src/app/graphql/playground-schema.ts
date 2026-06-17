import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { GraphQLError } from 'graphql';

let nextId = 3;
let items = [
  { id: '1', name: 'Angular' },
  { id: '2', name: 'GraphQL' },
];

function findItemIndex(id: string) {
  return items.findIndex((item) => item.id === id);
}

const ItemType = new GraphQLObjectType({
  name: 'Item',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    items: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ItemType))),
      resolve: () => items,
    },
  },
});

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addItem: {
      type: new GraphQLNonNull(ItemType),
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_parent, { name }: { name: string }) => {
        const item = { id: String(nextId++), name };
        items = [...items, item];
        return item;
      },
    },
    updateItem: {
      type: new GraphQLNonNull(ItemType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_parent, { id, name }: { id: string; name: string }) => {
        if (findItemIndex(id) === -1) {
          throw new GraphQLError(`Item ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }
        const item = { id, name };
        items = items.map((entry) => (entry.id === id ? item : entry));
        return item;
      },
    },
    deleteItem: {
      type: new GraphQLNonNull(ItemType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_parent, { id }: { id: string }) => {
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
  },
});

export function createPlaygroundSchema(): GraphQLSchema {
  return new GraphQLSchema({
    query: QueryType,
    mutation: MutationType,
  });
}
