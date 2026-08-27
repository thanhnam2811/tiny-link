# [TL-FE-10] Refactor LinkShortenerForm God Form — Hook Extraction & Hydration Fix

**Status:** ⏳ Open  
**Ticket ID:** `TL-FE-10`

- **Type:** `Tech Debt`
- **Priority:** `P2 - Medium`
- **Component:** `@tiny-link/client`
- **Affected Files:**
    - `packages/client/src/components/LinkShortenerForm.tsx:20-451`
    - `packages/shared/src/schemas.ts:15`

#### 1. 📌 Context & Problem

451 lines mixes Zod schema, `window.location.host` hydration, dual `Controller` for same `expiresAt`, and API call. Issues:

- `host` `useEffect setHost(window.location.host):73-75` → SSR `''` vs client `example.com/` mismatch (hydration warning).
- Two `Controller name="expiresAt"` `:340` date + `:414` time → RHF overwrite; `format(field.value,'PPP'):361` crashes if string.
- Schema duplicates `@tiny-link/shared CreateLinkBody` regex drift (see `TL-QA-02` but still local `formSchema`).
- No `reset()` after success; `maxClicks` `z.union([number, ''])` type awkward.

#### 2. 🔍 Root Cause Analysis (RCA)

Single file owns validation + UI + fetch + URL construction; no `useLinkForm` hook per `frontend-architecture §3`.

#### 3. 💥 Impact

- Hydration mismatch in alias prefix `tinylink.com/` vs `host/`.
- Date picker crash on invalid `field.value`.
- Validation drift risk.

#### 4. 🛠️ Proposed Solution & Technical Steps

1. Create `hooks/useLinkForm.ts`:
    - `formSchema` imported from `@tiny-link/shared` or re-exported Zod; `useForm` + `zodResolver` there.
    - Expose `{ control, handleSubmit, host, onSubmit }` where `host` = `NEXT_PUBLIC_CLIENT_URL ?? ''` lazy, not `window.location.host`.
2. Merge dual `expiresAt` into single `Controller` + derived `time` input that mutates same `Date` via `setHours`.
3. Use `utils/getShortUrl(code)` helper: `${getClientBaseUrl()}/${code}` instead of `window.location.protocol//host` `form:94`.
4. Call `reset()` after `onSuccess`.
5. Add guard `field.value instanceof Date ? format(field.value,'PPP') : 'Pick a date'`.

#### 5. 📋 Acceptance Criteria (AC)

- [ ] `LinkShortenerForm.tsx` <180 lines; logic lives in `hooks/useLinkForm.ts` <150 lines.
- [ ] No `window.location.host` inside render; `grep -n "window.location" packages/client/src/components/LinkShortenerForm.tsx` returns only inside `onSubmit` or helper.
- [ ] Single `Controller` for `expiresAt`; date+time editing preserves hours.
- [ ] `LinkShortenerForm.test.tsx` passes.

#### 6. ✅ Definition of Done (DoD) & Verification Plan

- [ ] **Type Safety:** `tsc` passes.
- [ ] **Linting:** `pnpm lint` passes.
- [ ] **Testing:** Unit test for `useLinkForm` + existing form test.
- [ ] **Log Verification:** No hydration warnings in dev console.
- [ ] **Documentation:** None.

---

_Back to [Ticket Index](../README.md)_
