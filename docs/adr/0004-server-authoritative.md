# ADR 0004 — Server-authoritative gameplay with client prediction

Status: Accepted
Date: 2026-05-15

## Context

Social MMO gameplay (movement, chat, interactions) needs both responsiveness (no perceived input lag) and anti-cheat (a client cannot teleport itself). These pull in opposite directions.

## Decision

- The **client sends intent**, never authoritative state: `move_intent`, `interact`, `chat_send`.
- The **server validates and decides**: walkability, range, rate limits, cooldowns.
- The **server broadcasts authoritative state** via Colyseus schema deltas.
- The client **predicts locally** for responsiveness and **reconciles** when the authoritative state arrives. For movement on a tile grid, reconciliation is a smooth snap to the server-computed path.
- The `@pixelgame/game-core` package contains the **shared deterministic rules** (iso math, walkability, pathfinding) so both sides compute the same answer.

## Consequences

- No teleport hacks: any client-declared position is ignored.
- More code: a small reconciliation layer is required client-side.
- Shared `game-core` introduces a coupling — but as a pure package with no runtime deps, the coupling is contained.
