# ADR 0006 — Ship @pixelgame/networking as compiled dist

Status: Accepted
Date: 2026-05-15

## Context

`@pixelgame/networking` exports `@colyseus/schema` classes decorated with `@type(...)`. These decorators only work under TypeScript's _legacy_ `experimentalDecorators` emit (`__decorate` calls), not the TC39 / Stage 3 emit (`__decorateElement`).

Originally the package's `main`/`types` pointed at `./src/index.ts`, letting every consumer compile the source directly. This works for:

- Vite (client) — reads our tsconfig chain and honors `experimentalDecorators`.
- tsc (typecheck) — same.

But it breaks for **tsx / esbuild** (used by `apps/game-server` in dev): esbuild does not reliably follow the `extends` chain through pnpm-symlinked workspace packages, so it falls back to TS 5.x defaults — which emit TC39 decorators. At runtime, `@colyseus/schema` annotations.ts:281 reads `target.constructor` on `undefined` and crashes.

## Decision

Ship `@pixelgame/networking` as **compiled CommonJS** from `./dist/`:

- `package.json` → `main: ./dist/index.js`, `types: ./dist/index.d.ts`, scoped `exports` for `.`, `./messages`, `./schemas`.
- `tsconfig.json` is **self-contained** for decorator settings (`experimentalDecorators: true`, `useDefineForClassFields: false`, `module: CommonJS`, `moduleResolution: Node`).
- Build is required before running the game server in dev (documented in the runbook).

Other workspace packages (`shared-types`, `game-core`, `shared-ui`, `shared-config`) keep source-only exports — they have no decorators and are safe to compile per-consumer.

## Consequences

- `pnpm build` must run once after install and again after any change to `packages/networking/src/*`. Turbo caches make this cheap.
- The compiled artifact is the contract — consumers can trust `dist/*.d.ts` for types.
- If we later add more packages that depend on TS-specific emit semantics (decorators, const enums, JSX-with-special-transform), do the same: ship compiled.
- In the future we may adopt `turbo watch` to rebuild packages on source change during dev.
