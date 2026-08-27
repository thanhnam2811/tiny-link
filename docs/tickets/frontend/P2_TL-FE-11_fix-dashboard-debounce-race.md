# [TL-FE-11] Fix Dashboard Fetch Storm — Debounce, Abort & Dialog Confirm

**Status:** ⏳ Open  
**Ticket ID:** `TL-FE-11`

- **Type:** `Bug`
- **Priority:** `P2 - Medium`
- **Component:** `@tiny-link/client`
- **Affected Files:**
    - `packages/client/src/app/dashboard/page.tsx:56-140`
    - `packages/client/src/components/BulkImportDialog.tsx:41`
    - `packages/client/src/lib/download.ts`

#### 1. 📌 Context & Problem

`fetchLinks` `useCallback [page,search]:68` + `useEffect [fetchLinks]:70` triggers fetch on every keystroke `setSearch(e.target.value):140` — 10 req/s when typing "youtube". No debounce, no `AbortController` → race when paging fast. `window.confirm` `:85` blocks UI, not i18n/a11y. `window.location.origin` inline `:168,223` hydration risk.

#### 2. 🔍 Root Cause Analysis (RCA)

Missing debounce hook and query library; `useState` drives `useEffect` directly. `window.confirm` anti-pattern vs Admin's `Dialog`.

#### 3. 💥 Impact

- API rate-limit hits `429` during search.
- Race shows stale page data.
- Poor UX on mobile.

#### 4. 🛠️ Proposed Solution & Technical Steps

1. Create `hooks/useUserLinks.ts`:
    ```ts
    export function useUserLinks({ page, search }: { page: number; search: string }) {
    	const debounced = useDebounce(search, 400);
    	return useQuery({
    		queryKey: ['links', page, debounced],
    		queryFn: ({ signal }) => api.links.getUserLinks(page, 10, debounced, signal),
    	});
    }
    // update api.links.getUserLinks to accept signal?: AbortSignal and pass to fetcher
    ```
2. Replace `window.confirm` with `Dialog` confirm (destructive variant) like `admin/components/links-table.tsx:293`.
3. Extract `LinkCard.tsx`, `LinkCardSkeleton.tsx`, `EmptyState.tsx` from monolith (file <200 lines per architecture).
4. Use `getClientBaseUrl()` helper for short URL instead of `window.location.origin`.

#### 5. 📋 Acceptance Criteria (AC)

- [ ] Typing 10 chars fires ≤2 requests (debounced 400ms).
- [ ] Fast page switch shows correct page (abort old fetch).
- [ ] Delete uses `Dialog` with `aria-describedby`, no `window.confirm`.
- [ ] `grep -n "window.confirm" packages/client/src/app/dashboard/page.tsx` returns 0.

#### 6. ✅ Definition of Done (DoD) & Verification Plan

- [ ] **Type Safety:** `tsc` passes.
- [ ] **Linting:** `pnpm lint` passes.
- [ ] **Testing:** `pnpm --filter @tiny-link/client test` + manual type-ahead.
- [ ] **Log Verification:** No `console.error` spam.
- [ ] **Documentation:** None.

---

_Back to [Ticket Index](../README.md)_
