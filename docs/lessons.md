# Lessons Learned

---

## Security & Architecture: BFF Identity Sanitization & Next.js App Router Middleware Standards (P0 Resolutions)

### Root Causes

1. **BFF Header Injection (`TL-SEC-01`)**: When cloning incoming client request headers (`new Headers(req.headers)`) in a Next.js API proxy route without explicitly stripping internal auth headers (like `x-user-id`), untrusted client-supplied headers are forwarded verbatim to the backend alongside the trusted `x-internal-key`, enabling unauthenticated attackers to spoof arbitrary user identities.
2. **Non-Standard Next.js Middleware File & Narrow Route Check (`TL-ADM-01`)**: Naming the middleware file `proxy.ts` with custom named exports `proxy` and `proxyConfig` instead of the canonical `middleware.ts` (`export function middleware` / `export const config`) caused Next.js to bypass execution entirely. Additionally, checking only `pathname === '/'` instead of applying a default-deny policy left sensitive nested routes like `/links` and `/health` unguarded.

### Prevention Strategy

- **Header Sanitization Before Session Binding**: In BFF proxy routes, unconditionally delete any sensitive internal header (`headers.delete(INTERNAL_AUTH.USER_ID_HEADER)`) before evaluating the authenticated session. Only inject internal user identifiers if the server-side session contains a verified identifier.
- **Canonical Middleware Exports & Default-Deny Route Guarding**: Always use the standard `middleware.ts` filename and `export function middleware(request: NextRequest)` in Next.js apps. For authenticated portals (such as admin panels), adopt a default-deny strategy (`const isProtected = pathname !== '/login'`) so that new dashboard routes are protected automatically.

---

## P1 Resolutions: Multi-Layer SSRF Defense, Constant-Time Auth, Queue Poison Pills & CI Build Gates

### Root Causes & Insights

1. **SSRF via Metadata Scraper (`TL-SEC-02`)**: Fetching arbitrary user-provided URLs without DNS pre-flight checks permits requests to cloud metadata services (`169.254.169.254`), private RFC1918 networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), CGNAT, loopback, and IPv6 link-local addresses. Relying on HTTP redirects also risks redirection to private targets.
2. **Timing Side-Channels & Indefinite Admin Tokens (`TL-SEC-03`)**: Direct string comparison (`===`) leaks timing information based on password length and matching prefixes. Omitting JWT expiration creates eternal administrator tokens.
3. **Queue Poison Pill & Transaction Rollbacks (`TL-BE-04`)**: When an asynchronous buffer worker flushes batch analytics clicks, if a link was deleted in PostgreSQL, `Click.createMany` violates Foreign Key constraints and `Link.update` throws `RecordNotFound (P2025)`, rolling back the entire multi-item batch indefinitely.
4. **M2M Secret Isolation in Hybrid RSC/Client Fetchers (`TL-FE-02`)**: When unified API fetchers run across both RSC (server-side) and browser (client-side), spreading headers without standard `Headers` API handling or referencing private server secrets in client bundles risks token leaks or failed internal authentication.
5. **Partial CI Build Gates & Missing Prebuild Triggers (`TL-OPS-01`, `TL-OPS-02`, `TL-OPS-03`)**: Running server-only builds in CI misses Next.js type/JSX compilation errors in client/admin apps. Not attaching `"prebuild": "prisma generate"` to `@tiny-link/db` breaks clean builds. Ending deploy jobs without healthcheck verification fails to catch crash loops.
6. **Schema Validation Drift (`TL-QA-02`)**: Discrepancies between frontend Zod validation (`/^[a-zA-Z0-9-_]+$/`) and backend TypeBox validation (`^[a-zA-Z0-9-]+$`) cause unexpected 400 Bad Request rejections on submit.

### Prevention Strategies

- **DNS Pre-Flight & Strict Fetch Settings**: Always resolve hostnames via `dns.lookup` and test every resolved IP against all private/link-local/multicast IP CIDRs. Set `redirect: 'error'` and bounded timeout via `AbortSignal.timeout(2000)`.
- **SHA-256 Digest Constant-Time Comparison**: Hash both secrets with `crypto.createHash('sha256')` before invoking `crypto.timingSafeEqual` to avoid buffer length mismatches while guaranteeing constant-time evaluation. Set strict JWT expiry (`expiresIn: '8h'`) and route-level rate limiting.
- **Pre-Filtering Foreign Keys & Non-Throwing Batch Updates**: In queue worker flushes, query existing link IDs with `findMany({ where: { id: { in: linkIds } } })`, write clicks only for active links, and use `updateMany` for atomic counter increments without throwing on missing records.
- **Full Workspace CI Gate & Post-Deploy Health Probing**: Enforce `pnpm build` across all monorepo packages in CI, wire `"prebuild": "prisma generate"`, and probe `/api/healthz` via `ssh ... docker compose exec -T app wget` after deployments.
- **Schema Harmonization**: Ensure field constraints (regex, min/max lengths, allowed characters) in client schemas match server/shared TypeBox definitions exactly.

