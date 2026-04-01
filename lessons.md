# Lessons Learned

---

## Phase 10: Framer Motion + pnpm Peer Dependency Pitfalls

### Root Causes

1. **Duplicate component code**: Using the `edit` tool to replace only part of a file (e.g., just the imports) causes the old function body to be appended after the new content. Always verify file length after editing — if suspiciously long, check for duplicate `export default` / interface declarations.

2. **`framer-motion` Variants type with custom function**: When using a `visible: (i: number) => (...)` factory in a `Variants` object, TypeScript rejects `ease: number[]`. Must cast cubic-bezier arrays explicitly: `ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]` or import and annotate with `Variants` type.

3. **`pnpm add` hangs when peer dep mismatch exists**: `next-auth@5.0.0-beta.25` declares `peerDependencies: { next: "^14 || ^15" }` but project uses Next.js 16. Fix by adding to root `package.json`:

    ```json
    "pnpm": {
      "peerDependencyRules": {
        "allowedVersions": { "next-auth>next": "16" }
      }
    }
    ```

4. **Workspace packages must be built before client**: `@tiny-link/db` and `@tiny-link/shared` must be built (`tsup`) before running `next build` for `@tiny-link/client`, otherwise `Module not found: @tiny-link/db`.

### Prevention Strategy

- After every `edit` call on a large file, count lines or view the end to catch duplication early.
- Always annotate Framer Motion variants with `import { type Variants }` from the start.
- Add `pnpm.peerDependencyRules` proactively when upgrading Next.js beyond a library's declared peer range.
- Build order: `shared` → `db` → `client`.

---

## Robust Prisma Monorepo Deployments (v2.0)

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
