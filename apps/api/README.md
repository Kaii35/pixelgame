# @pixelgame/api

NestJS REST API for Pixelgame. Stateless. Manages identity, profiles, rooms metadata, inventories.

## Run

```bash
cp .env.example .env
pnpm --filter @pixelgame/api prisma:generate
pnpm --filter @pixelgame/api prisma:migrate
pnpm --filter @pixelgame/api dev
```

Listens on `http://localhost:3001/api/v1`. Health: `GET /api/v1/health`.

## Modules

- `auth` — register, login, refresh, logout (Fase 1)
- `users` — `/me`, public profiles (Fase 1)
- `avatars` — look CRUD (Fase 1)
- `rooms` — metadata CRUD (Fase 2)
- `presence` — read-only online presence from Redis (Fase 2)

## Conventions

- All input validated with class-validator or Zod via `nestjs-zod`.
- Use `@pixelgame/shared-types` for shared schemas (cliente y servidor).
- Argon2id for password hashing.
- JWT RS256 — private key signs here, public key verified by `@pixelgame/game-server`.
- Rotating refresh tokens hashed (sha256) before storing.
