# [TL-UI-08] Fix Taste Design Token Drift — Color/Shape/Theme Lock Violations

**Status:** ⏳ Open  
**Ticket ID:** `TL-UI-08`

- **Type:** `Tech Debt`
- **Priority:** `P1 - High`
- **Component:** `@tiny-link/client` & `@tiny-link/admin` & `root/DESIGN.md`
- **Affected Files:**
    - `DESIGN.md:5-36`
    - `packages/client/src/app/globals.css:60-95`
    - `packages/admin/app/globals.css:53-86`
    - `packages/client/src/app/page.tsx:30-59`
    - `packages/client/src/components/LinkShortenerForm.tsx:127,148`
    - `packages/client/src/components/ui/button.tsx:9`

#### 1. 📌 Context & Problem

`DESIGN.md` declares `primary #18181b (zinc-900)`, `accent #10b981 (emerald)`, `radius 6/8/12/9999` but implementation diverges into two parallel systems:

- Client: `--primary: 243 75% 59%` (Indigo) `hsl(var(--primary))` + `--radius: 0.875rem` `packages/client/src/app/globals.css:67,81`
- Admin: `--primary: oklch(0.205 0 0)` (monochrome zinc) `var(--background)` + `--radius: 0.625rem` `packages/admin/app/globals.css:60,77`
- Code uses `rounded-lg/xl/2xl/full` arbitrarily, plus `warning (38 92% 50%)` and `success (152 60% 40%)` alongside `primary`/`chart-2` in same page `page.tsx:30-59` — 4 accents on one landing.

Violates `taste §4.2 COLOR CONSISTENCY LOCK` (one accent per page), `§4.4 SHAPE CONSISTENCY LOCK` (one radius scale), `§4.11 PAGE THEME LOCK`, and `redesign §Color and Surfaces: More than one accent`.

#### 2. 🔍 Root Cause Analysis (RCA)

- `DESIGN.md` was written for initial Zinc+Emerald concept but Client migrated to Indigo for brand without updating docs.
- Admin was scaffolded from `shadcn` default `oklch` template, never synced to Client's `hsl` tokens.
- No single token source; `packages/client/src/app/globals.css:7-50` and `packages/admin/app/globals.css:7-50` duplicate `@theme inline` with different color spaces.
- `FEATURES` array assigns semantic colors incorrectly (`Shield → success green` vs security = indigo).

#### 3. 💥 Impact

- Every new component risks picking wrong token — dead-doc `DESIGN.md` misleads designers.
- `ui/*` copy-pasted between apps (button 53 lines identical) drifts silently.
- Landing fails taste pre-flight: `COLOR LOCK` + `SHAPE LOCK`.

#### 4. 🛠️ Proposed Solution & Technical Steps

1. Decide single source: keep Indigo (shipped) and update `DESIGN.md` to reflect `hsl 243 75% 59%` + `oklch` migration plan, OR revert Client to Zinc `#18181b` — pick one, delete the other.
2. Create `packages/ui/tokens.css` (or `packages/design-tokens`) and import in both apps; delete duplicated `globals.css` token blocks.
3. Normalize radius to one scale: `0.625rem` (shadcn default) or `0.875rem` — choose one, lint arbitrary `rounded-[*]` via `eslint no-restricted-syntax`.
4. Fix `page.tsx:30-59` to use single `primary` accent only; remap `FEATURES` bg/color to `bg-primary/10 text-primary` for all, or semantic `info/warning` with single hue.
5. `pnpm build` both apps to verify token resolution unchanged visually.

#### 5. 📋 Acceptance Criteria (AC)

- [ ] `DESIGN.md` matches runtime `globals.css` tokens (primary, radius, font).
- [ ] No file defines `--primary` outside token package; `grep -r "--primary" packages/client packages/admin` shows single source.
- [ ] Landing uses exactly one accent color (verify `grep -r "bg-warning\|bg-success\|text-chart-2" packages/client/src/app/page.tsx` returns 0).
- [ ] `taste §4.2, §4.4, §4.11` pre-flight checks pass.

#### 6. ✅ Definition of Done (DoD) & Verification Plan

- [ ] **Type Safety:** `tsc` passes without errors or warnings.
- [ ] **Linting:** `pnpm lint` passes with 0 errors.
- [ ] **Testing:** Visual regression via `pnpm build` + manual light/dark check.
- [ ] **Log Verification:** No unhandled exceptions.
- [ ] **Documentation:** Updated `DESIGN.md` and `docs/lessons.md`.

---

_Back to [Ticket Index](../README.md)_
