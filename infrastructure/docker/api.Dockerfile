# --- deps -------------------------------------------------------------------
FROM node:20-alpine AS deps
RUN corepack enable
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages packages
RUN pnpm install --frozen-lockfile

# --- build ------------------------------------------------------------------
FROM deps AS builder
COPY apps/api apps/api
RUN pnpm --filter @pixelgame/api prisma generate
RUN pnpm --filter @pixelgame/api build

# --- runtime ----------------------------------------------------------------
FROM node:20-alpine AS runtime
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /repo/apps/api/dist ./dist
COPY --from=builder /repo/apps/api/node_modules ./node_modules
COPY --from=builder /repo/apps/api/package.json ./package.json
COPY --from=builder /repo/apps/api/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
