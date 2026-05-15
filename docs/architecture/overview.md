# Architecture overview

## System diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                            CLIENT (Browser)                          │
│  React (UI) + Phaser (Engine) + Zustand + React Query                │
│  ─ UI Layer ─── Engine Layer ─── Network Layer ─── Domain Layer ─    │
└──────────────────────────────────────────────────────────────────────┘
        │ REST/JSON (HTTPS)                  │ WebSocket (Colyseus binary)
        ▼                                    ▼
┌──────────────────────┐            ┌────────────────────────────────┐
│   API (NestJS)       │            │  GAME SERVER (Colyseus)        │
│   Stateless          │            │  Stateful, room-based          │
│   - Auth / JWT       │  ◄─────►   │  - Authoritative state         │
│   - Users / Profile  │  Redis     │  - Movement / chat / presence  │
│   - Rooms metadata   │  pub/sub   │  - Tick loop                   │
│   - Inventories      │            │  - Reconnection                │
└──────────────────────┘            └────────────────────────────────┘
        │                                    │
        ▼                                    ▼
   PostgreSQL                              Redis
```

## Components

### Client (`apps/client`)

React + Vite SPA. Phaser is mounted inside a React component (`PhaserGame.tsx`). Strict layer boundaries:

- **UI** (React components) — never touches network/engine directly.
- **State** (Zustand stores) — single source of truth for the UI.
- **Network** (Colyseus client + REST) — converts wire messages into state updates.
- **Engine** (Phaser scenes) — renders state. Never calls fetch or Colyseus.
- **Domain** (`@pixelgame/game-core`) — pure logic shared with the server.

### API (`apps/api`)

NestJS REST API. Modules: `auth`, `users`, `avatars`, `rooms`, `presence`. Prisma + Postgres for persistence. Validates input with Zod / class-validator. Mints JWT RS256 tokens.

### Game Server (`apps/game-server`)

Colyseus realtime server. Rooms: `lobby`, `world`. State synced via `@colyseus/schema` binary deltas. Game systems: `movement`, `chat`. Verifies JWTs in `onAuth` with the API's public key. Authoritative — never trusts client input.

## Communication

### Client ↔ API

- REST JSON over HTTPS.
- Bearer access token (in memory).
- Refresh token in httpOnly + Secure + SameSite=Strict cookie.
- React Query handles caching and revalidation.

### Client ↔ Game Server

- WebSocket (Colyseus).
- Handshake: `joinOrCreate(roomName, { accessToken })`.
- State sync: Colyseus schema deltas (auto).
- Custom messages from `@pixelgame/networking` (`move_intent`, `chat_send`, ...).

### API ↔ Game Server

- **No direct calls.** Communicate via Redis pub/sub (e.g. `events.user.banned`).
- Both verify JWTs with the same public key (RS256).
- Game server reads RoomLayouts from Postgres (read-only for now).

## Authoritative loop

```
1. Client click → emit { type: "move_intent", to: {x,y} }
2. Server validates (walkable, in range, rate-limit)
3. Server runs pathfinding (@pixelgame/game-core/pathfinding)
4. Server mutates state.players[id].path
5. Colyseus sends binary delta to all clients in the room
6. Client reconciles (snap or interpolate to authoritative path)
```

## Security

- JWT RS256 (asymmetric): API signs, Game Server verifies. No shared secret.
- Refresh token rotation with family invalidation on reuse.
- Argon2id password hashing.
- Helmet + strict CORS + CSP.
- Rate limiting via `@nestjs/throttler` and per-message in game server (Redis counters).
- Chat sanitized server-side.
- All client input validated against Zod schemas at the API border and the game server border.

## Scaling path

- Stateless API: add replicas behind a load balancer.
- Game server: Colyseus Redis driver + presence → multi-node cluster, room sharding.
- Postgres: read replicas when read-heavy, partition `chat_logs` if it grows.
- Redis: cluster mode if pub/sub volume justifies it.
- Client: CDN-served static bundle.
