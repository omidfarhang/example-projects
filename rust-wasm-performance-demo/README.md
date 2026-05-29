# Rust WASM Performance Demo

Companion project for [Building High-Performance Web Applications: Leveraging WebAssembly and Rust](https://omid.dev/2024/06/13/building-high-performance-web-applications-leveraging-webassembly-and-rust/).

## Build WASM

```bash
wasm-pack build --target web --out-dir web/pkg
```

## Run demo

Serve the `web/` folder with any static server:

```bash
npx serve web
```

Open the page and click **Run benchmark**.

## Blog post

https://omid.dev/2024/06/13/building-high-performance-web-applications-leveraging-webassembly-and-rust/
