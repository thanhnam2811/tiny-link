# Lessons Learned: Prisma Client Initialization in Dockerized Monorepos

## Root Cause

When using `pnpm deploy` to create a standalone production bundle from a monorepo, many "side-effect" files in `node_modules` (like the generated Prisma Client) are not automatically carried over if they are nested within another workspace package's `node_modules`. This results in the "Prisma client did not initialize yet" error at runtime.

## Prevention Strategy

In Dockerized monorepos where `pnpm deploy` is used:

1. **Runtime Generation**: Always include `prisma generate` in the container's entrypoint script. This ensures the client is generated for the specific runtime environment (e.g., Alpine Linux) and is placed in the current environment's `node_modules`.
2. **Schema Availability**: Ensure the `schema.prisma` file is copied to the final runner stage of the Docker image so the CLI can find it at runtime.
3. **CLI Availability**: Ensure the `prisma` CLI is installed in the runner stage (either globally or as a production dependency).

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
