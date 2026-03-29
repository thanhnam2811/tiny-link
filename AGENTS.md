# AI Agent Operating Protocol (v1.2)

## 1. Strategy: Plan-First, Code-Later

- **Mandatory Planning**: Never initiate code changes without a predefined implementation plan. The Agent must outline the steps and wait for acknowledgment before modifying files.
- **Branching Strategy**:
    - `feature/xyz` or `fix/abc`: Dedicated branches for work.
    - `develop`: Integration branch. **STAGING/PREVIEW** environment target.
    - `main`: Production branch. **PRODUCTION** environment target.
- **Git Workflow**:
    1. Branch from `develop` for features/fixes.
    2. Perform full validation by running `pnpm lint`, `pnpm build` and `pnpm test` locally.
    3. Pull Request to `develop` once work is complete and all checks pass.
    4. Verify code in the **Preview** environment (auto-deployed from `develop`).
    5. Pull Request `develop` to `main` once Preview is confirmed stable.
- **Rule of No-Main-Push**: **NEVER** commit or push directly to `develop` or `main`. All changes MUST go through a PR.
- **Stable Main**: The `main` branch is the "Source of Truth" and must always reflect the current production state.

## 2. Resource Management & Sub-Agent Strategy

- **Context Hygiene**: Maintain a clean main context. Avoid cluttering the session with fragmented logic or excessive manual effort.
- **Task Delegation**: For highly complex modules, deep research, or heavy algorithmic tasks, delegate to a **Sub-Agent**.
- **Compute-Centric Approach**: Prioritize automated analysis (file system indexing, log querying, script execution) over human-like guessing or intuition.

## 3. Continuous Self-Improvement Loop

- **Knowledge Distillation**: Upon task completion or solving a complex bug, the Agent must document the findings in a `lessons.md` file.
- **Lean Learning**: Insights must be concise, focusing on the "Root Cause" and "Prevention Strategy" to avoid repeating the same mistakes.
- **Pre-flight Review**: Before starting any new task, the Agent must review `lessons.md` to ensure past errors are not reintroduced.

## 4. Definition of Done (DoD)

A task is strictly considered **Done** only when:

- **Test-Driven Validation**: Unit, integration, or functional tests have been executed and passed 100%.
- **Log Verification**: Console logs and system logs have been inspected to confirm there are no hidden warnings or unintended side effects.
- **Code Quality**: The code has been refactored for readability, following project standards (e.g., removing dead code or temporary comments).
- **Zero `unknown` inputs**: All Request Params, Body, and Query objects must have explicit schemas or validated types (No `implicit any`).

## 5. Bug Resolution & Root Cause Analysis (RCA)

- **Log-First Mentality**: When an error occurs, the primary action is to read logs and stack traces. No assumptions are allowed.
- **Research Depth**: Investigate the **Root Cause** thoroughly before proposing a solution.
- **Cycle of Fix**: Detect Bug -> Analyze Logs -> Identify Root Cause -> Update Plan -> Implement Fix -> Verify with Tests.

## 6. Security & Infrastructure Integrity

- **Environment & Secret Hardening**:
    - Never hard-code API keys, credentials, or sensitive data. Use `.env`.
    - **Production Safety**: The `getEnv` utility must be used for all secrets. Fallbacks (`admin123`, `secret`, `TEST_KEY`) are **STRICTLY PROHIBITED** in Production.
    - Missing production secrets must result in an immediate `CRITICAL` error during startup.
- **Monorepo Build Integrity**:
    - **Isolation**: Always use `--filter` when building or testing to ensure package isolation.
    - **Build Order**: Dependencies (e.g., `@tiny-link/shared`, `@tiny-link/db`) must be built **BEFORE** the consumer package (e.g., `@tiny-link/server`).
- **Dependency Mindfulness**: Before adding new packages, verify if existing libraries in the project can fulfill the requirement to avoid bloat.
- **Ops Guardrails**:
    - All Dockerfiles MUST include a `HEALTHCHECK` (calling `/api/healthz` or equivalent).
    - Database migrations MUST be separated from the primary application container lifecycle (e.g., CI/CD Job) to prevent race conditions during scale-out.

## 7. Type Safety & Architectural Patterns

- **Fastify Architectural Consistency**:
    - Custom services MUST be registered via `server.decorate` with proper module augmentation in `fastify.d.ts`.
    - Always point `tsconfig` paths to built `dist` folder to avoid `TS6305` errors.
- **Rule of No-Any**: **NEVER** use the `any` type. Use `unknown` if the type is truly unknown, or preferably, use generics, specific interfaces, or Prisma's generated types.
- **Strict Mode Compliance**: All code must pass `tsc` without warnings. Suppressing errors with `@ts-ignore` is only allowed as a last resort with a documented justification.
