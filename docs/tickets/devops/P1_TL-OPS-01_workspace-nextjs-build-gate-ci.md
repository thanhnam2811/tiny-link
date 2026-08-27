# [TL-OPS-01] Add Full Workspace Next.js Build Gate to CI Pipeline

**Status:** ⏳ Open  
**Ticket ID:** `TL-OPS-01`  


- **Type:** `DevOps`
- **Priority:** `P1 - High`
- **Component:** `root/ci-cd`
- **Affected Files:**
  - `.github/workflows/pipeline.yml:74-77`

#### 1. 📌 Context & Problem
GitHub Actions `pipeline.yml` acts as the PR merge gate for `main`.

#### 2. 🔍 Root Cause Analysis (RCA)
The `lint_test` job runs `pnpm --filter @tiny-link/server... build`, skipping `@tiny-link/client` and `@tiny-link/admin`.

#### 3. 💥 Impact
Frontend syntax and type errors pass CI PR checks and break Vercel deployments after merging to `main`.

#### 4. 🛠️ Proposed Solution & Technical Steps
Change the build step to `pnpm build` across all workspace packages:

```yaml
- name: Build All Packages
  run: pnpm build
```

#### 5. 📋 Acceptance Criteria (AC)
- [ ] Any TypeScript or JSX compilation errors in client/admin fail the CI check.

#### 6. ✅ Definition of Done (DoD) & Verification Plan
- [ ] Verify GitHub Actions workflow syntax.

---

---
*Back to [Ticket Index](../README.md)*