---

## Phase 12: Prisma CLI Broken on Windows (`@prisma/dev` → ESM-only `zeptomatch`) + First-Ever Migration Baselining

### Root Causes

1. **Prisma CLI 7.x unconditionally crashes on Windows/Node 20** the moment _any_ subcommand runs (`generate`, `migrate dev`, etc. — not just ones touching the new local-dev-database feature). `@prisma/dev` (a bundled dependency used for the "Prisma Postgres local dev server" feature we don't use) does `require("zeptomatch")` at module top-level, but every published version of `zeptomatch` is ESM-only (`"type": "module"`), so Node throws `ERR_REQUIRE_ESM` before the CLI even parses args. This is upstream and version-independent (still present in `@prisma/dev@0.24.14`, the latest as of writing).
2. **The repo's local dev Postgres (Docker) had silently drifted from the committed migration history.** `packages/db/prisma/migrations/` already had 7 real migrations (contrary to a first glance suggesting none existed — check with `git ls-files`, not just a fresh `Glob`, if a migrations dir looks suspiciously empty), but the local dev DB had been kept in sync via `prisma db push` (per the documented local workflow) rather than by replaying those migrations, so `_prisma_migrations` bookkeeping never matched the live schema. Running `prisma migrate dev` for a new schema change surfaces this as "drift detected" and refuses to proceed without a reset.
3. Prisma's CLI itself now refuses to run `migrate reset` (or other destructive ops) when it detects it's being invoked by an AI agent, unless a `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` env var is set to the literal text of the user's consent message — and the agent harness's own auto-mode classifier separately blocks command variations that look like manufactured consent. The only reliable path is to stop, explain the exact command/risk/scope (dev-only vs. production) in plain chat, and get the user to run the destructive command themselves in their own terminal, or to state consent as a fresh literal message the agent can pass through verbatim.

### Prevention Strategy

- The `ERR_REQUIRE_ESM` crash only reproduces on Node <22 — Node 22+ added synchronous `require()` support for (simple) ESM modules, so `@prisma/dev`'s `require("zeptomatch")` just works there. Since this project now pins `engines: { node: ">=24" }` (see `.nvmrc`), no patch is needed; a `pnpm patch` workaround was tried and later removed once the Node pin made it redundant. If this resurfaces on an older Node, wrapping the `require()` in `state.cjs` in a try/catch (fallback `{ default: () => true }`, since the feature it guards — local-dev-server directory listing — is unused here) is the known fix; do not bother downgrading `prisma`/`zeptomatch`, no published `zeptomatch` version avoids the underlying ESM-only-ness.
- Keep the repo's actual Node requirement (CI/production run Node 24) in sync across `.nvmrc`, `package.json engines`, and the README prerequisites — they had drifted (README said "≥ 20") and caused exactly this kind of confusion.
- Before assuming a schema change is "the first migration ever," check `git ls-files packages/db/prisma/migrations/` (not just a directory listing/Glob) — the folder can look empty to a quick tool call while being fully populated and tracked.
- Never run `prisma migrate reset` (or other DB-destructive commands) autonomously, even against an obviously-local Docker DB — surface the exact command, blast radius, and dev-vs-prod scope, and either get a fresh literal consent message from the user or have them run it in their own terminal.
- CI runs `prisma migrate deploy` against production (see `.github/workflows/pipeline.yml`) while local dev historically used `db push` — any new schema change **must** go through `prisma migrate dev` to produce a real migration file, or the next production deploy will silently no-op and drift further from `schema.prisma`.

---

## Vercel JSON Schema Compliance & Dashboard-First

### Key Facts

- **`env` is deprecated** in Vercel schema (`patternProperties` string map, `deprecated: true`).
- **`git.deploymentEnabled`** is valid schema (oneOf boolean or object with boolean additionalProperties), but managing branch deploy rules on Dashboard is preferred.
- **`rootDirectory`** is NOT a valid property in the Vercel schema — causes deploy failure.
- **`cleanUrls`** and **`trailingSlash`** are valid boolean properties.
- **`additionalProperties: false`** at root — every property must be explicitly in schema.

### Prevention Strategy

- Follow **Dashboard-first** principle: manage env vars, domains, and deploy rules on Vercel Dashboard, not in `vercel.json`.
- Keep `vercel.json` minimal: `$schema`, `framework`, `installCommand`, `buildCommand`, `outputDirectory`.
- Always verify against the official schema at `https://openapi.vercel.sh/vercel.json`.
- Use `additionalProperties: false` enforcement — if it's not in the schema, it will fail validation.

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
