# ADR 0005 — Phaser inside React with a one-way bridge

Status: Accepted
Date: 2026-05-15

## Context

We need a 2D canvas (Phaser) and a UI framework (React + Tailwind) coexisting. Mixing rendering logic and HUD logic produces brittle code: re-renders cancel animations, Phaser updates trip React reconciliation, and tests become impossible.

## Decision

- Phaser runs **inside** a single React component (`PhaserGame.tsx`) that owns its lifecycle (create / destroy on mount / unmount).
- **State flows one way**: Zustand stores ↔ Phaser scenes. Scenes subscribe to stores and re-render. UI components also read from the same stores.
- Phaser → React communication uses the **Phaser event emitter** (`game.events.emit(...)`), never direct `setState` from inside a Phaser update loop.
- Phaser scenes **never** import from `src/network` or `src/api`. They receive data through state.

## Consequences

- UI and engine can evolve independently.
- React StrictMode double-mount is handled (we tear down the Phaser instance in cleanup).
- The bridge code is the one place to look when debugging desync issues.
