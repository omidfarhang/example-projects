# Cloudflare (Transform Rules / Response Header Transform)

Use a **Response Header Transform Rule** (or Workers) so the nonce is minted at the edge — not baked into a cached `index.html` at origin.

## Report-only (week 1)

Header name: `Content-Security-Policy-Report-Only`

```
default-src 'self';
script-src 'self' 'nonce-{{nonce}}' 'strict-dynamic';
style-src 'self' 'nonce-{{nonce}}';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self' https://api.example.com;
frame-ancestors 'none';
base-uri 'self';
object-src 'none';
report-uri https://example.report-uri.com/r/d/csp/reportOnly
```

Replace `{{nonce}}` with a Worker-generated value, and rewrite the HTML `<app-root ngCspNonce="…">` (or script/style tags) to the same value before the response leaves the edge.

## Enforce later

Same policy, header name `Content-Security-Policy`. Keep `report-uri` / `report-to` so regressions still show up.

## Angular side

- Prefer `autoCsp: true` in `angular.json`, **or**
- Edge injects `ngCspNonce` on `<app-root>`, **or**
- Runtime `CSP_NONCE` provider (avoid if you also inline critical CSS).

Do not put long-lived HTML with a fixed nonce behind Cloudflare cache. Cache hashed JS/CSS assets aggressively; keep document HTML short-TTL or bypass cache when nonces are rewritten per request.
