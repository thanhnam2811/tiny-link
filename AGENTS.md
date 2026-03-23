# AI Agent Operating Protocol (v1.0)

## 1. Strategy: Plan-First, Code-Later

- **Mandatory Planning:** Never initiate code changes without a predefined implementation plan. The Agent must outline the steps and wait for acknowledgment before modifying files.
- **Re-planning on Failure:** If a bug or logical inconsistency occurs, stop immediately. Do not attempt "trial and error" patches. Re-evaluate the original plan, perform a **Re-plan**, and then proceed with the fix.
- **Traceability:** Every major architectural change must correspond to a specific step in the confirmed plan.

## 2. Resource Management & Sub-Agent Strategy

- **Context Hygiene:** Maintain a clean main context. Avoid cluttering the session with fragmented logic or excessive manual effort.
- **Task Delegation:** For highly complex modules, deep research, or heavy algorithmic tasks, delegate to a **Sub-Agent**.
- **Compute-Centric Approach:** Prioritize automated analysis (file system indexing, log querying, script execution) over human-like guessing or intuition.

## 3. Continuous Self-Improvement Loop

- **Knowledge Distillation:** Upon task completion or solving a complex bug, the Agent must document the findings in a `lessons.md` file.
- **Lean Learning:** Insights must be concise, focusing on the "Root Cause" and "Prevention Strategy" to avoid repeating the same mistakes.
- **Pre-flight Review:** Before starting any new task, the Agent must review `lessons.md` to ensure past errors are not reintroduced.

## 4. Definition of Done (DoD)

A task is strictly considered **Done** only when:

- **Test-Driven Validation:** Unit, integration, or functional tests have been executed and passed 100%.
- **Log Verification:** Console logs and system logs have been inspected to confirm there are no hidden warnings or unintended side effects.
- **Code Quality:** The code has been refactored for readability, following project standards (e.g., removing dead code or temporary comments).

## 5. Bug Resolution & Root Cause Analysis (RCA)

- **Log-First Mentality:** When an error occurs, the primary action is to read logs and stack traces. No assumptions are allowed.
- **Research Depth:** Investigate the **Root Cause** thoroughly before proposing a solution.
- **Cycle of Fix:** Detect Bug -> Analyze Logs -> Identify Root Cause -> Update Plan -> Implement Fix -> Verify with Tests.

## 6. Security & Infrastructure Integrity

- **Secret Safety:** Never hard-code API keys, credentials, or sensitive data. Always utilize environment variables (`.env`).
- **Dependency Mindfulness:** Before adding new packages, verify if existing libraries in the project can fulfill the requirement to avoid bloat.
- **Documentation Sync:** Any change to business logic must be immediately reflected in the project's documentation (README or inline docs).
