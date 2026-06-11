# Example Projects

Runnable companion projects for articles on [omid.dev](https://omid.dev).

This repository exists for the examples that are too large for a blog post but still small enough to understand in one sitting. Article companions live under `examples/`; interactive labs live under `labs/`. Each folder is self-contained with its own dependencies, README, and run instructions.

## Live Demos

Browser-only companion projects and interactive labs are published at **[playground.omid.dev](https://playground.omid.dev)** under `/examples/<slug>/` and `/labs/<slug>/`.

| Lab | Description |
| --- | --- |
| [Bio-Dynamics: Microbiome Sandbox](https://playground.omid.dev/labs/microbiome-sandbox/) | Full-body 3D microbiome simulator with blog-backed probiotic scenarios |

| Live demo | Project |
| --- | --- |
| [Angular Web Audio Visualizer](https://playground.omid.dev/examples/angular-web-audio-visualizer/) | [`examples/angular-web-audio-visualizer`](./examples/angular-web-audio-visualizer/) |
| [Web Workers & OffscreenCanvas](https://playground.omid.dev/examples/angular-web-workers-offscreencanvas/) | [`examples/angular-web-workers-offscreencanvas`](./examples/angular-web-workers-offscreencanvas/) |
| [Rust WASM Performance](https://playground.omid.dev/examples/rust-wasm-performance-demo/) | [`examples/rust-wasm-performance-demo`](./examples/rust-wasm-performance-demo/) |
| [Micro Frontends (Qwik + Angular + React)](https://playground.omid.dev/examples/qwik-angular-react-rust/) | [`examples/qwik-angular-react-rust`](./examples/qwik-angular-react-rust/) |
| [Stencil Web Components in Angular](https://playground.omid.dev/examples/angular-stencil-web-components/) | [`examples/angular-stencil-web-components`](./examples/angular-stencil-web-components/) |
| [Angular Dynamic Form Debugging](https://playground.omid.dev/examples/angular-dynamic-form-debugging/) | [`examples/angular-dynamic-form-debugging`](./examples/angular-dynamic-form-debugging/) |
| [Angular Patterns & DI](https://playground.omid.dev/examples/angular-patterns-and-di/) | [`examples/angular-patterns-and-di`](./examples/angular-patterns-and-di/) |
| [Angular Shared Library Workspace](https://playground.omid.dev/examples/angular-shared-library-workspace/) | [`examples/angular-shared-library-workspace`](./examples/angular-shared-library-workspace/) |
| [React Recoil Advanced State](https://playground.omid.dev/examples/react-recoil-advanced-state/) | [`examples/react-recoil-advanced-state`](./examples/react-recoil-advanced-state/) |
| [Bootstrap to Tailwind Migration](https://playground.omid.dev/examples/bootstrap-to-tailwind-migration/) | [`examples/bootstrap-to-tailwind-migration`](./examples/bootstrap-to-tailwind-migration/) |

Demos that need Firebase, a local API server, native Linux binaries, or other non-browser runtimes are **source-only** for now. See [playground/README.md](./playground/README.md) for the Cloudflare Pages build setup.

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
| Angular application patterns | [`examples/angular-patterns-and-di`](./examples/angular-patterns-and-di/), [`examples/angular-dynamic-form-debugging`](./examples/angular-dynamic-form-debugging/), [`examples/angular-shared-library-workspace`](./examples/angular-shared-library-workspace/) |
| Browser performance | [`examples/angular-web-workers-offscreencanvas`](./examples/angular-web-workers-offscreencanvas/), [`examples/angular-web-audio-visualizer`](./examples/angular-web-audio-visualizer/), [`examples/rust-wasm-performance-demo`](./examples/rust-wasm-performance-demo/) |
| Linux desktop and kernel-adjacent tooling | [`examples/latency-lens`](./examples/latency-lens/) |
| APIs and data fetching | [`examples/angular-graphql-apollo`](./examples/angular-graphql-apollo/), [`examples/graphql-express-angular-migration`](./examples/graphql-express-angular-migration/) |
| Real-time applications | [`examples/angular-collaborative-editor-firebase-webrtc`](./examples/angular-collaborative-editor-firebase-webrtc/), [`examples/realtime-frontend-patterns`](./examples/realtime-frontend-patterns/) |
| Micro frontends and web components | [`examples/qwik-angular-react-rust`](./examples/qwik-angular-react-rust/), [`examples/angular-stencil-web-components`](./examples/angular-stencil-web-components/) |
| TypeScript and state management | [`examples/typescript-advanced-types`](./examples/typescript-advanced-types/), [`examples/react-recoil-advanced-state`](./examples/react-recoil-advanced-state/) |
| Tooling and migration | [`examples/angular-custom-schematics`](./examples/angular-custom-schematics/), [`examples/bootstrap-to-tailwind-migration`](./examples/bootstrap-to-tailwind-migration/), [`examples/jupyter-blog-starter`](./examples/jupyter-blog-starter/) |

## Project Index

| Project | Focus | Live demo | Related article |
| --- | --- | --- | --- |
| [`examples/angular-web-audio-visualizer`](./examples/angular-web-audio-visualizer/) | Angular music visualization with the Web Audio API and Canvas | [Open](https://playground.omid.dev/examples/angular-web-audio-visualizer/) | [Creating Dynamic Music Visualizations with Angular and the Web Audio API](https://omid.dev/2024/07/13/creating-dynamic-music-visualizations-with-angular-and-the-web-audio-api/) |
| [`examples/qwik-angular-react-rust`](./examples/qwik-angular-react-rust/) | Qwik shell app that hosts Angular and React micro frontends, with optional Rust WASM | [Open](https://playground.omid.dev/examples/qwik-angular-react-rust/) | [Micro Frontends: Working Example](https://omid.dev/2024/05/11/micro-frontends-working-example/) |
| [`examples/angular-collaborative-editor-firebase-webrtc`](./examples/angular-collaborative-editor-firebase-webrtc/) | Real-time Angular editor using Firebase, Firestore, and WebRTC signaling ideas | Source only (Firebase) | [Building a Real-Time Collaborative Editor with Angular, Firebase, and WebRTC](https://omid.dev/2024/06/24/realtime-collaborative-editor-with-angular-firebase-webrtc/) |
| [`examples/angular-web-workers-offscreencanvas`](./examples/angular-web-workers-offscreencanvas/) | Moving canvas work off the main thread with Web Workers and OffscreenCanvas | [Open](https://playground.omid.dev/examples/angular-web-workers-offscreencanvas/) | [Optimizing Angular Applications with Web Workers and OffscreenCanvas](https://omid.dev/2024/06/23/optimizing-angular-applications-with-web-workers-and-offscreencanvas/) |
| [`examples/angular-graphql-apollo`](./examples/angular-graphql-apollo/) | Angular app connected to a local GraphQL API with Apollo Client | Source only (API server) | [Integrating GraphQL with Angular: A Practical Guide](https://omid.dev/2024/06/01/integrating-graphql-with-angular-a-practical-guide/) |
| [`examples/angular-stencil-web-components`](./examples/angular-stencil-web-components/) | Stencil web component consumed by an Angular app | [Open](https://playground.omid.dev/examples/angular-stencil-web-components/) | [Implementing Custom Web Components in Angular with Stencil.js](https://omid.dev/2024/06/26/implementing-custom-web-components-in-angular-with-stenciljs/) |
| [`examples/typescript-advanced-types`](./examples/typescript-advanced-types/) | Small TypeScript examples for mapped, conditional, recursive, and utility types | Source only | [Advanced TypeScript types](https://omid.dev/2024/06/14/advanced-typeScript-types/) |
| [`examples/react-recoil-advanced-state`](./examples/react-recoil-advanced-state/) | React task dashboard demonstrating atoms, selectors, and derived state with Recoil | [Open](https://playground.omid.dev/examples/react-recoil-advanced-state/) | [Advanced state management in React with Recoil](https://omid.dev/2024/06/14/advanced-state-management-in-react-with-recoil/) |
| [`examples/realtime-frontend-patterns`](./examples/realtime-frontend-patterns/) | Node examples for WebSocket and Server-Sent Events patterns | Source only (Node server) | [Real-time data in frontend applications](https://omid.dev/2024/06/08/real-time-data-in-frontend-applications/) |
| [`examples/angular-patterns-and-di`](./examples/angular-patterns-and-di/) | Angular design patterns, dependency injection, providers, and injection tokens | [Open](https://playground.omid.dev/examples/angular-patterns-and-di/) | [Design patterns in Angular](https://omid.dev/2024/05/31/design-patterns-in-angular-enhancing-code-quality-and-maintainability/), [Advanced DI techniques](https://omid.dev/2024/06/17/advanced-dependency-injection-techniques-in-angular-tree-shakable-providers-and-injection-tokens/) |
| [`examples/angular-dynamic-form-debugging`](./examples/angular-dynamic-form-debugging/) | Reactive form debugging scenario for Angular applications | [Open](https://playground.omid.dev/examples/angular-dynamic-form-debugging/) | [Debugging Angular](https://omid.dev/2024/05/22/debugging-angular-a-tale-of-two-developers/) |
| [`examples/angular-shared-library-workspace`](./examples/angular-shared-library-workspace/) | Angular workspace containing a reusable UI library and demo app | [Open](https://playground.omid.dev/examples/angular-shared-library-workspace/) | [Reusable shared module in Angular](https://omid.dev/2024/05/12/reusable-shared-module-in-angular/) |
| [`examples/angular-custom-schematics`](./examples/angular-custom-schematics/) | Angular schematics for repeatable code generation | Source only | [Building custom Angular schematics](https://omid.dev/2024/06/03/building-custom-angular-schematics-automating-code-generation/) |
| [`examples/bootstrap-to-tailwind-migration`](./examples/bootstrap-to-tailwind-migration/) | Side-by-side migration from Bootstrap-style markup to Tailwind CSS | [Open](https://playground.omid.dev/examples/bootstrap-to-tailwind-migration/) | [Migrate CSS Bootstrap to Tailwind](https://omid.dev/2024/05/22/migrate-css-bootstrap-to-tailwind/) |
| [`examples/rust-wasm-performance-demo`](./examples/rust-wasm-performance-demo/) | Rust and WebAssembly benchmark served from a simple web page | [Open](https://playground.omid.dev/examples/rust-wasm-performance-demo/) | [WebAssembly and Rust](https://omid.dev/2024/06/13/building-high-performance-web-applications-leveraging-webassembly-and-rust/) |
| [`examples/latency-lens`](./examples/latency-lens/) | Rust TUI that reads Linux PSI and explains desktop stutter from kernel pressure signals | Source only (native Linux) | [Building a Tiny Linux App to Explain Desktop Stutter](https://omid.dev/2026/06/04/building-a-tiny-linux-app-to-explain-desktop-stutter/) |
| [`examples/jupyter-blog-starter`](./examples/jupyter-blog-starter/) | Python and Jupyter starter for notebook-driven technical analysis | Source only | [Jupyter setup guide](https://omid.dev/2025/12/23/jupyter-technical-setup-guide/), [Jupyter real-world examples](https://omid.dev/2025/12/23/jupyter-real-world-examples/) |
| [`examples/graphql-express-angular-migration`](./examples/graphql-express-angular-migration/) | Express API showing REST and GraphQL side by side with an Angular client | Source only (API server) | [Migrating from REST to GraphQL](https://omid.dev/2024/08/07/migrating-from-rest-to-graphql-a-step-by-step-guide-for-expressjs-and-angular/) |

## Common Requirements

- Node.js 20+ and npm for most JavaScript and Angular examples. If you use `nvm`, run `nvm use` from the repository root.
- Angular CLI 18+ for Angular projects:

```bash
npm install -g @angular/cli@18
```

- Rust, `wasm-pack`, Python, `uv`, or Firebase access only for projects that explicitly mention them in their README.
- Rust toolchain for [`examples/latency-lens`](./examples/latency-lens/) (no root or eBPF required).

## Project-Specific Setup

- Live demos are built with `npm run build:playground` and deployed via Cloudflare Pages. See [playground/README.md](./playground/README.md).
- `angular-collaborative-editor-firebase-webrtc` needs a Firebase project with Anonymous Authentication and Cloud Firestore enabled.
- `angular-graphql-apollo` and `graphql-express-angular-migration` include local API servers. Start the `server/` app before the Angular app.
- `angular-stencil-web-components` has two parts. Build the Stencil component first, then run the Angular app.
- `qwik-angular-react-rust` is a multi-app demo. Run the Qwik shell, Angular app, and React app in separate terminals.
- `jupyter-blog-starter` supports either `uv sync` or a standard Python virtual environment.
- `rust-wasm-performance-demo` requires `wasm-pack build --target web --out-dir web/pkg` before serving the browser demo.
- `latency-lens` is a native Linux binary. Run `cargo run -- --once` from the project folder for a one-shot snapshot.

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
