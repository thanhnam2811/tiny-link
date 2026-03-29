# Stage 1: Base image with pnpm enabled
FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 2: Install dependencies (leveraging layer caching)
FROM base AS deps
WORKDIR /app

# Copy configuration files first
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy package.json files of all workspace members to facilitate cached install
COPY packages/db/package.json ./packages/db/
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/

# Use BuildKit cache for pnpm store.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage and all source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 1. Generate Prisma Client to the dedicated location
RUN pnpm --filter @tiny-link/db exec prisma generate

# 2. Build local workspace dependencies in order
RUN pnpm --filter @tiny-link/shared build
RUN pnpm --filter @tiny-link/db build

# 3. Build the main server application
RUN pnpm --filter @tiny-link/server build

# 4. Prune workspace for production
# This creates a standalone folder with only production dependencies and built code.
RUN pnpm deploy --filter @tiny-link/server --prod /app/prod/server

# Stage 4: Production runner
FROM base AS runner
WORKDIR /app/prod/server

# Install runtime essentials (healthchecks & db-wait)
RUN apk add --no-cache postgresql-client wget

# Ensure environment variables are set for production
ENV NODE_ENV=production
ENV PORT=3001

# Copy the entrypoint script and ensure it's executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create a non-root user for security
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs \
    && chown -R nodeuser:nodejs /app/prod/server /entrypoint.sh

USER nodeuser

# Healthcheck to verify service availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/healthz || exit 1

EXPOSE 3001

ENTRYPOINT ["/entrypoint.sh"]