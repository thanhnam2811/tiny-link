# [TL-SEC-02] Prevent Server-Side Request Forgery (SSRF) in Metadata Scraper

**Status:** ✅ Done  
**Ticket ID:** `TL-SEC-02`

- **Type:** `Security Vulnerability`
- **Priority:** `P1 - High`
- **Component:** `@tiny-link/server`
- **Affected Files:**
    - `packages/server/src/modules/link/metadata.scraper.ts:15-18`

#### 1. 📌 Context & Problem

When creating a short link, `scrapeUrlMetadata(originalUrl)` scrapes OpenGraph title, description, and image tags.

#### 2. 🔍 Root Cause Analysis (RCA)

`fetch(url)` executes without DNS resolution validation or IP blacklisting. An attacker can supply `http://127.0.0.1:3001/` or `http://169.254.169.254/latest/meta-data/` to scrape local server responses or cloud metadata.

#### 3. 💥 Impact

Cloud credential leakage (AWS/GCP IMDSv1), internal port scanning, or unauthorized intranet API probing.

#### 4. 🛠️ Proposed Solution & Technical Steps

Implement DNS pre-flight resolution and block all private IP subnets (RFC 1918, RFC 3927, loopback, IPv6 link-local):

```ts
import dns from 'node:dns/promises';
import net from 'node:net';

export function isPrivateIp(ip: string): boolean {
	if (net.isIPv4(ip)) {
		const [a, b] = ip.split('.').map(Number);
		return (
			a === 10 ||
			a === 127 ||
			(a === 172 && b >= 16 && b <= 31) ||
			(a === 192 && b === 168) ||
			(a === 169 && b === 254) ||
			a === 0
		);
	}
	return ip === '::1' || ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80');
}
```

#### 5. 📋 Acceptance Criteria (AC)

- [x] Shortening links targeting `http://127.0.0.1:3001`, `localhost`, or `http://169.254.169.254` skips scraping safely with null metadata.
- [x] Legitimate public URLs (`https://github.com`, `https://google.com`) fetch metadata normally.

#### 6. ✅ Definition of Done (DoD) & Verification Plan

- [x] Add unit tests for `isPrivateIp` and `scrapeUrlMetadata`.
- [x] `pnpm test` passes.

---

---

_Back to [Ticket Index](../README.md)_
