# ADR 0001 — Monorepo with Turborepo and pnpm workspaces

Status: Accepted
Date: 2026-05-15

## Context

The system splits cleanly into a client, a REST API, and a realtime game server. They share types (auth payloads, room schemas, message contracts) and at least one pure domain library (`game-core`).

Three poly-repos would duplicate types, fragment CI, and slow down cross-cutting changes. A single monorepo with workspace-aware tooling and remote-capable build caching is a better fit.

## Decision

Use **Turborepo** for task orchestration and **pnpm workspaces** for installs.

- `apps/*` — runtime applications.
- `packages/*` — shared libraries (`shared-types`, `networking`, `game-core`, ...).
- Strict workspace dependencies (`workspace:*`).

## Consequences

- Single `pnpm install` bootstraps everything.
- Tooling configs (`eslint-config`, `ts-config`) live as packages and are versioned in lockstep.
- Caching is per-package: changing the API doesn't invalidate the client build.
- Cost: contributors must learn Turbo/pnpm; CI must understand workspace topology.
