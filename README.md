# Flights Turbo

Turborepo playground for learning PostgreSQL query design, optimization, execution plans, indexing, pagination strategies, and API performance against the Postgres Pro Airlines demo database.

## Stack

- Yarn 4 workspaces
- Turborepo
- NestJS REST API
- Raw `pg` queries, no ORM
- Next.js App Router
- Read-only PostgreSQL pool
- Nest OpenAPI generation + Scalar API reference
- Local request telemetry with 7-day retention

## Structure

```text
flights-turbo/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── airports/
│   │       ├── routes/
│   │       ├── database/
│   │       │   └── models.ts
│   │       └── gateway/
│   └── web/
│       ├── app/routes/
│       └── app/monitor/
├── package.json
├── turbo.json
└── .yarnrc.yml
```

## Setup

```bash
nvm use
corepack enable

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

yarn install
yarn dev
```

Local services:

- Next.js: http://localhost:3000
- REST API: http://localhost:4001/api
- Scalar API docs: http://localhost:4001/docs
- Gateway metrics API: http://localhost:4001/api/gateway/metrics
- Performance dashboard: http://localhost:3000/monitor

## Starter endpoints

```http
GET /api/airports?page=1&size=20&search=moscow
GET /api/routes?page=1&size=50&departureAirport=DME&arrivalAirport=LED
GET /api/gateway/metrics
```

## SQL philosophy

The application intentionally avoids an ORM. Database shapes are represented as TypeScript types in `apps/api/src/database/models.ts`, while services contain parameterized SQL directly through `pg`.

The starter pagination queries use `size + 1` instead of an additional `COUNT(*)` query to determine `hasMore`. This keeps the baseline inexpensive and leaves room to deliberately compare alternate pagination and counting strategies later.

## Gateway telemetry

A global Nest interceptor records completed REST requests with:

- timestamp
- HTTP method
- normalized path
- status code
- request duration

Logs are stored locally as one NDJSON file per day under:

```text
apps/api/.data/gateway/
```

Files older than 7 days are automatically removed. The gateway metrics endpoint calculates overall and per-endpoint request counts, error rates, average latency, p50, p95, and p99 from retained data.

The `/api/gateway/metrics` and `/docs` routes are excluded from telemetry so observing the API does not distort the measurements.

## Useful commands

```bash
yarn dev
yarn dev:api
yarn dev:web
yarn build
yarn typecheck
```
