# -------- Build stage --------
FROM node:24-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace configuration files (cached layer if unchanged)
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml .npmrc ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Install all dependencies (cached if lockfile unchanged)
RUN pnpm install --filter @flick/server... --frozen-lockfile

# Copy source code
COPY server ./server
COPY shared ./shared

# Build the server
WORKDIR /app/server
RUN pnpm build

# Prune to production dependencies only
RUN pnpm deploy --filter @flick/server --prod --legacy /prod

# Copy built dist to the deploy directory
RUN cp -r /app/server/dist /prod/dist

# -------- Runtime stage --------
FROM node:24-alpine AS runtime

# Add dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copy production-ready server from deploy output
COPY --from=builder --chown=nodejs:nodejs /prod ./server

# Set production environment
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

# Switch to non-root user
USER nodejs

WORKDIR /app/server
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
