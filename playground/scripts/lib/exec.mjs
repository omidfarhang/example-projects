import { spawnSync } from 'node:child_process';

export function run(command, args, options = {}) {
  const { cwd, env, label } = options;
  if (label) {
    console.log(`\n▶ ${label}`);
  }
  console.log(`  $ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit',
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed (${result.status}): ${command} ${args.join(' ')}`);
  }
}

export function runShell(script, options = {}) {
  const { cwd, env, label } = options;
  if (label) {
    console.log(`\n▶ ${label}`);
  }
  console.log(`  $ ${script}`);
  const result = spawnSync(script, {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error(`Shell command failed (${result.status}): ${script}`);
  }
}
