# Stage 1: Build the application (Unified Build Stage)
FROM node:24-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# 1. Copy everything for local resolution
COPY . .

# 2. Install dependencies (with full context to preserve workspace symlinks)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 3. Generate Prisma Client
RUN ./node_modules/.bin/prisma generate --schema=packages/db/prisma/schema.prisma

# 4. Build dependencies first (creates actual dist and types)
RUN pnpm --filter @tiny-link/shared build
RUN pnpm --filter @tiny-link/db build

# 5. Build server (now it will find the dist/index.d.ts files correctly)
RUN pnpm --filter @tiny-link/server build

# 6. Prune dev dependencies for production
RUN CI=true pnpm prune --prod --ignore-scripts

# ---------------------------------------------------------------------------------
# Stage 2: Production runner
# ---------------------------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app

# Install runtime essentials
RUN apk add --no-cache postgresql-client wget

# Ensure environment variables are set for production
ENV NODE_ENV=production
ENV PORT=3001

# MANUAL ASSEMBLY: Copy all needed artifacts
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Copy the entrypoint script and ensure it's executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create a non-root user for security
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs \
    && chown -R nodeuser:nodejs /app /entrypoint.sh

USER nodeuser

# Healthcheck to verify service availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/healthz || exit 1

EXPOSE 3001

# Start using the workspace entrypoint
ENTRYPOINT ["/entrypoint.sh"]