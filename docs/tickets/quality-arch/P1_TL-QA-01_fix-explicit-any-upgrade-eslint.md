# [TL-QA-01] Fix Explicit `: any` in `admin.routes` and Upgrade ESLint Rule

**Status:** ✅ Done  
**Ticket ID:** `TL-QA-01`

- **Type:** `Quality Assurance`
- **Priority:** `P1 - High`
- **Component:** `@tiny-link/server` & `root`
- **Affected Files:**
    - `packages/server/src/modules/admin/admin.routes.ts:186`
    - `eslint.config.js:27`

#### 1. 📌 Context & Problem

`CLAUDE.md` mandates the strict **"Rule of No-Any"**.

#### 2. 🔍 Root Cause Analysis (RCA)

- `admin.routes.ts` uses `links.map((link: any) => ...)`.
- Root `eslint.config.js` sets `@typescript-eslint/no-explicit-any: 'warn'` instead of `'error'`.

#### 3. 💥 Impact

Type safety erosion and non-compliance with monorepo coding standards.

#### 4. 🛠️ Proposed Solution & Technical Steps

- Remove `: any` annotation in `admin.routes.ts` to allow automatic type inference.
- Upgrade ESLint rule to `'error'`.

#### 5. 📋 Acceptance Criteria (AC)

- [x] Zero instances of `: any` across `@tiny-link/server`.
- [x] Adding an explicit `any` fails `pnpm lint`.

#### 6. ✅ Definition of Done (DoD) & Verification Plan

- [x] `pnpm lint` passes with 0 errors.

---

---

_Back to [Ticket Index](../README.md)_
