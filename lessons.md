# Lessons Learned: Robust Prisma Monorepo Deployments (v2.0)

## The Root Cause (Brittle Monorepos)

In a monorepo using `pnpm deploy`, the default Prisma Client generation into `node_modules` is brittle because `pnpm` workspace symlinks and store hashes change between environments. This leads to "Module not found" or "Client not initialized" errors in Docker.

## The Ironclad Prevention Strategy (v2.0)

To achieve a 100% deterministic build:

1.  **Isolate Generation Path**: Set `output = "../generated-client"` in `schema.prisma`. This moves the client out of the ghost-ridden `node_modules` and into a fixed, predictable directory within the package (`packages/db/generated-client`).
2.  **Strict Multi-stage Build**: Use a 4-stage Dockerfile (`Base` ➔ `Deps` ➔ `Builder` ➔ `Runner`):
    - **Dependencies**: Cache `pnpm install` by only copying `package.json` files first.
    - **Ordered Build**: Explicitly build dependencies (`shared` then `db`) before the main application.
3.  **Manual dist Copying**: If `pnpm deploy` fails, manually assemble the production tree by copying `dist` and `node_modules`.
4.  **Healthchecks**: Standardize port (`3001`) and use a dedicated `/api/healthz` endpoint to let the orchestrator know when the app is truly ready.

This protocol ensures that the Prisma Client is "baked in" correctly at build-time and remains reachable regardless of how `pnpm` manages the final `node_modules` structure.
