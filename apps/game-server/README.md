# @pixelgame/game-server

Colyseus realtime server — authoritative state for rooms, movement, chat.

## Run

```bash
cp .env.example .env
pnpm --filter @pixelgame/game-server dev
```

Listens on `ws://localhost:2567`. Monitor UI: `http://localhost:2567/colyseus`.

## Rooms

- `LobbyRoom` — list of available worlds (auto-disposed off).
- `WorldRoom` — a single world instance. Per-room state synced via `@pixelgame/networking` schemas.

## Auth

Clients pass `{ accessToken }` in `joinOrCreate` options. `onAuth` verifies the JWT using the public key under `JWT_PUBLIC_KEY_PATH`. The API mints these tokens.

## Layers

- `rooms/` — Colyseus `Room` classes (binding + lifecycle, NO game rules).
- `systems/` — game systems (movement, chat). Pure server logic.
- `schemas/` — re-export from `@pixelgame/networking` (single source of truth).
- `auth/` — JWT verification.
- `persistence/` — Postgres + Redis adapters.
- `config/` — env loading.

## Tick

`WorldRoom` runs at 20 Hz. The tick is for systems that need a clock (movement stepping, presence heartbeat). Message handlers are event-driven and run outside the tick.
