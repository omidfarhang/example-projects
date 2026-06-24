# Chaos Resilience Lab

Companion project for:

- [Chaos Engineering for Backend and Infrastructure](https://omid.dev/2024/06/06/chaos-engineering/)
- [Chaos Engineering for Frontend Applications](https://omid.dev/2024/07/01/chaos-engineering-in-frontend-development/)

Side-by-side checkout demo: inject a fault, click Pay, and compare fragile vs resilient UI behavior.

**Live demo:** https://playground.omid.dev/examples/chaos-resilience-lab/

## Run locally (playground preview)

No install required — uses an in-browser fetch shim for `/api/payment`:

```bash
npm start
```

Open http://localhost:3456

## Run with MSW (frontend post pattern)

Clone, install, and start the Vite dev server with MSW intercepting `POST /api/payment`:

```bash
npm install
npm run dev
```

Open http://localhost:5173/index.dev.html

MSW handlers live in [`mocks/handlers.js`](mocks/handlers.js) — the same fault contract as the interactive demo.

## Run Cypress tests

Requires `npm install` first. Starts the MSW dev server, then runs resilience specs on the **resilient** checkout panel:

```bash
npm run test:e2e
```

Interactive runner:

```bash
npm run test:e2e:open
```

Specs:

| File | What it asserts |
| --- | --- |
| `cypress/e2e/resilient-slow.cy.js` | Slow payment shows spinner, then confirms |
| `cypress/e2e/resilient-503.cy.js` | 503 shows retry banner, no crash |
| `cypress/e2e/resilient-empty-body.cy.js` | Empty body does not false-confirm payment |
| `cypress/e2e/network-chaos-intercept.cy.js` | `cy.intercept` + `setDelay` (article network-chaos sample) |

## Try it

1. Click **Slow payment (3s)** — Pay on both panels. Resilient shows a spinner; fragile goes silent.
2. Click **Payment 503** — Resilient shows a retry message; fragile throws an unhandled error.
3. Click **Empty response** — Fragile treats it as success with `$0.00`; resilient refuses to confirm.
4. Click **Corrupt cart cache** — Fragile renders broken data; resilient resets to a safe cart.
5. Click **Double-click Pay** — Double-click Pay on fragile quickly for duplicate charges; resilient disables the button.
6. Click **Reset checkout** — Clears Pay results and keeps the current fault so you can run the experiment again.

## Backend-style faults (docker-compose)

Optional stack for readers of the backend chaos post — real HTTP services without Kubernetes:

```bash
npm run docker:up
sh docker/setup-toxiproxy.sh
```

- Checkout API: http://localhost:3000/api/payment
- Toxiproxy admin: http://localhost:8474
- Payment API (direct): internal only; reached via Toxiproxy

Example — add 3s latency on the payment route:

```bash
curl -X POST http://localhost:8474/proxies/payment/toxics \
  -H 'Content-Type: application/json' \
  -d '{"name":"latency","type":"latency","attributes":{"latency":3000,"jitter":0}}'
```

Stop:

```bash
npm run docker:down
```

## Structure

```
lib/
  payment.js             # Payment fault simulation (source of truth)
public/
  app.js                 # Cart model + postPayment
  payment-core.js        # Copy of lib/payment.js for static/playground serve
  fetch-shim.js          # Static/playground fetch handler (no MSW)
  dev-bootstrap.js       # MSW worker startup for npm run dev
  client.playground.js   # UI wiring (copied to client.js in playground build)
  index.html             # Local static entry (fetch shim)
  index.dev.html         # MSW dev entry
  index.playground.html  # Playground entry (becomes index.html in deploy)
  mockServiceWorker.js   # MSW service worker (generated on npm install)
  styles.css
mocks/
  handlers.js            # MSW POST /api/payment handlers (imports lib/payment.js)
  browser.js             # MSW setupWorker
cypress/
  e2e/                   # Resilience specs
docker/
  checkout-api/          # Thin BFF proxying to payment
  payment-api/           # Fault-aware payment service
docker-compose.yml       # checkout + payment + Toxiproxy
```

The live playground runs entirely in the browser with the fetch shim — no backend required.

## Blog posts

- https://omid.dev/2024/06/06/chaos-engineering/
- https://omid.dev/2024/07/01/chaos-engineering-in-frontend-development/
