# TinyLink — Claude Code Guide

@docs/lessons.md

TinyLink is a full-stack URL shortener: pnpm monorepo, Fastify API + two Next.js apps (public client, admin), Prisma/PostgreSQL, Redis. Full design docs: `docs/ARCHITECTURE.md` (system design), `docs/roadmap/` (phase status, one file per phase — see `docs/roadmap/README.md` for the index and `docs/roadmap/backlog-ideas.md` for unscheduled ideas), `docs/workflow.md` (dev/test/preview loop), `docs/release.md` (branch → PR → deploy flow — read before cutting a release or bumping version), `README.md` (setup, env vars, scripts).

## Operating protocol (binding)

### 1. Strategy: Plan-First, Code-Later

- **Mandatory Planning**: Never initiate code changes without a predefined implementation plan. The Agent must outline the steps and wait for acknowledgment before modifying files.
- **Branching Strategy**:
    - `feature/xyz` or `fix/abc`: Dedicated branches for work.
    - `main`: Production branch. **PRODUCTION** environment target.
- **Git Workflow**:
    1. Branch from `main` for features/fixes.
    2. Perform full validation by running `pnpm lint`, `pnpm build` and `pnpm test` locally.
    3. Pull Request to `main` once work is complete and all checks pass.
    4. Merging to `main` auto-deploys to production.
- **Rule of No-Main-Push**: **NEVER** commit or push directly to `main`. All changes MUST go through a PR.
- **Stable Main**: The `main` branch is the "Source of Truth" and must always reflect the current production state.

### 2. Resource Management & Sub-Agent Strategy

- **Context Hygiene**: Maintain a clean main context. Avoid cluttering the session with fragmented logic or excessive manual effort.
- **Task Delegation**: For highly complex modules, deep research, or heavy algorithmic tasks, delegate to a **Sub-Agent**.
- **Compute-Centric Approach**: Prioritize automated analysis (file system indexing, log querying, script execution) over human-like guessing or intuition.

### 3. Continuous Self-Improvement Loop

- **Knowledge Distillation**: Upon task completion or solving a complex bug, the Agent must document the findings in `docs/lessons.md` (imported above).
- **Lean Learning**: Insights must be concise, focusing on the "Root Cause" and "Prevention Strategy" to avoid repeating the same mistakes.
- **Pre-flight Review**: Before starting any new task, the Agent must review `docs/lessons.md` to ensure past errors are not reintroduced.

### 4. Definition of Done (DoD)

A task is strictly considered **Done** only when:

- **Test-Driven Validation**: Unit, integration, or functional tests have been executed and passed 100%.
- **Log Verification**: Console logs and system logs have been inspected to confirm there are no hidden warnings or unintended side effects.
- **Code Quality**: The code has been refactored for readability, following project standards (e.g., removing dead code or temporary comments).

### 5. Bug Resolution & Root Cause Analysis (RCA)

- **Log-First Mentality**: When an error occurs, the primary action is to read logs and stack traces. No assumptions are allowed.
- **Research Depth**: Investigate the **Root Cause** thoroughly before proposing a solution.
- **Cycle of Fix**: Detect Bug -> Analyze Logs -> Identify Root Cause -> Update Plan -> Implement Fix -> Verify with Tests.

### 6. Security & Infrastructure Integrity

- **Secret Safety**: Never hard-code API keys, credentials, or sensitive data. Always utilize environment variables (`.env`).
- **Dependency Mindfulness**: Before adding new packages, verify if existing libraries in the project can fulfill the requirement to avoid bloat.
- **Documentation Sync**: Any change to business logic must be immediately reflected in the project's documentation (README or inline docs).

### 7. Type Safety & Strictness

- **Rule of No-Any**: **NEVER** use the `any` type. Use `unknown` if the type is truly unknown, or preferably, use generics, specific interfaces, or Prisma's generated types to ensure end-to-end type safety.
- **Strict Mode Compliance**: All code must pass `tsc` without warnings. Suppressing errors with `@ts-ignore` is only allowed as a last resort with a documented justification.

## Monorepo map

