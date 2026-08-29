# Flights Turbo

Turborepo starter for experimenting with optimized SQL against the Postgres Pro Airlines demo database.

## Stack

- Yarn 4 workspaces
- Turborepo
- NestJS + schema-first GraphQL + Apollo Server
- Raw `pg` queries, no ORM
- Next.js App Router + Apollo Client
- Read-only PostgreSQL pool

## Structure

```text
flights-turbo/
├── apps/
│   ├── api/                    # NestJS GraphQL
│   │   └── src/
│   │       ├── airports/
│   │       └── database/
│   └── web/                    # Next.js
├── package.json
├── turbo.json
├── tsconfig.base.json
└── .yarnrc.yml
```

## Requirements

The repo pins Node 24.20.0 (latest LTS when this starter was generated) and Yarn 4.18.0.

```bash
nvm use
corepack enable
```

## Setup

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

yarn install
yarn dev
```

- Next.js: http://localhost:3000
- GraphQL + GraphiQL: http://localhost:4000/graphql

## Useful commands

```bash
yarn dev
yarn dev:api
yarn dev:web
yarn build
yarn typecheck
```

## Example GraphQL query

```graphql
query {
  airports(page: 1, size: 10, search: "moscow") {
    data {
      airportCode
      airportName
      city
      timezone
    }
    page
    size
    hasMore
  }
}
```

## SQL philosophy

There is intentionally no ORM and no database entity/model layer. The GraphQL SDL describes the public API shape. Services execute parameterized SQL directly through `pg`.

The sample uses `size + 1` instead of a `COUNT(*)` query to determine `hasMore`, which keeps pagination from secretly doing twice the work while you are supposed to be studying query performance.
