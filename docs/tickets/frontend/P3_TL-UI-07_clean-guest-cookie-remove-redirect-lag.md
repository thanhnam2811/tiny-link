# [TL-UI-07] Clean Guest ID Cookie After Claim & Remove Artificial Redirect Lag

**Status:** ⏳ Open  
**Ticket ID:** `TL-UI-07`  

- **Component:** `@tiny-link/client`
- **Details:** Call `clearGuestId()` upon claiming and remove `setTimeout(..., 800)` in `RedirectHandler.tsx`.

---
*Back to [Ticket Index](../README.md)*
