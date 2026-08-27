# [TL-BE-05] Invalidate Redis Cache on Admin Link Status Update and Deletion

**Status:** ⏳ Open  
**Ticket ID:** `TL-BE-05`  

- **Component:** `@tiny-link/server`
- **Files:** `packages/server/src/modules/admin/admin.routes.ts:201-276`
- **RCA:** Admin status changes and deletions do not evict `link:${shortCode}` from Redis, serving disabled links up to 1 hour.
- **Fix:** Call `await server.redis.del(`link:${link.shortCode}`)` on status updates and deletion.

---

---
*Back to [Ticket Index](../README.md)*
