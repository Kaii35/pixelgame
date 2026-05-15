# Runbook — local development

## Prerequisites

- Node 20.11+ (tested with 22.x)
- pnpm 9+ (`corepack enable && corepack prepare pnpm@9 --activate`)
- Docker Desktop / Engine (for Postgres + Redis)

## First-time setup

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Generate JWT RS256 keypair (writes to ./keys/)
pnpm keys:generate

# 3. Copy env files for each app
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/game-server/.env.example apps/game-server/.env
cp apps/client/.env.example apps/client/.env

# 4. Build workspace packages once
#    Required because @pixelgame/networking ships compiled JS — see ADR 0006.
pnpm build

# 5. Start Postgres + Redis
pnpm infra:up

# 6. Apply database migrations
pnpm --filter @pixelgame/api exec prisma migrate dev --name init
```

## Daily workflow

```bash
pnpm infra:up    # Postgres + Redis
pnpm dev         # client + api + game-server in parallel (Turbo)
```

| URL                                 | Service             |
| ----------------------------------- | ------------------- |
| http://localhost:5173               | client (Vite)       |
| http://localhost:3001/api/v1/health | api                 |
| http://localhost:2567/health        | game-server         |
| http://localhost:2567/colyseus/     | Colyseus monitor UI |
| localhost:5432                      | postgres            |
| localhost:6379                      | redis               |

## Smoke test

1. Open http://localhost:5173 — redirects to `/login`.
2. Register a new user. You're redirected to `/lobby`.
3. Click "Enter" on the seeded "Default Plaza" room. Phaser canvas shows the iso grid.
4. Click a tile → your avatar walks there. Other connected clients see it move.
5. Open the chat panel (bottom-right) and send a message. Burbujas appear above avatars.

## When you change a workspace package

```bash
pnpm build              # rebuild all (Turbo caches unchanged ones)
# or just the package(s) you changed:
pnpm --filter @pixelgame/networking build
```

Then restart the relevant app (`pnpm dev` watchers will pick up app source changes automatically, but not package dist changes).

## Troubleshooting

**`ECONNREFUSED 5432`** — Postgres not up. Run `pnpm infra:up`.

**`Cannot find module '@prisma/client'` or schema drift** — Run `pnpm --filter @pixelgame/api prisma:generate` and re-run migrations.

**`Cannot read properties of undefined (reading 'constructor')` from `@colyseus/schema`** — The networking package's `dist/` is missing or stale. Run `pnpm --filter @pixelgame/networking build`.

**`Invalid environment configuration`** — A required env var is missing or malformed. Compare against `.env.example` for the affected app.

**WebSocket fails handshake** — Make sure `JWT_PUBLIC_KEY_PATH` resolves to the same key file as the API's private key. Both default to `../../keys/jwt-*.pem` relative to each app's cwd.

**Phaser canvas flashes/duplicates on save** — Expected in React StrictMode dev; the cleanup hook in `PhaserGame.tsx` tears down the old instance before remount.

**Lint warnings about import order** — Run `pnpm format` then `pnpm lint -- --fix` (most are auto-fixable).

## Useful commands

```bash
pnpm typecheck                                       # all
pnpm lint --filter @pixelgame/client                  # one package
pnpm --filter @pixelgame/api prisma studio            # DB GUI
pnpm --filter @pixelgame/game-server dev              # game server only
pnpm --filter @pixelgame/api dev                      # api only
pnpm --filter @pixelgame/client dev                   # client only
pnpm build --filter @pixelgame/networking             # rebuild one package
```
