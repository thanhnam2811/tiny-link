# [TL-BE-05] Invalidate Redis Cache on Admin Link Status Update and Deletion

**Status:** ✅ Done  
**Ticket ID:** `TL-BE-05`

- **Component:** `@tiny-link/server`
- **Files:** `packages/server/src/modules/admin/admin.routes.ts:201-276`
- **RCA:** Admin status changes and deletions do not evict `link:${shortCode}` from Redis, serving disabled links up to 1 hour.
- **Fix:** Call `await server.redis.del(`link:${link.shortCode}`)` on status updates and deletion.

#### 📋 Acceptance Criteria (AC)

- [x] Updating link status via Admin PATCH `/links/:id/status` immediately invalidates `link:${shortCode}` in Redis.
- [x] Deleting link via Admin DELETE `/links/:id` immediately invalidates `link:${shortCode}` in Redis.

#### ✅ Definition of Done (DoD)

- [x] Integration tests in `admin-cache-invalidation.test.ts` pass with 100% assertions.

---

---

_Back to [Ticket Index](../README.md)_