| Package             | Role                                 | Port | Notes                                   |
| ------------------- | ------------------------------------ | ---- | --------------------------------------- |
| `@tiny-link/shared` | Zod/TypeBox schemas, consts          | —    | Build first — everything depends on it  |
| `@tiny-link/db`     | Prisma schema + client               | —    | Build second                            |
| `@tiny-link/server` | Fastify API (links, analytics, auth) | 3001 | Only package with a test suite (Vitest) |
| `@tiny-link/client` | Public app + user dashboard          | 3000 | Auth0, next-intl (en/vi)                |
| `@tiny-link/admin`  | Admin dashboard                      | 3002 | Separate JWT auth, Recharts             |

**Build order matters**: `shared` → `db` → then `client`/`server`/`admin`. `pnpm build` at root handles this; don't `next build` a single app without building `shared`+`db` first or it'll fail with "module not found @tiny-link/db".

## Common commands

```bash
pnpm docker:up              # Postgres + Redis only (hybrid dev model)
pnpm dev                    # all packages, parallel, hot-reload
pnpm --filter @tiny-link/server run db:push   # sync schema to dev DB
pnpm --filter @tiny-link/server run db:studio # Prisma Studio

pnpm --filter @tiny-link/server test          # only package with tests (Vitest, own .env.test)
pnpm lint                   # ESLint, all packages
pnpm build                  # clean + shared → db → recursive build
```

`client` and `admin` have no `test` script — don't expect `pnpm test` at root to cover them.

## Gotchas worth knowing before you touch things

- **DB migrations**: use `prisma db push` locally, but production/CI always uses `prisma migrate deploy` — if you change `packages/db/prisma/schema.prisma`, generate a real migration (`pnpm --filter @tiny-link/server exec prisma migrate dev --name <name>`) and commit it, or the deploy pipeline will drift from your local DB.
- **Two separate DB URLs matter**: server uses `packages/server/.env`, client also talks to Postgres directly via `packages/client/.env` (`DATABASE_URL`) to sync the Auth0-derived `User` table — check both when touching connection config.
- **`INTERNAL_API_KEY`** must match between `client`/`admin` and `server` env files — client/admin never call Postgres/Redis directly for link/analytics data, only through the Fastify API.
- **Windows shell**: Bash tool runs Git Bash (POSIX); PowerShell tool is also available. `entrypoint.sh` and Docker-related scripts are POSIX-only and only run inside containers, not natively on Windows.
- More detailed root-cause writeups (Prisma monorepo builds, Framer Motion typing, pnpm peer deps, Fastify DI decorators) are in `docs/lessons.md`, imported above.

## Skills available for this project

Skills work like `package.json`/`node_modules`: **`skills-lock.json`** (root) is the committed manifest — name, source repo, resolved path, content hash. **`.agents/skills/`** and **`.claude/skills/`** are the resolved content, gitignored, regenerated on demand. Never hand-edit or commit files inside those two directories.

**After cloning, restore skills with:**

```bash
pnpm skills:install     # = npx --yes skills experimental_install -a claude-code -y
```

Currently locked: `docker-expert`, `fastify-best-practices`, `pnpm`, `prisma-database-setup`, `shadcn`, `tailwind-design-system`, `typescript-advanced-types`, `ui-ux-pro-max`, `vitest` — sourced from upstream maintainer repos (mcollina/skills, antfu/skills, prisma/skills, shadcn/ui, etc.). Prefer them over ad-hoc guessing for their respective domains.

To add or update a skill: `npx skills add <owner/repo> -s <skill-name> -a claude-code --copy` (writes to both directories and updates the lock file); `git add skills-lock.json` when done. Two notes from experience:

- `vercel-labs/next-skills` (formerly the source of a `next-best-practices` skill) no longer exposes a discoverable `SKILL.md` — the repo's structure changed upstream and the lock entry stopped resolving, so it was dropped. The global `vercel:nextjs` skill covers Next.js instead.
- Auth0 is covered by the global `vercel:auth` skill — no project-local skill needed. No maintainer-quality skill exists yet for this project's Redis usage (`ioredis` + `@fastify/redis` over raw TCP, not the Upstash REST SDK) — don't install `upstash/skills` for this, it teaches the wrong API.
