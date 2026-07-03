### 🟡 Phase 2: Reliability & Performance (The Middle-level Touch)

**Status:** ✅ Done

#### 🎯 Goal

Ensure system stability and data integrity under real traffic, not just the happy path.

#### 📋 Checklist

- [x] Implement **Memory Queue**: Temporary storage for click events.
- [x] Implement **Batch Insert**: Automatically flush data from Queue to DB periodically.
- [x] Integrate **Rate Limiter**: Use `fastify-rate-limit` with Redis store for distributed limiting.
- [x] Implement **Redis Caching**: Negative caching, Promise Coalescing, Ghost Click protection.
- [x] **Error Handling**: Professional handling for expired or non-existent links.

#### ✅ Definition of Done

- [x] All checklist items above are complete and merged to `main`.
- [x] Click events queue in memory and flush to Postgres via batch insert with no data loss under normal load.
- [x] Redis-backed rate limiter blocks abusive traffic consistently across multiple server instances.
- [x] Negative caching prevents repeated DB hits for missing codes; promise coalescing (singleflight) prevents cache stampede under concurrent requests for the same code.
- [x] Expired/non-existent links return the correct HTTP status (404/410) without leaking internals in logs or responses.
