FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS build

WORKDIR /app

COPY . .

# Use BuildKit cache mount for pnpm store to speed up rebuilds.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Generate Prisma client for all packages that need it
RUN pnpm --filter @tiny-link/db exec prisma generate

# Build workspace dependencies in correct order
# Using root build script to ensure all project references are resolved
RUN pnpm run build

# Create a deployable, symlink-safe production tree for only the server package.
RUN pnpm deploy --filter @tiny-link/server --prod /prod/server

FROM base AS runner

WORKDIR /prod/server

# Install essentials for healthcheck and wait-for-db
# postgresql-client provides pg_isready
RUN apk add --no-cache postgresql-client wget

# Environment configuration
ENV NODE_ENV=production
ENV PORT=3001
# Ensure Prisma looks for engines in a predictable location
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1

COPY --from=build /prod/server /prod/server
COPY --from=build /app/packages/db/prisma ./prisma

# Copy the generated Prisma client from the build stage. 
# pnpm stores this in a specific .pnpm path due to strict symlinking.
COPY --from=build /app/node_modules/.pnpm/@prisma+client@6.4.1*/node_modules/.prisma ./node_modules/.prisma

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create non-root user and set ownership of the app directory
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs \
    && chown -R nodeuser:nodejs /prod/server

USER nodeuser

# Healthcheck to let Docker Engine know if the container is healthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -no-verbose --tries=1 --spider http://localhost:3001/api/healthz || exit 1

EXPOSE 3001

CMD ["/entrypoint.sh"]