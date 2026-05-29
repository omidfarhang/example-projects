# Example Projects

Companion source code for tutorials and technical posts on [omid.dev](https://omid.dev).

The goal of this repository is to keep blog posts readable while still giving readers a complete, runnable reference when a post grows beyond small snippets. Each top-level folder is an independent example project with its own README, dependencies, and run instructions.

## Quick Start

Clone the repo and open the example you want to run:

```bash
git clone https://github.com/omidfarhang/example-projects.git
cd example-projects/angular-web-audio-visualizer
npm install
npm start
```

Most examples are Angular-based and run on `http://localhost:4200`. Some projects include an API server, Firebase setup, Stencil build step, or multiple frontend apps; check the README inside each folder before running.

## Projects

### Tier A — Runnable tutorials

| Project | Stack | Blog post |
| --- | --- | --- |
| [`angular-web-audio-visualizer`](./angular-web-audio-visualizer/) | Angular, Web Audio API, Canvas | [Creating Dynamic Music Visualizations with Angular and the Web Audio API](https://omid.dev/2024/07/13/creating-dynamic-music-visualizations-with-angular-and-the-web-audio-api/) |
| [`qwik-angular-react-rust`](./qwik-angular-react-rust/) | Qwik, Angular, React, Rust WASM | [Micro Frontends: Working Example](https://omid.dev/2024/05/11/micro-frontends-working-example/) |
| [`angular-collaborative-editor-firebase-webrtc`](./angular-collaborative-editor-firebase-webrtc/) | Angular, Firebase, Firestore, WebRTC | [Building a Real-Time Collaborative Editor with Angular, Firebase, and WebRTC](https://omid.dev/2024/06/24/realtime-collaborative-editor-with-angular-firebase-webrtc/) |
| [`angular-web-workers-offscreencanvas`](./angular-web-workers-offscreencanvas/) | Angular, Web Workers, OffscreenCanvas | [Optimizing Angular Applications with Web Workers and OffscreenCanvas](https://omid.dev/2024/06/23/optimizing-angular-applications-with-web-workers-and-offscreencanvas/) |
| [`angular-graphql-apollo`](./angular-graphql-apollo/) | Angular, Apollo Client, GraphQL, Express | [Integrating GraphQL with Angular: A Practical Guide](https://omid.dev/2024/06/01/integrating-graphql-with-angular-a-practical-guide/) |
| [`angular-stencil-web-components`](./angular-stencil-web-components/) | Angular, Stencil, Web Components | [Implementing Custom Web Components in Angular with Stencil.js](https://omid.dev/2024/06/26/implementing-custom-web-components-in-angular-with-stenciljs/) |

### Tier B — Optional companion examples

| Project | Stack | Blog post |
| --- | --- | --- |
| [`typescript-advanced-types`](./typescript-advanced-types/) | TypeScript | [Advanced TypeScript types](https://omid.dev/2024/06/14/advanced-typeScript-types/) |
| [`react-recoil-advanced-state`](./react-recoil-advanced-state/) | React, Recoil | [Advanced state management in React with Recoil](https://omid.dev/2024/06/14/advanced-state-management-in-react-with-recoil/) |
| [`realtime-frontend-patterns`](./realtime-frontend-patterns/) | Node, WebSocket, SSE | [Real-time data in frontend applications](https://omid.dev/2024/06/08/real-time-data-in-frontend-applications/) |
| [`angular-patterns-and-di`](./angular-patterns-and-di/) | Angular, DI tokens | [Design patterns in Angular](https://omid.dev/2024/05/31/design-patterns-in-angular-enhancing-code-quality-and-maintainability/), [Advanced DI techniques](https://omid.dev/2024/06/17/advanced-dependency-injection-techniques-in-angular-tree-shakable-providers-and-injection-tokens/) |
| [`angular-dynamic-form-debugging`](./angular-dynamic-form-debugging/) | Angular, Reactive Forms | [Debugging Angular](https://omid.dev/2024/05/22/debugging-angular-a-tale-of-two-developers/) |
| [`angular-shared-library-workspace`](./angular-shared-library-workspace/) | Angular library workspace | [Reusable shared module in Angular](https://omid.dev/2024/05/12/reusable-shared-module-in-angular/) |
| [`angular-custom-schematics`](./angular-custom-schematics/) | Angular schematics | [Building custom Angular schematics](https://omid.dev/2024/06/03/building-custom-angular-schematics-automating-code-generation/) |
| [`bootstrap-to-tailwind-migration`](./bootstrap-to-tailwind-migration/) | Bootstrap, Tailwind | [Migrate CSS Bootstrap to Tailwind](https://omid.dev/2024/05/22/migrate-css-bootstrap-to-tailwind/) |
| [`rust-wasm-performance-demo`](./rust-wasm-performance-demo/) | Rust, WebAssembly | [WebAssembly and Rust](https://omid.dev/2024/06/13/building-high-performance-web-applications-leveraging-webassembly-and-rust/) |
| [`jupyter-blog-starter`](./jupyter-blog-starter/) | Python, Jupyter, uv | [Jupyter setup guide](https://omid.dev/2025/12/23/jupyter-technical-setup-guide/), [Jupyter real-world examples](https://omid.dev/2025/12/23/jupyter-real-world-examples/) |
| [`graphql-express-angular-migration`](./graphql-express-angular-migration/) | Express REST + GraphQL, Angular | [Migrating from REST to GraphQL](https://omid.dev/2024/08/07/migrating-from-rest-to-graphql-a-step-by-step-guide-for-expressjs-and-angular/) |

## Requirements

- Node.js 20+ and npm
- Angular CLI 18+ for Angular examples:

```bash
npm install -g @angular/cli@18
```

Some examples need additional setup:

- `angular-collaborative-editor-firebase-webrtc` needs a Firebase project. Copy `.env.example` values into `src/environments/environment.ts`, then enable Anonymous Auth and Firestore.
- `angular-graphql-apollo` includes a local GraphQL server. Start `server/` before running the Angular app.
- `angular-stencil-web-components` has two parts: build the Stencil component first, then run the Angular app.
- `qwik-angular-react-rust` has multiple apps. Start the Qwik shell, Angular app, and React app in separate terminals.
- `graphql-express-angular-migration` includes REST and GraphQL endpoints. Start `server/` before the Angular app.
- `jupyter-blog-starter` supports `uv sync` or `pip install -r requirements.txt`.
- `rust-wasm-performance-demo` requires `wasm-pack build --target web --out-dir web/pkg` before opening the browser demo.

## Repository Layout

Each example should stay self-contained:

```text
example-projects/
  project-name/
    README.md
    package.json
    src/
```

For multi-part examples, keep the parts under one folder:

```text
example-projects/
  angular-graphql-apollo/
    server/
    src/
```

## Maintenance Notes

- Keep generated dependencies (`node_modules/`, `dist/`, Angular cache, Rust `target/`) out of git.
- Prefer stable, tutorial-friendly code over clever abstractions.
- Keep each example aligned with the blog post it supports.
- If a sample needs secrets or local configuration, provide `.env.example` or documented placeholder values.
- Add new examples as top-level kebab-case folders named after the post or the main demo idea.

## Backlog

Tier B examples are now included. See [`TIER_B_BACKLOG.md`](./TIER_B_BACKLOG.md) for the completed mapping.

## Contributing

These projects mirror blog tutorials. If you find a bug, dependency issue, or mismatch with a post, open an issue or pull request.
