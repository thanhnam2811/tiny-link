# [TL-ARCH-05] Unify Tailwind Color Model — Migrate HSL to OKLCH & Deduplicate Tokens

**Status:** ⏳ Open  
**Ticket ID:** `TL-ARCH-05`

- **Type:** `Tech Debt`
- **Priority:** `P2 - Medium`
- **Component:** `@tiny-link/client` & `@tiny-link/admin` & `root/ci-cd`
- **Affected Files:**
    - `packages/client/src/app/globals.css:7-50`
    - `packages/admin/app/globals.css:7-50`
    - `packages/client/src/components/ui/button.tsx:9,23`
    - `packages/admin/components/ui/button.tsx`
    - `packages/client/src/components/ui/card.tsx:11`

#### 1. 📌 Context & Problem

Client uses legacy `hsl(var(--background))` tokens, Admin uses `var(--background)` `oklch`. Sharing `ui/*` (button, card, dialog) via copy-paste 90% identical but `bg-primary` resolves differently. `h-8` vs `h-14` override in `buttonVariants` causes `twMerge` order fragility `LinkShortenerForm.tsx:148`.

#### 2. 🔍 Root Cause Analysis (RCA)

Admin scaffolded from shadcn `oklch` template (Tailwind v4 native), Client predates it with `hsl`. No `packages/ui` shared package; `shadcn/tailwind.css` imported twice duplicates utilities.

#### 3. 💥 Impact

- Token change requires 2 edits; drift continues.
- Dark mode `oklch` vs `hsl` renders differently on wide-gamut displays.

#### 4. 🛠️ Proposed Solution & Technical Steps

1. Choose `oklch` (Tailwind v4 native). Migrate Client `hsl 243 75% 59%` → `oklch(0.55 0.19 264)` via `oklch()` converter; keep `hsl` shim for one release if needed.
2. Create `packages/ui/src/tokens.css` + `packages/ui/src/components/ui/*` single source; both apps import via `workspace:*`.
3. Add `size="xl" h-14` to `buttonVariants` cva; remove `h-14` from `className` in forms.
4. Remove duplicate `@import 'shadcn/tailwind.css'` if `components.json` uses Tailwind 4 (check).

#### 5. 📋 Acceptance Criteria (AC)

- [ ] Single `tokens.css` defines `--primary` in `oklch`; both apps import it; `grep -r "@theme inline" packages/client packages/admin` shows only re-export.
- [ ] `button` `size="xl"` exists; no `h-*` in `className` when using `buttonVariants`.
- [ ] `pnpm build` passes for `client`, `admin`, `server`.

#### 6. ✅ Definition of Done (DoD) & Verification Plan

- [ ] **Type Safety:** `tsc` passes.
- [ ] **Linting:** `pnpm lint` passes.
- [ ] **Testing:** Visual check light/dark both apps.
- [ ] **Log Verification:** No duplicate `@import` warnings.
- [ ] **Documentation:** Update `DESIGN.md` tokens section.

---

_Back to [Ticket Index](../README.md)_
