# AI Agent Operating Protocol (v1.1)

## 1. Strategy: Plan-First, Code-Later

- **Mandatory Planning**: Never initiate code changes without a predefined implementation plan. The Agent must outline the steps and wait for acknowledgment before modifying files.
- **Branching Strategy**:
    - `feature/xyz` or `fix/abc`: Dedicated branches for work.
    - `develop`: Integration branch. **STAGING/PREVIEW** environment target.
    - `main`: Production branch. **PRODUCTION** environment target.
- **Git Workflow**:
    1. Branch from `develop` for features/fixes.
    2. Pull Request to `develop` once work is complete.
    3. Verify code in the **Preview** environment (auto-deployed from `develop`).
    4. Pull Request `develop` to `main` once Preview is confirmed stable.
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

## 5. Bug Resolution & Root Cause Analysis (RCA)

- **Log-First Mentality**: When an error occurs, the primary action is to read logs and stack traces. No assumptions are allowed.
- **Research Depth**: Investigate the **Root Cause** thoroughly before proposing a solution.
- **Cycle of Fix**: Detect Bug -> Analyze Logs -> Identify Root Cause -> Update Plan -> Implement Fix -> Verify with Tests.

## 6. Security & Infrastructure Integrity

- **Secret Safety**: Never hard-code API keys, credentials, or sensitive data. Always utilize environment variables (`.env`).
- **Dependency Mindfulness**: Before adding new packages, verify if existing libraries in the project can fulfill the requirement to avoid bloat.
- **Documentation Sync**: Any change to business logic must be immediately reflected in the project's documentation (README or inline docs).

## 7. Type Safety & Strictness

- **Rule of No-Any**: **NEVER** use the `any` type. Use `unknown` if the type is truly unknown, or preferably, use generics, specific interfaces, or Prisma's generated types to ensure end-to-end type safety.
- **Strict Mode Compliance**: All code must pass `tsc` without warnings. Suppressing errors with `@ts-ignore` is only allowed as a last resort with a documented justification.
