# --- builder ----------------------------------------------------------------
FROM node:20-alpine AS builder
RUN corepack enable
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY apps/client/package.json apps/client/package.json
COPY packages packages
RUN pnpm install --frozen-lockfile
COPY apps/client apps/client
RUN pnpm --filter @pixelgame/client build

# --- runtime ----------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime
COPY infrastructure/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /repo/apps/client/dist /usr/share/nginx/html
EXPOSE 80
