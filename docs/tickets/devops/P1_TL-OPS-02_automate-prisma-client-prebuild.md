# [TL-OPS-02] Automate Prisma Client Generation in `@tiny-link/db` Build Script

**Status:** ⏳ Open  
**Ticket ID:** `TL-OPS-02`  


- **Type:** `DevOps`
- **Priority:** `P1 - High`
- **Component:** `@tiny-link/db`
- **Affected Files:**
  - `packages/db/package.json:16`

#### 1. 📌 Context & Problem
Workspace packages import generated Prisma client types from `@tiny-link/db`.

#### 2. 🔍 Root Cause Analysis (RCA)
`"build": "tsup src/index.ts --format esm --dts --clean"` lacks a `"prebuild": "prisma generate"` trigger, causing fresh build environments to fail with missing module errors.

#### 3. 💥 Impact
Fresh clones or isolated Vercel builds fail if `prisma generate` is not invoked manually.

#### 4. 🛠️ Proposed Solution & Technical Steps
Add `"prebuild": "prisma generate"` in `packages/db/package.json`.

#### 5. 📋 Acceptance Criteria (AC)
- [ ] Running `pnpm clean && pnpm --filter @tiny-link/db build` succeeds from a clean state.

#### 6. ✅ Definition of Done (DoD) & Verification Plan
- [ ] `pnpm build` passes 100%.

---

---
*Back to [Ticket Index](../README.md)*
