### 🟣 Phase 4: Enhancements (The Extra Miles)

**Status:** ✅ Done

#### 🎯 Goal

Add differentiating features on top of the core shortener to stand out in a portfolio context.

#### 📋 Checklist

- [x] **Self-destruct links**: Links that expire after N clicks or X time.
- [x] **Password Protection**: Require a password to access specific links.
- [x] **Geo-analytics**: Parse IP addresses for Country/City data (using lightweight libs or free APIs).
- [x] **Simple Dashboard**: A minimal static HTML/JS page for link management and click charts (Chart.js).

#### ✅ Definition of Done

- [x] All checklist items above are complete and merged to `main`.
- [x] Self-destruct links stop resolving after their click-count or time limit is reached (both limit types verified).
- [x] Password-protected links reject access without the correct password and succeed with it.
- [x] Geo data (country/city) appears on the stats endpoint for test requests.
- [x] The simple dashboard renders the link list and a Chart.js chart with no console errors.
