# Playground (live demos)

Static live demos for browser-only companion projects, published at **[playground.omid.dev](https://playground.omid.dev)**.

## URL layout

| Path | Purpose |
| --- | --- |
| `/` | Playground home |
| `/examples/<slug>/` | Companion demo (first pass) |
| `/tools/`, `/benchmarks/`, `/labs/` | Reserved for future content |

## Local build

```bash
# From repository root
npm run build:playground
```

Output: `playground/dist/`

Preview locally:

```bash
npx serve playground/dist
```

## Cloudflare Pages

Connect this repository to a Cloudflare Pages project:

| Setting | Value |
| --- | --- |
| Root directory | `/` (repository root) |
| Build command | `node playground/scripts/cloudflare-build.mjs` |
| Build output directory | `playground/dist` |
| Production branch | `master` (or your default) |

### Environment variables

| Variable | Value | Notes |
| --- | --- | --- |
| `NODE_VERSION` | `20` | Recommended |
| `SKIP_DEPENDENCY_INSTALL` | `1` | Optional — root has no app dependencies; the build script installs per demo |

No Firebase or API secrets are required for the current demo set.

### Custom domain

Attach `playground.omid.dev` to the Pages project in the Cloudflare dashboard.

## Manifest

Demos are listed in [`manifest.json`](manifest.json). The build script reads slug, project path, build type, article metadata (`articleUrl`, `articleTitle`, `sourcePath`), and repo settings from there.

After each demo build, the script injects a slim **companion bar** into `index.html` with links back to the article, source folder, and playground home. Shared styling lives in `scripts/lib/theme.mjs` and is emitted to `dist/assets/companion-frame.css`.

SEO, social cards, structured data, Matomo tracking, `robots.txt`, `sitemap.xml`, and the playground OpenGraph image are generated from `scripts/lib/seo.mjs`.

## Adding a demo

1. Add an entry to `manifest.json` with a unique `slug` and `type`.
2. Implement or extend a builder in `scripts/lib/builders.mjs` if the project needs a custom build path.
3. Run `npm run build:playground` locally and verify `/examples/<slug>/`.
4. Update the project README and the matching omid.dev blog post with live-demo links.
