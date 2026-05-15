# Pixelgame

> A social MMO web platform — React/Phaser client, Colyseus realtime server, NestJS API.

Inspired by Habbo Hotel and Club Penguin, built on a modern, scalable, modular stack.

---

## Stack

| Layer | Tech |
|---|---|
| Client | React, TypeScript, Vite, Phaser 3, Zustand, React Query, TailwindCSS |
| Realtime | Colyseus (WebSocket, state sync) |
| API | NestJS, Prisma, Postgres |
| Cache / Pub-Sub | Redis |
| Tooling | Turborepo, pnpm, ESLint, Prettier, Husky, Commitlint |
| Infra | Docker, Docker Compose, nginx |

## Monorepo layout

```
apps/
  client/          React + Vite + Phaser
  api/             NestJS REST API
  game-server/     Colyseus realtime server
packages/
  shared-types/    Zod + TS types shared across apps
  networking/      Colyseus message contracts and schemas
  game-core/       Pure domain (iso math, tiles, pathfinding)
  shared-ui/       React UI primitives
  shared-config/   Env loader / constants
  eslint-config/   Shared ESLint config
  ts-config/       Shared tsconfig presets
infrastructure/    Dockerfiles, nginx, postgres, redis
docs/              Architecture overview, ADRs, runbooks
scripts/           One-off scripts (key generation, etc.)
```

## Getting started

> Prereqs: Node 20+, pnpm 9+, Docker.

```bash
# 1. Install
pnpm install

# 2. Generate JWT RS256 keypair
pnpm keys:generate

# 3. Copy env
cp .env.example .env

# 4. Start Postgres + Redis
pnpm infra:up

# 5. Apply database migrations (after auth module is implemented)
pnpm --filter @pixelgame/api prisma migrate dev

# 6. Run everything in parallel
pnpm dev
```

| Port | Service |
|---|---|
| 5173 | client (Vite) |
| 3001 | api (NestJS) |
| 2567 | game-server (Colyseus) |
| 5432 | postgres |
| 6379 | redis |

## Scripts (root)

```bash
pnpm dev               # all apps in parallel
pnpm build             # build all
pnpm lint              # lint all
pnpm typecheck         # tsc --noEmit on all
pnpm test              # tests on all
pnpm format            # prettier write
pnpm infra:up          # docker compose: postgres + redis
pnpm infra:down        # tear down
pnpm keys:generate     # JWT RS256 keys → ./keys/
```

## Documentation

- [docs/architecture/overview.md](docs/architecture/overview.md) — full architecture
- [docs/adr/](docs/adr/) — Architecture Decision Records
- [docs/runbooks/local-dev.md](docs/runbooks/local-dev.md) — local setup runbook

## Specialized Claude subagents

Domain-specific agents in [.claude/agents/](.claude/agents/) accelerate development. Invoke via the `Agent` tool with the matching `subagent_type`.

| Agent | Focus |
|---|---|
| `frontend-architect` | Client structure, capas, Vite |
| `phaser-engine` | Scenes, sprites, iso rendering |
| `multiplayer-networking` | Protocol, messages, contracts |
| `colyseus-realtime` | Rooms, schemas, tick, presence |
| `backend-api` | NestJS modules, Prisma |
| `database-architect` | Schema, migrations, Redis keys |
| `devops` | Docker, CI/CD, infra |
| `security` | Auth, JWT, rate limiting |
| `ui-ux` | Design system, HUD, Tailwind |
| `performance` | Bundling, FPS, payload size |
| `realtime-sync` | Prediction, reconciliation |
| `isometric-systems` | Iso math, pathfinding |
| `documentation` | READMEs, ADRs, runbooks |
| `testing` | Unit, integration, E2E, load |

## License

MIT (or to be decided)
