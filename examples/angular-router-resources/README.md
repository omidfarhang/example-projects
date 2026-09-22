# Angular Router Resources (Trip Desk)

> **Developer Preview** — Router Resources ship as a Developer Preview in Angular 22.2. APIs can still change. This companion pins `@angular/*` to `22.2.0-rc.0` (public `withRouterResources` / `nonBlocking`; early `22.2.0-next.*` builds exposed the same symbols as `ɵ` private exports).

Companion for the Trip Desk demo: route data as a parallel signal/`resource` graph instead of a resolver waterfall.

**Live demo:** https://playground.omid.dev/examples/angular-router-resources/ (prebuilt on [playground.omid.dev](https://playground.omid.dev))

## Run

```bash
npm install
npm start
```

Open http://localhost:4200

## Routes

| Route | Mechanism | What you see |
| --- | --- | --- |
| `/waterfall/:id` | Three nested classic `ResolveFn`s (~1s each) | Route activates after ~3s; unwrapped inputs |
| `/resources/:id` | Route `resources:` map of three **blocking** resources | Route activates after ~1s; unwrapped inputs via `withComponentInputBinding` |
| `/resources-live/:id` | Same data as **non-blocking** (`nonBlocking(...)`) | Component receives `Resource<T>` inputs; template handles loading/error/`value()` |

Optional query `?fail=seat` (also `trip` / `passenger`):

- Blocking (`/resources/...`) — navigation cancels / errors; you stay off the detail screen
- Non-blocking (`/resources-live/...`) — route activates; seat card shows the error UI

## Try this

1. Open **Waterfall** — watch the timing readout climb past ~3s and note resolve order `trip → passenger → seats`.
2. Open **Resources** — same three payloads, ~1s (slowest wins; they start together).
3. Open **Live** — page appears immediately; cards flip from loading to data.
4. Use **Fail (block)** vs **Fail (live)** with `?fail=seat` to compare cancel vs in-template error.

## Blog post

https://omid.dev/2026/09/22/angular-router-resources-route-data-as-a-graph/
