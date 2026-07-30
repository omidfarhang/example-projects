# Modern Auth for Angular

Companion for [Modern Auth Patterns for Angular Frontends](https://omid.dev/2026/07/31/modern-auth-patterns-for-angular-frontends/).

Demonstrates the secure browser shape:

- mock **BFF** that owns tokens and sets **HttpOnly** session cookies
- Angular **never** stores JWTs in `localStorage` / `sessionStorage`
- CSRF header on mutating requests
- functional **auth interceptor** (401 → refresh → retry)
- **auth + role guards**, with server-side enforcement on `/api/*`

**Source only** — needs the local BFF, so it is not published as a playground demo.

## Run locally

Requires Node.js 24 (`nvm use` from the repo root).

```bash
cd examples/angular-modern-auth
npm install
npm start
```

This starts:

| Process | URL |
| --- | --- |
| BFF (`server/index.mjs`) | http://localhost:3001 |
| Angular (`ng serve` + proxy) | http://localhost:4200 |

Open http://localhost:4200

## Try this

1. Log in as **member** or **admin**.
2. DevTools → Application → Cookies: confirm `sid` is HttpOnly and Local Storage has no access token.
3. Open **Dashboard** and load `/api/profile`.
4. Click **Wait for access expiry + retry** — the interceptor calls `POST /bff/refresh` and retries.
5. Visit **Admin** as member (forbidden) vs admin (API succeeds).

## Layout

```
server/index.mjs          # teaching BFF (session + CSRF + API)
src/app/auth/             # service, interceptors, guards
src/app/pages/            # overview, login, dashboard, admin
proxy.conf.json           # /bff and /api → :3001
```

## Production mapping

Replace the mock login with a real IdP via the BFF (Auth0, Keycloak, Entra ID, etc.):

1. BFF runs authorization code + PKCE as a confidential client.
2. Tokens stay in a server session store (Redis, encrypted cookie store, …).
3. Browser keeps only the session cookie + CSRF defense.
4. Angular continues to call same-origin `/bff/*` and `/api/*` with `withCredentials`.
