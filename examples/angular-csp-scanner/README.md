# Angular CSP Scanner

Companion for [Content Security Policy (CSP) and Angular: practical patterns](https://omid.dev/2026/07/15/csp-and-angular-practical-patterns/).

A small, dependency-free Node utility that walks an Angular workspace and reports common CSP footguns:

- missing `autoCsp` / nonce hints in `angular.json` / `index.html`
- inline event handlers (`onclick=`) and `javascript:` URLs in templates
- `eval` / `new Function` / string timers in TypeScript
- `bypassSecurityTrust*` usage (Trusted Types `angular#unsafe-bypass`)
- inline `<script>` / `<style>` in `index.html`
- serve headers that still rely on `unsafe-inline` / `unsafe-eval`

Also includes sample **nginx**, **Apache**, and **Cloudflare** CSP header snippets under [`samples/`](./samples/).

**Source only** — CLI tool, not a playground demo.

## Run

Requires Node.js 20+.

```bash
cd examples/angular-csp-scanner
npm start -- ./fixtures/sample-app
```

Scan your own app:

```bash
npm start -- /path/to/your/angular/workspace
```

Exit code `1` when any **error**-severity finding is present (useful in CI).

## Fixture

[`fixtures/sample-app`](./fixtures/sample-app) is intentionally messy so you can see every rule fire. It is not a runnable Angular application.

## Layout

```
bin/csp-scan.mjs       # CLI entry
src/scan.mjs           # workspace walk
src/rules.mjs          # pattern detectors
src/report.mjs         # terminal report
fixtures/sample-app/   # demo findings
samples/               # nginx / Apache / Cloudflare snippets
```
