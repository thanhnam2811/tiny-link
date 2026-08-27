# [TL-FE-09] Fix Landing Polling Leak — Extract RSC HealthGate & Abortable Poll

**Status:** ⏳ Open  
**Ticket ID:** `TL-FE-09`

- **Type:** `Bug`
- **Priority:** `P1 - High`
- **Component:** `@tiny-link/client`
- **Affected Files:**
    - `packages/client/src/app/page.tsx:1-106`
    - `packages/client/src/components/ServerLoadingOverlay.tsx`

#### 1. 📌 Context & Problem

`page.tsx:1` `'use client'` for entire landing kills RSC + `generateMetadata`; `useEffect [serverStatus]:106` recreates `setInterval` on every `setServerStatus` change — leaks interval when `warming→ready`. `attempts` is local var reset on re-run; `healthUrl='/api/proxy/healthz'` hardcoded bypasses `lib/api`.

#### 2. 🔍 Root Cause Analysis (RCA)

- Monolith page mixes Server Component hero + client polling.
- `setInterval` + `deps [serverStatus]` anti-pattern; should be `setTimeout` recursion with `useRef`.

#### 3. 💥 Impact

- Increased bundle (`framer-motion` for whole page).
- Polling leak causes 2x requests after retry; wasted `INTERNAL_API_URL` hits.

#### 4. 🛠️ Proposed Solution & Technical Steps

1. Split `page.tsx` (Server) + `HealthGate.tsx` (Client leaf):
    ```tsx
    // app/page.tsx (server)
    export default async function Home(){ const t=await getTranslations('home'); return <><HealthGate /><Hero t={t}/><FeatureGrid/></> }
    // components/HealthGate.tsx ('use client')
    export function HealthGate(){ const [status,set]=useState<'warming'|'ready'|'error'>('warming'); const attempts=useRef(0); useEffect(()=>{ let id; const tick=async()=>{...; if(attempts.current++ <30) id=setTimeout(tick,2000)}; tick(); return()=>clearTimeout(id)},[]) }
    ```
2. Use `api.health.check()` or `fetcher('/healthz')` instead of raw `/api/proxy/healthz`.
3. Isolate `motion` to leaf `FadeUp.tsx` with `useReducedMotion`.

#### 5. 📋 Acceptance Criteria (AC)

- [ ] `page.tsx` has no `'use client'`; `HealthGate.tsx` is sole client boundary.
- [ ] No `setInterval` with `serverStatus` deps; `grep -n "setInterval" packages/client/src/app/page.tsx` returns 0.
- [ ] Retry `onRetry={() => setStatus('warming')}` correctly resets `attempts.current`.

#### 6. ✅ Definition of Done (DoD) & Verification Plan

- [ ] **Type Safety:** `tsc` passes.
- [ ] **Linting:** `pnpm lint` passes.
- [ ] **Testing:** Manual warm→ready→error flow; `pnpm build` bundle size drops.
- [ ] **Log Verification:** No leaked intervals in React StrictMode double-invoke.
- [ ] **Documentation:** None.

---

_Back to [Ticket Index](../README.md)_
