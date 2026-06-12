# Bio-Dynamics: Full-Body Microbiome Sandbox

Interactive 3D educational lab at [playground.omid.dev/labs/microbiome-sandbox/](https://playground.omid.dev/labs/microbiome-sandbox/).

Rotate a low-poly body map, fly into tissue cross-sections, and run deterministic probiotic scenarios linked to [omid.dev](https://omid.dev) health articles. The simulation models barrier integrity, inflammation, pH, moisture, and microbe competition across seven body regions.

**Educational model — not medical advice.**

## Documentation

Full documentation lives in **[docs/README.md](docs/README.md)**:

- [Overview](docs/overview.md) — purpose, audience, learning goals
- [User guide](docs/user-guide.md) — how to use the lab
- [Scenarios](docs/scenarios.md) — preset narratives and exploration paths
- [Domain reference](docs/domain/) — regions, biotics, environment, actions
- [Simulation spec](docs/simulation/) — engine model, dynamics, data types
- [Architecture](docs/architecture/) — code structure, 3D, UI
- [Development](docs/development/) — setup, build, extending
- [Roadmap](docs/roadmap.md) — known gaps and future improvements
- [Changelog](CHANGELOG.md) — shipped changes

## Quick start

```bash
cd labs/microbiome-sandbox
npm install
npm run dev
```

Build via playground orchestrator (from repository root):

```bash
npm run build:playground -- --only microbiome-sandbox
```

## Linked articles

- [How Probiotics Help with Allergies](https://omid.dev/2024/09/10/how-probiotics-help-with-allergies/)
- [Probiotics Through the Ages](https://omid.dev/2024/09/10/probiotics-through-the-ages/)
- [How Probiotics Help with Candidiasis](https://omid.dev/2024/09/10/how-probiotics-help-with-candidiasis/)
- [Unlocking Prebiotics, Probiotics, and Postbiotics](https://omid.dev/2024/09/10/prebiotics-probiotics-postbiotics/)
