# [TL-QA-02] Harmonize Custom Alias Form Regex between Client and Shared

**Status:** ⏳ Open  
**Ticket ID:** `TL-QA-02`  


- **Type:** `Bug`
- **Priority:** `P1 - High`
- **Component:** `@tiny-link/shared` & `@tiny-link/client`
- **Affected Files:**
  - `packages/client/src/components/LinkShortenerForm.tsx:26`
  - `packages/shared/src/schemas.ts:15`

#### 1. 📌 Context & Problem
Users can specify an optional Custom Alias when shortening URLs.

#### 2. 🔍 Root Cause Analysis (RCA)
Client Zod schema allows underscores `/^[a-zA-Z0-9-_]+$/`, while Server TypeBox schema strictly disallows them `^[a-zA-Z0-9-]+$` with length 3-30.

#### 3. 💥 Impact
Aliases containing underscores pass client validation but fail on submit with `400 Bad Request`.

#### 4. 🛠️ Proposed Solution & Technical Steps
Align client Zod validation to match the server schema:

```ts
customCode: z
  .string()
  .min(3, 'Custom alias must be at least 3 characters')
  .max(30, 'Custom alias must be at most 30 characters')
  .regex(/^[a-zA-Z0-9-]+$/, 'Custom alias can only contain letters, numbers, and hyphens')
  .optional()
  .or(z.literal(''))
```

#### 5. 📋 Acceptance Criteria (AC)
- [ ] Entering `my_alias` shows immediate client validation error.
- [ ] All valid client submissions pass server validation.

#### 6. ✅ Definition of Done (DoD) & Verification Plan
- [ ] Run `LinkShortenerForm.test.tsx`.

---

## 🟡 PRIORITY P2 — MEDIUM TICKETS (1–2 WEEKS)

---

---
*Back to [Ticket Index](../README.md)*
