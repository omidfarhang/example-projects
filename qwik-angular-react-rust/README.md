# Qwik + Angular + React Micro Frontends

Companion project for [Micro Frontends: Working Example](https://omid.dev/2024/05/11/micro-frontends-working-example/).

A micro frontend demo with a Qwik shell app integrating Angular and React micro frontends, plus a Rust WASM module.

## Structure

```
qwik-angular-react-rust/
├── qwik-micro-frontend/   # Shell application
├── angular-app/           # Angular micro frontend
├── react-app/             # React micro frontend
└── rust-wasm/             # Rust WebAssembly module
```

## Prerequisites

- Node.js 20+
- Rust toolchain (for `rust-wasm` only)

## Run

Start each app in a separate terminal:

```bash
# Qwik shell (default port 5173)
cd qwik-micro-frontend
npm install
npm start

# Angular micro frontend (port 4200)
cd angular-app
npm install
npm start

# React micro frontend (port 3000)
cd react-app
npm install
npm start
```

Build Rust WASM (optional):

```bash
cd rust-wasm
wasm-pack build --target web
```

## Blog post

https://omid.dev/2024/05/11/micro-frontends-working-example/
