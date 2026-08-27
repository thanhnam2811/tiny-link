# [TL-UI-09] Fix Landing Taste Hero Violations — Version Pill, Glass, Typography & A11y

**Status:** ⏳ Open  
**Ticket ID:** `TL-UI-09`

- **Type:** `Bug`
- **Priority:** `P2 - Medium`
- **Component:** `@tiny-link/client`
- **Affected Files:**
    - `packages/client/src/app/page.tsx:112-197`
    - `packages/client/src/app/globals.css:148-186`
    - `packages/client/src/app/layout.tsx:8-16`
    - `packages/client/src/components/Header.tsx:29,70`
    - `packages/client/src/components/ShortenedLinkInfo.tsx:129-136`
    - `packages/client/src/components/LinkShortenerForm.tsx:116,140-144`

#### 1. 📌 Context & Problem

Landing hero passes most taste pre-flight but fails 5 hard bans:

- **Version pill in hero** `page.tsx:112-121` `TinyLink v{...} Stable` — taste §9.F bans `V0.6/BETA` in hero unless brief is launch preview.
- **Glass + gradient-mesh double** `page.tsx:109` `gradient-mesh` + `glass-card` `page.tsx:155` — taste §5 glass only for premium consumer, needs `border-white/10` + `prefers-reduced-transparency` fallback missing `globals.css:175-186`.
- **Inter as default** `layout.tsx:8` `Inter + Outfit` — taste §4.1 discourages `Inter` default, prefers `Geist/Satoshi/Cabinet`; `Inter` only for explicit Linear-style brief.
- **Motion without reduced-motion** `page.tsx:12-23` `fadeUp` + `page.tsx:196` `whileHover y:-3` — no `useReducedMotion()` gate, violates `taste §6.B` (>3 must honor).
- **A11y blockers:** `Header.tsx:29` `window.addEventListener scroll` (taste §5.D banned), `ShortenedLinkInfo.tsx:129` `opacity-0 group-hover:opacity-100` hover-only (keyboard Tab invisible), `LinkShortenerForm.tsx:116` `opacity-40 pointer-events-none` without `aria-disabled`, `Header.tsx:72` `alt={user.name ?? ''}` empty.

#### 2. 🔍 Root Cause Analysis (RCA)

- Features copied from AI defaults without taste pre-flight.
- Motion added via `framer-motion` without checking `motion/react useReducedMotion`.
- Accessibility was `shadcn/ui` default focus but raw `<button>/<a>` escaped.

#### 3. 💥 Impact

- Fails `taste §14` pre-flight — blocks redesign approval.
- Keyboard/SR users cannot access QR/download actions.
- Vestibular disorder users get motion sickness.

#### 4. 🛠️ Proposed Solution & Technical Steps

1. Remove version pill from hero `page.tsx:112-121` or move to footer `layout.tsx`; replace with value-prop eyebrow if needed (max 1 eyebrow per 3 sections).
2. Keep either `glass-card` OR `gradient-mesh`, not both; add `@media (prefers-reduced-transparency: reduce)` fallback to solid `bg-card`.
3. Replace `Inter` body with `Geist` (taste preference) or document Linear override; keep `Outfit` heading. Add `text-wrap: balance` to `h1`.
4. Wrap motion:
    ```ts
    import { useReducedMotion } from 'motion/react';
    const reduce = useReducedMotion();
    const fadeUp = reduce ? {hidden:{opacity:0},visible:{opacity:1}} : {...}
    if(reduce) return <>{children}</> // SmoothScrollProvider
    ```
5. Fix `Header.tsx:29` → use `useScroll()` or `IntersectionObserver` instead of `window.addEventListener('scroll')`.
6. Fix `ShortenedLinkInfo.tsx:129` → `opacity-0 group-hover:opacity-100 focus-within:opacity-100 focus:opacity-100`.
7. Fix form disabled → `<fieldset disabled aria-busy>` + `aria-disabled`.

#### 5. 📋 Acceptance Criteria (AC)

- [ ] No version string inside hero; `grep -n "v\${" packages/client/src/app/page.tsx` returns 0 for hero section.
- [ ] `prefers-reduced-motion: reduce` disables all hero motion (manual OS toggle test).
- [ ] Keyboard Tab reveals QR button; axe scan 0 violations for `Header`, `ShortenedLinkInfo`.
- [ ] Lighthouse A11y ≥95.

#### 6. ✅ Definition of Done (DoD) & Verification Plan

- [ ] **Type Safety:** `tsc` passes.
- [ ] **Linting:** `pnpm lint` passes.
- [ ] **Testing:** `pnpm --filter @tiny-link/client test` + axe `accessibility_checker.py`.
- [ ] **Log Verification:** No `window.scrollY` in render.
- [ ] **Documentation:** Note taste override for `Inter` if kept.

---

_Back to [Ticket Index](../README.md)_
