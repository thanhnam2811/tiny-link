# [TL-BE-04] Fix Analytics Queue Poison Pill & Batch Rollback Loop

**Status:** ✅ Done  
**Ticket ID:** `TL-BE-04`

- **Type:** `Bug`
- **Priority:** `P1 - High`
- **Component:** `@tiny-link/server`
- **Affected Files:**
    - `packages/server/src/modules/analytics/analytics_manager.ts:112`

#### 1. 📌 Context & Problem

`AnalyticsManager` batches click events in memory and flushes them to PostgreSQL every 30 seconds via a Prisma transaction.

#### 2. 🔍 Root Cause Analysis (RCA)

Inside `processBatch`, `tx.link.update({ where: { id: linkId } })` is executed. If a link was deleted while clicks were queued in memory, Prisma throws `P2025 (RecordNotFound)`. The transaction rolls back, `flush()` catches the error and pushes the entire batch back onto the queue. This repeats indefinitely every 30s (poison pill), locking the analytics queue.

#### 3. 💥 Impact

Total loss of click tracking updates and unbounded memory growth from unflushable batches.

#### 4. 🛠️ Proposed Solution & Technical Steps

Switch from `tx.link.update` to `tx.link.updateMany` (which safely ignores non-existent IDs without throwing `P2025`):

```diff
  for (const [linkId, count] of Object.entries(aggregation)) {
-     await tx.link.update({
-         where: { id: linkId },
-         data: { clicksCount: { increment: count } },
-     });
+     await tx.link.updateMany({
+         where: { id: linkId },
+         data: { clicksCount: { increment: count } },
+     });
  }
```

#### 5. 📋 Acceptance Criteria (AC)

- [x] Deleting a link while clicks are queued in memory flushes successfully without rolling back valid click counts.

#### 6. ✅ Definition of Done (DoD) & Verification Plan

- [x] Add unit test in `packages/server/tests/analytics.test.ts` for orphaned link click flushing.
- [x] `pnpm test` passes.

---

---

_Back to [Ticket Index](../README.md)_
