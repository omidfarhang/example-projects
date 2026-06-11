# GraphQL Express Angular Migration

Companion project for [Migrating from REST to GraphQL: A Step-by-Step Guide for Express.js and Angular](https://omid.dev/2024/08/07/migrating-from-rest-to-graphql-a-step-by-step-guide-for-expressjs-and-angular/).

## Run

Terminal 1:

```bash
cd server
npm install
npm start
```

Terminal 2:

```bash
npm install --legacy-peer-deps
npm start
```

Open http://localhost:4200 and switch between REST and GraphQL modes.

## Migration notes

- REST endpoints live at `/api/users`
- GraphQL endpoint lives at `/graphql`
- Both operate on the same in-memory user list so readers can compare request shape and client code

## Blog post

https://omid.dev/2024/08/07/migrating-from-rest-to-graphql-a-step-by-step-guide-for-expressjs-and-angular/
