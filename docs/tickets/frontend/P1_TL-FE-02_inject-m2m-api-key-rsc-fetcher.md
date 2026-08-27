# [TL-FE-02] Inject M2M Internal API Key in Server-Side RSC Fetcher

**Status:** ⏳ Open  
**Ticket ID:** `TL-FE-02`  


- **Type:** `Bug`
- **Priority:** `P1 - High`
- **Component:** `@tiny-link/client`
- **Affected Files:**
  - `packages/client/src/lib/api.ts:13-35`

#### 1. 📌 Context & Problem
The Next.js client queries Fastify via the `fetcher<T>()` utility.

#### 2. 🔍 Root Cause Analysis (RCA)
When executing inside React Server Components (`typeof window === 'undefined'`), `fetcher` targets `INTERNAL_API_URL/api` directly but omits the `x-internal-api-key` header, causing Fastify to reject requests with `401 Unauthorized`.

#### 3. 💥 Impact
Server-rendered pages (e.g. `stats/[code]/page.tsx`) fail to load data during SSR.

#### 4. 🛠️ Proposed Solution & Technical Steps
Automatically attach `INTERNAL_AUTH.HEADER` when `isServer === true`:

```ts
import { INTERNAL_AUTH } from '@tiny-link/shared';
import { getEnv } from './env';

const isServer = typeof window === 'undefined';
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  ...(isServer && { [INTERNAL_AUTH.HEADER]: getEnv('INTERNAL_API_KEY') }),
  ...(options.headers as Record<string, string>),
};
```

#### 5. 📋 Acceptance Criteria (AC)
- [ ] Server Component calls to backend succeed without 401 errors.

#### 6. ✅ Definition of Done (DoD) & Verification Plan
- [ ] `pnpm build` and test SSR routes.

---

---
*Back to [Ticket Index](../README.md)*
