# [TL-UI-07] Clean Guest ID Cookie After Claim & Remove Artificial Redirect Lag

**Status:** ✅ Done  
**Ticket ID:** `TL-UI-07`

- **Component:** `@tiny-link/client`
- **Details:** Call `clearGuestId()` upon claiming and remove `setTimeout(..., 800)` in `RedirectHandler.tsx`.

---

_Back to [Ticket Index](../README.md)_
