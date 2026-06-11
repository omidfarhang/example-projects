# Playground (live demos & labs)

Static live demos and interactive labs for omid.dev, published at **[playground.omid.dev](https://playground.omid.dev)**.

## URL layout

| Path | Purpose |
| --- | --- |
| `/` | Playground home (examples + labs) |
| `/examples/<slug>/` | Article companion demos |
| `/labs/<slug>/` | Standalone interactive labs |

## Local build

```bash
# Full site (all examples + labs)
npm run build:playground

# Labs only
npm run build:playground:labs

# Single target (fast iteration)
npm run build:playground -- --only microbiome-sandbox
npm run build:playground:one microbiome-sandbox
```

### CLI flags

| Flag / env | Use |
| --- | --- |
| `--only <slug>` | Build one target (+ landing/sitemap) |
| `--category labs` | Build all labs only |
| `--exclude <slug>` | Skip a known-heavy demo |
| `--no-cache` | Skip lockfile-hash output cache |
| `PLAYGROUND_AFFECTED=1` | Git-diff since merge-base — rebuild only changed projects |
| `PLAYGROUND_ALLOW_SKIP=1` | Local debugging — continue on failure (never in production) |

Output cache: `playground/.build-cache/` restores unchanged targets between builds.

Output: `playground/dist/`

Preview locally:

```bash
npx serve playground/dist
```

## Deploy

**Production path:** GitHub Actions matrix build → assemble `playground/dist/` → Wrangler `pages deploy`.

See [`.github/workflows/playground-deploy.yml`](../.github/workflows/playground-deploy.yml) and [`wrangler.toml`](../wrangler.toml).

Required GitHub secrets:

| Secret | Purpose |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Pages deploy token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account |

**Legacy fallback:** Cloudflare Pages native git build still works with:

| Setting | Value |
| --- | --- |
| Root directory | `/` |
| Build command | `node playground/scripts/cloudflare-build.mjs` |
| Build output directory | `playground/dist` |
| Production branch | `master` |

Disable the native git hook once the GitHub Actions workflow is verified.

## Manifest

Targets are listed in [`manifest.json`](manifest.json):

- `categories.examples` — article companions (backward-compatible with top-level `demos`)
- `categories.labs` — standalone labs
- `build.concurrency` / `build.cacheDir` — orchestrator settings

Each entry: `slug`, `projectDir`, `type`, optional `tier: "heavy"`, `kind: "lab"` for labs.

Companion frame variants:

- **Examples:** “Companion demo” bar with article CTA
- **Labs:** “Playground lab” bar with Source code + Tech blog + All labs

## Adding a lab

1. Create project under `playground/labs/<slug>/` (Vite recommended).
2. Add entry to `manifest.json` → `categories.labs`.
3. Run `npm run build:playground -- --only <slug>`.
4. Link from blog posts with deep-link query params.

## Adding an example

1. Add an entry to `manifest.json` with a unique `slug` and `type`.
2. Implement or extend a builder in `scripts/lib/builders.mjs` if needed.
3. Run `npm run build:playground` locally and verify `/examples/<slug>/`.
