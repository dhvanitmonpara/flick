FROM node:24-alpine AS builder

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY server/package.json ./server/package.json
COPY shared/package.json ./shared/package.json

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
	pnpm install --frozen-lockfile --filter ./server...

COPY server/src ./server/src
COPY server/esbuild.config.js ./server/esbuild.config.js
COPY server/tsconfig.json ./server/tsconfig.json

RUN pnpm --dir server build
RUN CI=true pnpm --dir server prune --prod

FROM node:24-alpine AS runtime

RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /repo/server/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /repo/server/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /repo/server/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /repo/shared ./shared

ENV NODE_ENV=production
ENV PORT=8000
ENV HOST=0.0.0.0
ENV UV_THREADPOOL_SIZE=4
ENV NODE_OPTIONS="--max-old-space-size=256"

EXPOSE 8000

USER nodejs
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
