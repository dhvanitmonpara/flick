# -------- Build stage --------
FROM node:24-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only server package files (build context = server/)
# Remove workspace dep (@flick/shared) before install since it's not used at runtime
COPY package.json ./
RUN node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8')); delete p.dependencies['@flick/shared']; require('fs').writeFileSync('package.json', JSON.stringify(p, null, 2));"

# Install all dependencies (no lockfile needed since we stripped workspace dep)
RUN pnpm install --no-frozen-lockfile

# Copy source code and build config
COPY src ./src
COPY esbuild.config.js tsconfig.json ./

# Build the server
RUN node esbuild.config.js

# Install production-only dependencies into /prod
RUN pnpm install --prod --no-frozen-lockfile
RUN mkdir /prod && cp -r node_modules /prod/node_modules && cp -r dist /prod/dist

# -------- Runtime stage --------
FROM node:24-alpine AS runtime

# Add dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copy production node_modules and built dist
COPY --from=builder --chown=nodejs:nodejs /prod/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /prod/dist ./dist
COPY --chown=nodejs:nodejs package.json ./

# Set production environment
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

# Switch to non-root user
USER nodejs

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
