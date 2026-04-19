# -------- server/Dockerfile --------
FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8')); \
    delete p.dependencies['@flick/shared']; \
    require('fs').writeFileSync('package.json', JSON.stringify(p, null, 2));"

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY src ./src
COPY esbuild.config.js tsconfig.json ./
RUN node esbuild.config.js
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm prune --prod

FROM node:24-alpine AS runtime
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package.json ./

ENV NODE_ENV=production
ENV PORT=8000
# Pin to 1 worker — you only have 1 vCPU, multiple workers fight each other
ENV UV_THREADPOOL_SIZE=4
# Cap old-gen heap to leave room for moderation service
ENV NODE_OPTIONS="--max-old-space-size=256"

EXPOSE 8000
USER nodejs
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]