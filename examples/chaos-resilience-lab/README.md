# Chaos Resilience Lab

Companion project for:

- [Chaos Engineering for Backend and Infrastructure](https://omid.dev/2024/06/06/chaos-engineering/)
- [Chaos Engineering for Frontend Applications](https://omid.dev/2024/07/01/chaos-engineering-in-frontend-development/)

Side-by-side checkout demo: inject a fault, click Pay, and compare fragile vs resilient UI behavior.

**Live demo:** https://playground.omid.dev/examples/chaos-resilience-lab/

## Run locally

```bash
npm start
```

Open http://localhost:3456 (serves `public/index.html`).

## Try it

1. Click **Slow payment (3s)** — Pay on both panels. Resilient shows a spinner; fragile goes silent.
2. Click **Payment 503** — Resilient shows a retry message; fragile throws an unhandled error.
3. Click **Empty response** — Fragile treats it as success with `$0.00`; resilient refuses to confirm.
4. Click **Corrupt cart cache** — Fragile renders broken data; resilient resets to a safe cart.
5. Click **Double-click Pay** — Double-click Pay on fragile quickly for duplicate charges; resilient disables the button.

## Structure

```
public/
  app.js                 # Cart model + simulated payment API
  client.playground.js   # UI wiring (copied to client.js in playground build)
  index.playground.html  # Playground entry (becomes index.html in deploy)
  index.html             # Local dev entry
  styles.css
```

No backend required — the live playground runs entirely in the browser.

## Blog posts

- https://omid.dev/2024/06/06/chaos-engineering/
- https://omid.dev/2024/07/01/chaos-engineering-in-frontend-development/
