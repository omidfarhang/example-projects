# Example Projects

Runnable companion projects for articles on [omid.dev](https://omid.dev).

This repository exists for the examples that are too large for a blog post but still small enough to understand in one sitting. Article companions live under `examples/`; interactive labs live under `labs/`. Each folder is self-contained with its own dependencies, README, and run instructions.

## Live Demos

The catalog of labs, live companions, and clone-only projects lives on **[omid.dev/playground/](https://omid.dev/playground/)**.

Browser builds are hosted at **[playground.omid.dev](https://playground.omid.dev)** under `/examples/<slug>/` and `/labs/<slug>/` (the playground root redirects to the catalog). Source stays in this repo — clone a project folder to run locally.

See [playground/README.md](./playground/README.md) for the build and deploy setup. Demos that need Firebase, a local API server, native Linux binaries, or notebooks are **source-only** until they have a static browser build.

## Start Here

Pick the example that matches the article or topic you are reading, then install and run it from that folder:

```bash
git clone https://github.com/omidfarhang/example-projects.git
cd example-projects/examples/angular-web-audio-visualizer
npm install
npm start
```

Most frontend examples are Angular apps and open on `http://localhost:4200`. Some projects include an API server, Firebase setup, WebAssembly build step, or multiple apps. Check the README inside the project folder before running commands.

## What You Can Explore

| Area | Projects |
| --- | --- |
| Angular application patterns | [`examples/angular-patterns-and-di`](./examples/angular-patterns-and-di/), [`examples/angular-dynamic-form-debugging`](./examples/angular-dynamic-form-debugging/), [`examples/angular-shared-library-workspace`](./examples/angular-shared-library-workspace/), [`examples/angular-modern-auth`](./examples/angular-modern-auth/), [`examples/angular-csp-scanner`](./examples/angular-csp-scanner/), [`examples/angular-router-resources`](./examples/angular-router-resources/) |
| Browser performance | [`examples/angular-web-workers-offscreencanvas`](./examples/angular-web-workers-offscreencanvas/), [`examples/angular-web-audio-visualizer`](./examples/angular-web-audio-visualizer/), [`examples/rust-wasm-performance-demo`](./examples/rust-wasm-performance-demo/) |
| Linux desktop and kernel-adjacent tooling | [`examples/latency-lens`](./examples/latency-lens/) |
| APIs and data fetching | [`examples/angular-graphql-apollo`](./examples/angular-graphql-apollo/), [`examples/graphql-express-angular-migration`](./examples/graphql-express-angular-migration/) |
| Real-time applications | [`examples/angular-collaborative-editor-firebase-webrtc`](./examples/angular-collaborative-editor-firebase-webrtc/), [`examples/realtime-frontend-patterns`](./examples/realtime-frontend-patterns/) |
| Resilience and fault tolerance | [`examples/chaos-resilience-lab`](./examples/chaos-resilience-lab/) |
| Micro frontends and web components | [`examples/qwik-angular-react-rust`](./examples/qwik-angular-react-rust/), [`examples/angular-stencil-web-components`](./examples/angular-stencil-web-components/) |
| TypeScript and state management | [`examples/typescript-advanced-types`](./examples/typescript-advanced-types/), [`examples/react-recoil-advanced-state`](./examples/react-recoil-advanced-state/) |
| Tooling and migration | [`examples/angular-custom-schematics`](./examples/angular-custom-schematics/), [`examples/bootstrap-to-tailwind-migration`](./examples/bootstrap-to-tailwind-migration/), [`examples/jupyter-blog-starter`](./examples/jupyter-blog-starter/) |

## Project Index

Full catalog (live demos, labs, clone-only, article links): **[omid.dev/playground/](https://omid.dev/playground/)**.

Machine-readable list for builds: [`playground/manifest.json`](./playground/manifest.json). Browse folders under [`examples/`](./examples/) and [`labs/`](./labs/) for source.

## Common Requirements

- Node.js 24+ and npm for most JavaScript and Angular examples. If you use `nvm`, run `nvm use` from the repository root.
- Angular CLI 20+ for Angular projects:

```bash
npm install -g @angular/cli@20
```

- Rust, `wasm-pack`, Python, `uv`, or Firebase access only for projects that explicitly mention them in their README.
- Rust toolchain for [`examples/latency-lens`](./examples/latency-lens/) (no root or eBPF required).

## Project-Specific Setup

- Live demos are built with `npm run build:playground` and deployed by GitHub Actions to Cloudflare Pages. See [playground/README.md](./playground/README.md).
- `angular-collaborative-editor-firebase-webrtc` needs a Firebase project with Anonymous Authentication and Cloud Firestore enabled.
- `angular-graphql-apollo` uses an in-browser GraphQL mock on the live playground; clone the repo and start the `server/` app for the full HTTP + Apollo setup. 
- `realtime-frontend-patterns` uses simulated WebSocket and SSE on the live playground; clone the repo and run `npm start` for the Express server. 
- `chaos-resilience-lab` runs entirely in the browser on the live playground (`npm start`); use `npm run dev` for MSW and `npm run test:e2e` for Cypress tests.
- `graphql-express-angular-migration` includes a local API server — start the `server/` app before the Angular app.
- `angular-stencil-web-components` has two parts. Build the Stencil component first, then run the Angular app.
- `qwik-angular-react-rust` is a multi-app demo. Run the Qwik shell, Angular app, and React app in separate terminals.
- `jupyter-blog-starter` supports either `uv sync` or a standard Python virtual environment.
- `rust-wasm-performance-demo` requires `wasm-pack build --target web --out-dir web/pkg` before serving the browser demo.
- `latency-lens` is a native Linux binary. Run `cargo run -- --once` from the project folder for a one-shot snapshot.
- `angular-modern-auth` starts a teaching BFF on `:3001` and Angular on `:4200` via `npm start` (proxy for `/bff` and `/api`).
- `angular-csp-scanner` is a dependency-free CLI: `npm start -- /path/to/angular/workspace` (try `npm run scan:fixture` first).

## Repository Shape

```text
example-projects/
  examples/              # article companion projects
    project-name/
      README.md
      package.json
      src/
  labs/                    # standalone interactive labs
    lab-name/
  playground/              # build + deploy tooling only
    manifest.json
    scripts/
    dist/
```

Multi-part examples keep related apps together:

```text
example-projects/
  examples/angular-graphql-apollo/
    server/
    src/
```

## Maintenance Guidelines

- Keep examples aligned with the article they support.
- Prefer clear tutorial code over clever abstractions.
- Keep generated output out of git, including `node_modules/`, `dist/`, Angular cache folders, Rust `target/`, and local notebook artifacts.
- Document required secrets or local configuration with placeholder values or `.env.example`.
- Add new examples as kebab-case folders under `examples/` named after the post or the main demo idea.

## Contributing

Issues and pull requests are welcome when an example is broken, outdated, or no longer matches the related article. See [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## License

This repository is licensed under the [MIT License](./LICENSE).
