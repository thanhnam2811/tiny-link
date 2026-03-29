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

# 5. Build server and dependencies
RUN pnpm --filter @tiny-link/server build

# 6. Deploy server to a standalone directory (flattens dependencies)
RUN pnpm --filter @tiny-link/server deploy --prod /app/out

# -----------------------------------------------------------------
# Stage 2: Production runner
# -----------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app

# Install runtime essentials
RUN apk add --no-cache postgresql-client wget

# Create a non-root user for security
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs

# Ensure environment variables are set for production
ENV NODE_ENV=production
ENV PORT=3001

# Copy ONLY the standalone deployed application
COPY --from=builder --chown=nodeuser:nodejs /app/out ./

# Copy the entrypoint script
COPY --chown=nodeuser:nodejs entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nodeuser

# Healthcheck to verify service availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/healthz || exit 1

EXPOSE 3001

# Start the application from the flattened structure
ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 3001

# Start using the workspace entrypoint
ENTRYPOINT ["/entrypoint.sh"]