# @pixelgame/client

React + Vite + Phaser client.

## Run

```bash
cp .env.example .env
pnpm --filter @pixelgame/client dev
```

Opens at `http://localhost:5173`.

## Layers (hard boundaries — enforced via eslint-plugin-boundaries)

| Layer | Folder | Imports allowed | Imports forbidden |
|---|---|---|---|
| App | `src/app` | any | — |
| Feature | `src/features/<f>` | state, api, network, ui, lib, shared-* | other features |
| Engine | `src/engine` | state, lib, game-core | network, api |
| Network | `src/network` | state, lib, networking | engine |
| State | `src/state` | lib, shared-types | feature, engine, network |
| API | `src/api` | lib, shared-types | feature, engine |
| UI | `src/ui`, `@pixelgame/shared-ui` | lib | feature, engine, network, api |
| Lib | `src/lib` | — | everything app-specific |

## Bridge between Phaser and React

- Phaser is **rendered inside** a React component (`PhaserGame.tsx`), mounted into a `div`.
- Communication is **one-way**: Zustand store → Phaser scenes via subscriptions, and Phaser → React via the Phaser event emitter (`game.events`).
- Never call React setState from inside Phaser update loops.
