# [TL-FE-08] Fix Top-Level `getEnv` Crash on Build — Lazy Env Evaluation

**Status:** ⏳ Open  
**Ticket ID:** `TL-FE-08`

- **Type:** `Bug`
- **Priority:** `P1 - High`
- **Component:** `@tiny-link/client` & `@tiny-link/admin`
- **Affected Files:**
    - `packages/client/src/lib/env.ts:6-16`
    - `packages/client/src/lib/api.ts:16`
    - `packages/client/src/app/api/proxy/[...path]/route.ts:6-7`
    - `packages/admin/lib/env.ts:6-16`
    - `packages/admin/lib/actions.ts:18-23`

#### 1. 📌 Context & Problem

`getEnv` throws if `!value && typeof window === 'undefined'` `env.ts:11`. Consumers evaluate at import top-level:

```ts
const BASE_URL = isServer ? getEnv('INTERNAL_API_URL')+... : '/api/proxy' // api.ts:16
```

CI build without env crashes before Next tree-shakes. Typing `=> string` but browser can return `undefined as string`.

#### 2. 🔍 Root Cause Analysis (RCA)

Eager evaluation at module load; no lazy getter. `env.ts` conflates `get` and `require`.

#### 3. 💥 Impact

- Build gate `pnpm build` fails on fresh clone / preview without `.env`.
- Violates `CLAUDE.md` stable main rule.

#### 4. 🛠️ Proposed Solution & Technical Steps

```ts
// lib/env.ts
export const getEnv = (k: string): string | undefined => process.env[k];
export const requireEnv = (k: string): string => {
	const v = process.env[k];
	if (!v && typeof window === 'undefined') throw new Error(`Missing ${k}`);
	return v ?? '';
};
// lib/api.ts
const getBaseUrl = () => (typeof window === 'undefined' ? `${requireEnv('INTERNAL_API_URL')}/api` : '/api/proxy');
export const fetcher = async <T>(path: string, opts: RequestInit = {}): Promise<T> => {
	const base = getBaseUrl();
	// ...
};
```

Inline `fetch` in `route.ts:6-7` and `admin/lib/actions.ts:18` also switch to `requireEnv`.

#### 5. 📋 Acceptance Criteria (AC)

- [ ] `pnpm build` succeeds with empty `.env` (mock `INTERNAL_API_URL` fallback) — no throw at import.
- [ ] `typeof window !== 'undefined'` path never throws.
- [ ] `grep -r "getEnv.*INTERNAL_API_URL" packages/` shows only inside functions, zero top-level.

#### 6. ✅ Definition of Done (DoD) & Verification Plan

- [ ] **Type Safety:** `tsc` passes.
- [ ] **Linting:** `pnpm lint` passes.
- [ ] **Testing:** `pnpm build` in clean container without env.
- [ ] **Log Verification:** No stack trace on import.
- [ ] **Documentation:** Update `docs/lessons.md` env pattern.

---

_Back to [Ticket Index](../README.md)_
