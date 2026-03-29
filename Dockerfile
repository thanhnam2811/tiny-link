# Stage 1: Build the application (Unified Build Stage)
FROM node:24-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# 1. Copy ONLY workspace configs and ALL package.json files first
# This is the "Magic Step" for speed: it allows Docker to cache the install layer.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/admin/package.json ./packages/admin/
COPY packages/client/package.json ./packages/client/
COPY packages/db/package.json ./packages/db/
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/

# 2. Install dependencies (This layer is now cached unless libraries change)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 3. Copy the rest of the source code (Changes below this line will only rebuild from here downward)
COPY . .

# 4. Generate Prisma Client
RUN ./node_modules/.bin/prisma generate --schema=packages/db/prisma/schema.prisma

# 5. Build only server and its dependencies (shared, db)
RUN pnpm --filter @tiny-link/shared build && \
    pnpm --filter @tiny-link/db build && \
    pnpm --filter @tiny-link/server build

# 6. Deploy server to a standalone directory
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