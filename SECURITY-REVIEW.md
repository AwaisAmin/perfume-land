# Security review — 2026-09-20

Scope: local source, tracked files, dependency audit, browser cart storage and Next.js response configuration. No live Hostinger deployment or account was available for inspection. This is not a penetration-test certification.

## Findings and changes

- `npm audit` reported zero known vulnerabilities at review time. This does not guarantee the absence of undisclosed vulnerabilities.
- The source scan found no obvious embedded credentials, raw HTML injection APIs, or public product-editing endpoints. Environment and private-key files are ignored by Git.
- Added CSP, anti-framing, MIME-sniffing protection, referrer and browser-permission headers; disabled the framework identification header.
- Restored carts now validate shape and quantities, ignore unknown products, merge duplicates, and use catalog titles, prices and images instead of trusting browser storage. Quantities are bounded to 99. Browser-side checks are not payment security: any future checkout must validate prices and stock on a trusted service.
- Contact and newsletter forms have no delivery service. Removed false success confirmations; these forms still do not send or store customer submissions.

## Deployment requirements and remaining limits

- Enable HTTPS and HTTP-to-HTTPS redirects on the final Hostinger domain. Enable HSTS only after HTTPS is verified. These hosting settings have not been verified here.
- Next.js `headers()` applies when serving with Next.js. A future static export requires equivalent HTTP headers in Hostinger configuration; copying HTML alone does not preserve them.
- CSP permits inline hydration scripts and inline styles for static Next.js pages and animation compatibility. It blocks script event attributes, plugins, framing and unlisted external resource hosts, but is not a strict nonce/hash policy and does not eliminate inline-script XSS risk.
- The flag image service receives image requests; other product photography is local.
- No admin panel currently exists. Any future local editor must bind to loopback, validate request origin and product input, restrict file paths/uploads, and remain outside the public deployment. Do not place passwords or private API keys in browser code or `NEXT_PUBLIC_*` variables.
- Protect the hosting account with MFA, publish only deployment artifacts, retain backups, and rerun the dependency audit before releases.

References: [Next.js CSP](https://nextjs.org/docs/app/guides/content-security-policy), [Next.js headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers), [MDN frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors).
