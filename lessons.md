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

---

# Lessons Learned: Professional Fastify Architecture & Env Safety

## Root Cause: Redundant DI Decoration

In Fastify, certain plugins (like `@fastify/redis`) automatically add a decorator to the `server` instance with a specific name (e.g., `redis`). Manually calling `server.decorate('redis', ...)` after the plugin is registered will throw a `FastifyError: The decorator 'redis' has already been added!`.

## Prevention Strategy

1. **Check Plugin Behavior**: Before adding a manual decorator, verify if the plugin (like `@fastify/redis`, `@fastify/jwt`) already handles the decoration.
2. **Plugin Signature**: Always prefer the standard `FastifyPluginAsyncTypebox` signature `async (server, options) => { ... }` over custom factory functions. This ensures better integration with Fastify's encapsulation model.
3. **Type Augmentation**: Use module augmentation (`fastify.d.ts`) to provide type safety for your custom decorations (`prisma`, `analyticsManager`, etc.).
4. **Environment Strictness**: Implement a `getEnv` utility that prevents the use of "dangerous defaults" (like `admin123`) in Production environments to minimize security risks.

---

# Lessons Learned: Monorepo Type Resolution & Dist Path Strategy

## Root Cause: Broken Type Resolution in Dist Paths

When pointing TypeScript `paths` to a package's `dist/index.d.ts` in a monorepo, resolution fails if that package re-exports types from a nested generated directory (like Prisma's `generated-client`) that was not included in the `dist` folder during the build. `tsc` will follow the relative import in the `.d.ts` file and fail to find the definitions, leading to "module has no exported member" errors.

## Prevention Strategy

1. **Complete Dist Distribution**: When building workspace packages, ensure the `build` script copies all necessary artifacts (like Prisma's generated client) into the `dist` folder. This maintains the consistency of relative paths between `src` and `dist`.
2. **Project References**: Leverage TypeScript Project References (`references` and `composite: true`) and run `tsc --build` to ensure dependency order and incremental builds are handled correctly by the compiler.
3. **Type Hardening**: In Fastify apps, always use explicit type casting (`as Type`) for request objects (body, query, params) when automatic inference is broken due to complex monorepo path resolutions. This provides a "fail-safe" for type safety.
