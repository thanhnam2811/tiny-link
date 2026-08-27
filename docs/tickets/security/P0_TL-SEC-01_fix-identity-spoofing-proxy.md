# [TL-SEC-01] Fix Identity Spoofing & Header Injection in Client BFF API Proxy

**Status:** ⏳ Open  
**Ticket ID:** `TL-SEC-01`  


- **Type:** `Security Vulnerability`
- **Priority:** `P0 - Critical`
- **Component:** `@tiny-link/client`
- **Affected Files:**
  - `packages/client/src/app/api/proxy/[...path]/route.ts:35-41`

#### 1. 📌 Context & Problem
The Next.js client proxy route (`/api/proxy/[...path]`) acts as a Backend-For-Frontend (BFF), forwarding user requests to the internal Fastify API while injecting `x-internal-api-key` and `x-user-id` (derived from the Auth0 session).

#### 2. 🔍 Root Cause Analysis (RCA)
The route clones all incoming request headers (`new Headers(req.headers)`). If an unauthenticated attacker sends a direct request with header `x-user-id: <VICTIM_USER_ID>`, `session?.user?.sub` is `undefined`. Because `x-user-id` is not deleted, the proxy forwards the attacker's forged `x-user-id` alongside the valid `INTERNAL_API_KEY`. The Fastify backend trusts `x-user-id` because `x-internal-api-key` matches.

```ts
// packages/client/src/app/api/proxy/[...path]/route.ts
const headers = new Headers(req.headers);
headers.delete('host');
headers.set(INTERNAL_AUTH.HEADER, INTERNAL_API_KEY || '');

if (session?.user?.sub) {
    headers.set(INTERNAL_AUTH.USER_ID_HEADER, session.user.sub);
}
// ❌ If unauthenticated, caller-supplied x-user-id is passed verbatim!
```

#### 3. 💥 Impact
Full Account Takeover across all link management endpoints (`GET /links/user`, `DELETE /links/:id`, `POST /links/bulk-import`, `GET /links/export`, `POST /keys`).

#### 4. 🛠️ Proposed Solution & Technical Steps
Always strip `INTERNAL_AUTH.USER_ID_HEADER` before evaluating Auth0 session.

```diff
  const headers = new Headers(req.headers);
  headers.delete('host');
+ headers.delete(INTERNAL_AUTH.USER_ID_HEADER);
  headers.set(INTERNAL_AUTH.HEADER, INTERNAL_API_KEY || '');

  if (session?.user?.sub) {
      headers.set(INTERNAL_AUTH.USER_ID_HEADER, session.user.sub);
  }
```

#### 5. 📋 Acceptance Criteria (AC)
- [ ] Direct requests to `/api/proxy/links/user` with header `x-user-id: victim-123` without Auth0 session return `401 Unauthorized` or empty data.
- [ ] Authenticated requests always inject the verified `session.user.sub` value.

#### 6. ✅ Definition of Done (DoD) & Verification Plan
- [ ] Add integration test verifying forged `x-user-id` header rejection.
- [ ] `pnpm build` and `pnpm test` pass.

---

---
*Back to [Ticket Index](../README.md)*
