FROM node:22-alpine AS deps

WORKDIR /app

RUN corepack enable

# Copy only manifests first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json tsconfig.base.json ./
COPY packages/server/package.json packages/server/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS builder

WORKDIR /app

COPY . .

# Build workspace packages and generate Prisma client in Alpine env
RUN pnpm --filter @tiny-link/shared build
RUN pnpm --filter @tiny-link/server build
RUN pnpm --filter @tiny-link/server exec prisma generate

FROM builder AS pack

WORKDIR /app

# Produce a symlink-safe runtime tree for the server package
RUN pnpm deploy --filter @tiny-link/server --prod /app/out

FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable

ENV NODE_ENV=production

# Symlink-safe production dependency tree from pnpm deploy
COPY --from=pack /app/out ./

# Ensure built artifacts and Prisma schema/migrations exist in runtime image
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/server/prisma ./packages/server/prisma

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs
USER nodeuser

EXPOSE 3000

CMD ["./entrypoint.sh"]