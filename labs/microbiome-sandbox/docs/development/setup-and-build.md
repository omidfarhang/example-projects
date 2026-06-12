# Setup and Build

Local development, production build, playground deployment, and URL configuration.

---

## Requirements

| Requirement | Notes |
| --- | --- |
| Node.js | For npm install and Vite (LTS recommended) |
| Modern browser | WebGL support required |
| npm | Comes with Node.js |

No backend server, database, or native dependencies.

---

## Local development

```bash
cd labs/microbiome-sandbox
npm install
npm run dev
```

Vite dev server starts (default `http://localhost:5173`) with hot module replacement.

### npm scripts

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `vite` | Development server |
| `build` | `vite build` | Production build → `dist/` |
| `preview` | `vite preview` | Preview production build locally |
| `docs:serve` | `mkdocs serve` | Documentation site with live reload |
| `docs:build` | `mkdocs build` | Static docs → `site/` |

---

## Production build (standalone)

```bash
npm run build
npm run preview
```

Output: `dist/index.html` + hashed assets in `dist/assets/`.

---

## Playground deployment

Bio-Dynamics is published via the [example-projects playground](https://playground.omid.dev) at:

```text
/labs/microbiome-sandbox/
```

### Build from repository root

```bash
cd example-projects
npm run build:playground -- --only microbiome-sandbox
```

Alternative:

```bash
npm run build:playground:one microbiome-sandbox
```

Build all labs:

```bash
npm run build:playground:labs
```

Output: `playground/dist/labs/microbiome-sandbox/`

### PLAYGROUND_BASE

[`vite.config.ts`](../vite.config.ts) sets Vite `base` from environment:

```typescript
const base = process.env.PLAYGROUND_BASE ?? '/';
```

The playground orchestrator sets `PLAYGROUND_BASE=/labs/microbiome-sandbox/` during build so asset paths resolve correctly under the subpath.

Local standalone dev uses `base = '/'`.

### Preview full playground

```bash
cd example-projects
npx serve playground/dist
```

---

## URL parameters

Parsed on load by [`parseUrlState()`](../src/data/presets.ts) and [`parseLabFromUrl()`](../src/state/labState.ts):

| Parameter | Values | Default |
| --- | --- | --- |
| `preset` | `allergy`, `candida`, `lifecycle` | `allergy` |
| `region` | `ear`, `scalp`, `nose`, `oral`, `skin`, `vaginal`, `gut` | Preset's `defaultRegion` |
| `context` | `lifestage` (allergy preset) | — |
| `lab` | Full checkpoint (share link) | — |
| `integrity`, `inflammation`, `tick` | Human-readable hints alongside `lab` | — |

Examples:

```text
http://localhost:5173/?preset=candida&region=oral
https://playground.omid.dev/labs/microbiome-sandbox/?preset=lifecycle&region=gut
https://playground.omid.dev/labs/microbiome-sandbox/?preset=allergy&context=lifestage
```

---

## Project configuration

| File | Purpose |
| --- | --- |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript strict mode, ES2022 |
| `vite.config.ts` | Base path, build target |
| `index.html` | HTML shell, mounts `#app` |

---

## Manifest registration

Listed in [`playground/manifest.json`](../../../playground/manifest.json):

- `slug`: `microbiome-sandbox`
- `type`: `vite`
- `kind`: `lab`

---

## Troubleshooting

| Issue | Check |
| --- | --- |
| Blank canvas | WebGL enabled; browser console for errors |
| Wrong asset paths in production | `PLAYGROUND_BASE` set during playground build |
| Actions have no effect | Ensure micro view active; action must be in region config |
| Port in use | Vite picks next port or use `--port` |

---

## Related docs

- [Extending the lab](extending.md)
- [Documentation site](docs-site.md)
- [System overview](../architecture/system-overview.md)
- [User guide](../user-guide.md)
- [CHANGELOG](../../CHANGELOG.md)
