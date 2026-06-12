# Qwik + Angular + React Micro Frontends

Companion project for [Micro Frontends: Working Example](https://omid.dev/2024/05/11/micro-frontends-working-example/).

**Live demo:** https://playground.omid.dev/examples/qwik-angular-react-rust/ (prebuilt on [playground.omid.dev](https://playground.omid.dev))

A micro frontend demo with a Qwik shell app that composes Angular and React micro frontends as custom elements, plus an optional Rust WebAssembly module.

## Structure

```
qwik-angular-react-rust/
├── qwik-micro-frontend/   # Qwik shell application
├── angular-app/           # Angular micro frontend
├── react-app/             # React micro frontend
├── rust-wasm/             # Rust WebAssembly module
└── scripts/               # Shared build helpers
```

Each micro frontend builds into `qwik-micro-frontend/public/mfes/`. The shell loads those bundles at runtime and renders them as `<angular-microfrontend>` and `<react-microfrontend>` custom elements.

## Prerequisites

- Node.js 24+
- Rust toolchain and `wasm-pack` (optional, for `rust-wasm`)

## Run locally

From the project root:

```bash
npm install --prefix qwik-micro-frontend
npm install --prefix angular-app
npm install --prefix react-app
npm run dev
```

This builds the Angular and React bundles, optionally builds Rust WASM when `wasm-pack` is available, and starts the Qwik shell on `http://localhost:5173`.

## Build everything

```bash
npm run build
```

That command:

1. Builds Angular into `qwik-micro-frontend/public/mfes/angular`
2. Builds React into `qwik-micro-frontend/public/mfes/react`
3. Builds Rust WASM into `qwik-micro-frontend/public/mfes/rust-wasm` when `wasm-pack` is installed
4. Builds the Qwik shell

## Blog post

https://omid.dev/2024/05/11/micro-frontends-working-example/
