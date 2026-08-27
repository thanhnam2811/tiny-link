# [TL-BE-08] Optimize Prisma Indexes & Configure Postgres Connection Pool

**Status:** ⏳ Open  
**Ticket ID:** `TL-BE-08`  

- **Component:** `@tiny-link/db`
- **Details:** Drop redundant `@@index([shortCode])` on `Link`, add `@@index([clickedAt])` on `Click`, and configure pool parameters (`max: 10, idleTimeoutMillis: 30000`).

---
*Back to [Ticket Index](../README.md)*
