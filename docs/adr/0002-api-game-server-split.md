# ADR 0002 — Split API and Game Server

Status: Accepted
Date: 2026-05-15

## Context

The system has two workloads with opposite characteristics:

- **API**: stateless, request/response, scales horizontally, tolerant to ~100ms latency.
- **Realtime**: stateful (rooms in memory), persistent WebSocket, latency-critical, sharded.

Bundling them into one Nest application would simplify ops short-term but force the entire surface to inherit the realtime constraints.

## Decision

Two separate apps:

- `apps/api` — NestJS REST API.
- `apps/game-server` — Colyseus realtime server.

They share types via `@pixelgame/shared-types` and `@pixelgame/networking`. They do **not** call each other directly. Communication happens via Redis pub/sub for asynchronous events.

## Consequences

- Each service can scale on its own profile.
- Failure of one service doesn't take down the other (modulo Postgres/Redis dependencies).
- Operational complexity is higher: two deploys, two sets of metrics, two health checks.
- JWT verification is required in both services — we standardize on RS256 (see ADR 0003).
