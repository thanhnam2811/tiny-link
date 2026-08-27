# [TL-ADM-01] Fix Admin Route Protection & Export Middleware per Next.js Standard

**Status:** ⏳ Open  
**Ticket ID:** `TL-ADM-01`  


- **Type:** `Security Vulnerability`
- **Priority:** `P0 - Critical`
- **Component:** `@tiny-link/admin`
- **Affected Files:**
  - `packages/admin/proxy.ts` (rename to `packages/admin/middleware.ts`)

#### 1. 📌 Context & Problem
The Admin application (`@tiny-link/admin`) must require authentication via the `admin_token` cookie for all dashboard pages.

#### 2. 🔍 Root Cause Analysis (RCA)
1. `packages/admin/proxy.ts` defines `export function proxy` and `export const proxyConfig`. Next.js App Router strictly expects `export function middleware` (or default export) and `export const config`. Due to named export mismatches, Next.js completely skips middleware execution.
2. The path check was only `if (pathname === '/' && !token)`, leaving `/links`, `/health`, and nested routes unguarded.

#### 3. 💥 Impact
Unauthenticated users can directly navigate to `http://localhost:3002/links` and `/health` bypassing the login screen.

#### 4. 🛠️ Proposed Solution & Technical Steps
Rename file to `middleware.ts` with standard exports and broad route matchers:

```ts
// packages/admin/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const isProtected = pathname === '/' || pathname.startsWith('/links') || pathname.startsWith('/health');
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

#### 5. 📋 Acceptance Criteria (AC)
- [ ] Direct unauthenticated navigation to `/`, `/links`, or `/health` redirects to `/login`.
- [ ] Authenticated visits to `/login` redirect to `/`.

#### 6. ✅ Definition of Done (DoD) & Verification Plan
- [ ] Verify redirects in browser and unit test.
- [ ] `pnpm build` passes.

---

## 🟠 PRIORITY P1 — HIGH TICKETS (CURRENT SPRINT)

---

---
*Back to [Ticket Index](../README.md)*
