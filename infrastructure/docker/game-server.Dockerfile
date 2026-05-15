# --- deps -------------------------------------------------------------------
FROM node:20-alpine AS deps
RUN corepack enable
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY apps/game-server/package.json apps/game-server/package.json
COPY packages packages
RUN pnpm install --frozen-lockfile

# --- build ------------------------------------------------------------------
FROM deps AS builder
COPY apps/game-server apps/game-server
RUN pnpm --filter @pixelgame/game-server build

# --- runtime ----------------------------------------------------------------
FROM node:20-alpine AS runtime
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /repo/apps/game-server/dist ./dist
COPY --from=builder /repo/apps/game-server/node_modules ./node_modules
COPY --from=builder /repo/apps/game-server/package.json ./package.json
EXPOSE 2567
CMD ["node", "dist/index.js"]
