import { spawnSync } from 'node:child_process';

const requireRustWasm = process.env.PLAYGROUND_REQUIRE_RUST_WASM === '1';

const hasWasmPack = spawnSync('wasm-pack', ['--version'], {
  stdio: 'ignore',
});

if (hasWasmPack.error) {
  const message = 'wasm-pack is not installed; Rust WASM cannot be built.';
  if (requireRustWasm) {
    console.error(message);
    process.exit(1);
  }

  console.warn(`${message} Skipping optional Rust WASM build.`);
  process.exit(0);
}

const build = spawnSync(
  'wasm-pack',
  [
    'build',
    'rust-wasm',
    '--target',
    'web',
    '--out-dir',
    '../qwik-micro-frontend/public/mfes/rust-wasm',
  ],
  {
    stdio: 'inherit',
  },
);

process.exit(build.status ?? 1);
