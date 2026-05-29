import { spawnSync } from 'node:child_process';

const hasWasmPack = spawnSync('wasm-pack', ['--version'], {
  stdio: 'ignore',
});

if (hasWasmPack.error) {
  console.warn('wasm-pack is not installed; skipping optional Rust WASM build.');
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
