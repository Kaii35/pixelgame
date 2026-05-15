# Runbook — local development

## Prerequisites

- Node 20.11+
- pnpm 9+ (`corepack enable && corepack prepare pnpm@9 --activate`)
- Docker Desktop / Engine

## First-time setup

```bash
pnpm install
pnpm keys:generate
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/game-server/.env.example apps/game-server/.env
cp apps/client/.env.example apps/client/.env
pnpm infra:up
pnpm --filter @pixelgame/api prisma generate
pnpm --filter @pixelgame/api prisma migrate dev
```

## Daily

```bash
pnpm infra:up       # postgres + redis
pnpm dev            # client + api + game-server in parallel
```

| URL | Service |
|---|---|
| http://localhost:5173 | client |
| http://localhost:3001/api/v1/health | api |
| http://localhost:2567/health | game-server |
| http://localhost:2567/colyseus | Colyseus monitor |

## Troubleshooting

**`ECONNREFUSED 5432`** — Postgres not up. Run `pnpm infra:up`.

**Prisma client out of sync** — `pnpm --filter @pixelgame/api prisma generate`.

**WebSocket fails handshake** — make sure `JWT_PUBLIC_KEY_PATH` resolves to the same key file as the API's private key.

**Phaser canvas flashes/duplicates on save** — expected in StrictMode dev; the cleanup hook tears down the old instance before remount.

## Useful commands

```bash
pnpm typecheck                 # all
pnpm lint --filter=client      # one app
pnpm --filter @pixelgame/api prisma studio
pnpm --filter @pixelgame/game-server dev
```
