# [TL-ADM-03] Remove Hardcoded Localhost URLs in Admin Links Table

**Status:** ✅ Done  
**Ticket ID:** `TL-ADM-03`

- **Type:** `Bug`
- **Priority:** `P1 - High`
- **Component:** `@tiny-link/admin`
- **Affected Files:**
    - `packages/admin/components/links-table.tsx:197, 208`

#### 1. 📌 Context & Problem

Admin Links Table provides action buttons to copy short links or visit them in a new tab.

#### 2. 🔍 Root Cause Analysis (RCA)

Buttons hardcode `http://localhost:3000/${link.shortCode}`.

#### 3. 💥 Impact

In production environments, copying or visiting links points users to `localhost:3000` instead of the live public domain.

#### 4. 🛠️ Proposed Solution & Technical Steps

Use `process.env.NEXT_PUBLIC_CLIENT_URL` with fallback to `window.location.origin`:

```ts
const clientBaseUrl =
	process.env.NEXT_PUBLIC_CLIENT_URL || (typeof window !== 'undefined' ? window.location.origin : '');
// Copy:
navigator.clipboard.writeText(`${clientBaseUrl}/${link.shortCode}`);
// Visit:
window.open(`${clientBaseUrl}/${link.shortCode}`, '_blank');
```

#### 5. 📋 Acceptance Criteria (AC)

- [x] Copied link string matches configured public client URL.

#### 6. ✅ Definition of Done (DoD) & Verification Plan

- [x] `pnpm build` passes.

---

---

_Back to [Ticket Index](../README.md)_
