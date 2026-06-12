# Bio-Dynamics Documentation

Documentation for the **Bio-Dynamics: Full-Body Microbiome Sandbox** interactive lab.

**Live demo:** [playground.omid.dev/labs/microbiome-sandbox/](https://playground.omid.dev/labs/microbiome-sandbox/)

**Source:** [`../src/`](../src/)

---

## Reading paths

### Curious user

Start here if you want to explore the lab without reading code.

1. [Overview](overview.md) — what the lab is and who it is for
2. [User guide](user-guide.md) — macro/micro views, dashboard, controls
3. [Scenarios](scenarios.md) — guided exploration paths per preset

### Educator

Use these when teaching microbiome concepts with the lab.

1. [Scenarios](scenarios.md) — preset narratives and suggested sequences
2. [Body regions](domain/regions.md) — tissue contexts and baselines
3. [Actions reference](domain/actions-reference.md) — every trigger and inoculation

### Developer improving the app

Use these when changing simulation behavior, adding regions, or closing documented gaps.

1. [Simulation model overview](simulation/model-overview.md)
2. [Simulation dynamics](simulation/dynamics.md)
3. [Data model](simulation/data-model.md)
4. [Assumptions and limits](simulation/assumptions-and-limits.md)
5. [System overview](architecture/system-overview.md)
6. [Extending the lab](development/extending.md)
7. [Roadmap](roadmap.md) — doc-driven improvement backlog

---

## Table of contents

### Product

| Document | Description |
| --- | --- |
| [overview.md](overview.md) | Vision, audience, learning goals, disclaimer |
| [user-guide.md](user-guide.md) | UI walkthrough: macro/micro, dashboard, controls |
| [scenarios.md](scenarios.md) | Presets, narratives, exploration paths |

### Domain reference

| Document | Description |
| --- | --- |
| [domain/regions.md](domain/regions.md) | Seven body regions: anatomy, baselines, geometry |
| [domain/biotics.md](domain/biotics.md) | Microbe taxonomy, strains, pre/pro/postbiotic lifecycle |
| [domain/environment.md](domain/environment.md) | Env sliders, region subsets, derived metrics |
| [domain/actions-reference.md](domain/actions-reference.md) | Exhaustive trigger and inoculation catalog |
| [domain/products.md](domain/products.md) | Supplements and fermented foods catalog |

### Simulation

| Document | Description |
| --- | --- |
| [simulation/model-overview.md](simulation/model-overview.md) | Engine design, tick loop, determinism |
| [simulation/dynamics.md](simulation/dynamics.md) | Growth, competition, conversion, emergent rules |
| [simulation/data-model.md](simulation/data-model.md) | Types, BiomeState, SimSnapshot contract |
| [simulation/assumptions-and-limits.md](simulation/assumptions-and-limits.md) | Scientific simplifications and non-goals |

### Architecture

| Document | Description |
| --- | --- |
| [architecture/system-overview.md](architecture/system-overview.md) | App orchestration, module graph, frame loop |
| [architecture/visualization.md](architecture/visualization.md) | Three.js body, tissue cross-sections, microbes |
| [architecture/ui-dashboard.md](architecture/ui-dashboard.md) | Dashboard layout, callbacks, conditional UI |

### Development

| Document | Description |
| --- | --- |
| [development/setup-and-build.md](development/setup-and-build.md) | Local dev, Vite, playground deploy |
| [development/extending.md](development/extending.md) | Adding regions, actions, presets |
| [roadmap.md](roadmap.md) | Known gaps and future app work |

---

## Source tree map

```text
src/
  main.ts                 Entry point
  app/App.ts              Orchestrator (engine + dashboard + scene)
  sim/engine.ts           Deterministic simulation
  sim/types.ts            Simulation types
  data/regions.ts         Region config, triggers, inoculations
  data/envVars.ts         Environment variable definitions
  data/presets.ts         Scenarios and URL parsing
  data/articles.ts        Blog article links
  ui/Dashboard.ts         HTML/CSS lab overlay
  scene/                  Three.js visualization
```
