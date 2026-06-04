import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { runShell } from './exec.mjs';

function commandExists(cmd) {
  const result = spawnSync(cmd, ['--version'], { stdio: 'ignore' });
  return !result.error && result.status === 0;
}

function cargoBin() {
  const home = process.env.HOME ?? '';
  return path.join(home, '.cargo', 'bin');
}

function refreshPath() {
  const bin = cargoBin();
  if (!process.env.PATH?.includes(bin)) {
    process.env.PATH = `${bin}:${process.env.PATH ?? ''}`;
  }
}

export function ensureRustToolchain() {
  console.log('\n▶ Ensuring Rust toolchain for WASM builds');

  const rustupInstalled = commandExists(path.join(cargoBin(), 'rustup'));
  if (!rustupInstalled) {
    runShell(
      'curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain stable',
      { label: 'rustup' },
    );
  }

  refreshPath();

  const cargoEnv = path.join(process.env.HOME ?? '', '.cargo', 'env');
  const rustupCmd = fs.existsSync(cargoEnv)
    ? `. "${cargoEnv}" && rustup target add wasm32-unknown-unknown`
    : 'rustup target add wasm32-unknown-unknown';
  runShell(rustupCmd, { label: 'wasm32 target' });
  refreshPath();

  if (!commandExists('wasm-pack')) {
    runShell('cargo install wasm-pack --locked', { label: 'wasm-pack (cargo)' });
    refreshPath();
  }

  if (!commandExists('wasm-pack')) {
    throw new Error('wasm-pack is required but could not be installed.');
  }

  // Prefer rustup-managed toolchain over distro rustc (often lacks wasm32).
  const cargo = cargoBin();
  process.env.PATH = `${cargo}:${process.env.PATH ?? ''}`;
  process.env.RUSTUP_TOOLCHAIN = process.env.RUSTUP_TOOLCHAIN ?? 'stable';
}
