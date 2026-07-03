### 🟠 Phase 5: Code Refactoring & Optimization

**Status:** ✅ Done

#### 🎯 Goal

Improve code quality, maintainability, and design patterns without changing observable behavior.

#### 📋 Checklist

- [x] Remove magic strings and numbers across the codebase.
- [x] Optimize and standardize design patterns.
- [x] Improve general code structure and readability.
- [x] **API Documentation**: Integrate Swagger / OpenAPI for auto-generated, visually appealing API docs.

#### ✅ Definition of Done

- [x] All checklist items above are complete and merged to `main`.
- [x] No hardcoded magic strings/numbers remain in reviewed modules (verified via lint and manual review).
- [x] The existing Vitest suite still passes 100% after the refactor — no functional regressions introduced.
- [x] Swagger/OpenAPI docs render at `/documentation` and match the actual route contracts.
- [x] Repository/service/controller layering is applied consistently across modules.
