FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS build

WORKDIR /app

COPY . .

# Use BuildKit cache mount for pnpm store to speed up rebuilds.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm --filter @tiny-link/db exec prisma generate
RUN pnpm --filter @tiny-link/server... build

# Create a deployable, symlink-safe production tree for only the server package.
RUN pnpm deploy --filter @tiny-link/server --prod /prod/server

FROM base AS runner

WORKDIR /prod/server

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=build /prod/server /prod/server
COPY --from=build /app/packages/db/prisma ./prisma

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs
USER nodeuser

EXPOSE 3001

CMD ["./entrypoint.sh"]