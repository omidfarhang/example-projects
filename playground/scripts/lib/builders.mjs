import fs from 'node:fs';
import path from 'node:path';
import { run } from './exec.mjs';
import {
  copyDir,
  copyFile,
  dirExists,
  ensureDir,
  fileExists,
  firstExistingDir,
} from './fs-utils.mjs';
import { demoPublicPath, distDemoDir, projectDir } from './paths.mjs';
import { ensureRustToolchain } from './rust.mjs';
import { writeQwikShellIndex } from './qwik-static-index.mjs';

const angularCliEnv = { NG_CLI_ANALYTICS: 'false' };

function npmInstall(cwd, { legacyPeerDeps = false } = {}) {
  const args = ['ci', '--no-audit', '--no-fund'];
  if (legacyPeerDeps) {
    args.push('--legacy-peer-deps');
  }
  if (!fileExists(path.join(cwd, 'package-lock.json'))) {
    args[0] = 'install';
  }
  run('npm', args, { cwd, label: `npm install (${path.basename(cwd)})` });
}

function angularBrowserOut(cwd, projectName) {
  const base = projectName
    ? path.join('dist', projectName)
    : path.join('dist', path.basename(cwd));
  return firstExistingDir(cwd, [`${base}/browser`, base]);
}

export function buildAngular(demo, category) {
  const cwd = projectDir(demo);
  const baseHref = demoPublicPath(demo.slug, category);
  npmInstall(cwd, { legacyPeerDeps: demo.legacyPeerDeps });
  for (const lib of demo.angularLibraries ?? []) {
    run(
      'npx',
      ['ng', 'build', '--project', lib, '--configuration', 'production'],
      { cwd, env: angularCliEnv, label: `ng build lib ${lib}` },
    );
  }
  const projectFlag = demo.angularProject ? ['--project', demo.angularProject] : [];
  run(
    'npx',
    ['ng', 'build', ...projectFlag, '--configuration', 'production', `--base-href=${baseHref}`],
    { cwd, env: angularCliEnv, label: `ng build ${demo.slug}` },
  );
  const outName = demo.angularProject ?? path.basename(cwd);
  const built = angularBrowserOut(cwd, outName);
  if (!built) {
    throw new Error(`Angular build output not found for ${demo.slug}`);
  }
  copyDir(built, distDemoDir(demo.slug, category));
}

export function buildVite(demo, category) {
  const cwd = projectDir(demo);
  npmInstall(cwd);
  const base = demoPublicPath(demo.slug, category);
  run('npm', ['run', 'build'], {
    cwd,
    env: { PLAYGROUND_BASE: base },
    label: `vite build ${demo.slug}`,
  });
  const built = firstExistingDir(cwd, ['dist']);
  if (!built) {
    throw new Error(`Vite build output not found for ${demo.slug}`);
  }
  copyDir(built, distDemoDir(demo.slug, category));
}

export function buildRustWasm(demo, category) {
  const cwd = projectDir(demo);
  ensureRustToolchain();
  run('wasm-pack', ['build', '--target', 'web', '--out-dir', 'web/pkg'], {
    cwd,
    label: `wasm-pack ${demo.slug}`,
  });
  const webDir = path.join(cwd, 'web');
  if (!dirExists(webDir)) {
    throw new Error(`Missing web/ folder for ${demo.slug}`);
  }
  copyDir(webDir, distDemoDir(demo.slug, category));
}

export function buildStencilAngular(demo, category) {
  const root = projectDir(demo);
  const stencilDir = path.join(root, 'stencil-my-button');
  const angularDir = path.join(root, 'angular-app');
  const assetsDir = path.join(angularDir, 'src/assets/stencil-my-button');

  npmInstall(stencilDir);
  run('npm', ['run', 'build'], { cwd: stencilDir, label: 'stencil build' });

  const esmDir = path.join(stencilDir, 'dist/esm');
  if (!dirExists(esmDir)) {
    throw new Error('Stencil dist/esm not found');
  }
  fs.rmSync(assetsDir, { recursive: true, force: true });
  ensureDir(assetsDir);
  copyDir(esmDir, assetsDir);
  fs.writeFileSync(
    path.join(assetsDir, 'loader.d.ts'),
    'export declare function defineCustomElements(win?: Window): void;\n',
    'utf8',
  );

  const baseHref = demoPublicPath(demo.slug, category);
  npmInstall(angularDir);
  run(
    'npx',
    ['ng', 'build', '--configuration', 'production', `--base-href=${baseHref}`],
    {
      cwd: angularDir,
      env: angularCliEnv,
      label: 'ng build stencil angular-app',
    },
  );
  const built = angularBrowserOut(angularDir, 'angular-app');
  if (!built) {
    throw new Error('Angular app build output not found for stencil demo');
  }
  copyDir(built, distDemoDir(demo.slug, category));
}

export function buildQwikMfe(demo, category) {
  const root = projectDir(demo);
  const shellDir = path.join(root, 'qwik-micro-frontend');
  const baseHref = demoPublicPath(demo.slug, category);
  const origin = `https://playground.omid.dev${baseHref.replace(/\/$/, '')}`;

  npmInstall(path.join(root, 'angular-app'));
  npmInstall(path.join(root, 'react-app'));
  npmInstall(shellDir);

  run('npm', ['run', 'clean'], { cwd: root, label: 'clean mfes' });
  run('npm', ['run', 'build:angular'], { cwd: root, env: angularCliEnv });
  run('npm', ['run', 'build:react'], { cwd: root });

  ensureRustToolchain();
  run('npm', ['run', 'build:rust'], {
    cwd: root,
    env: { PLAYGROUND_REQUIRE_RUST_WASM: '1' },
  });

  const qwikBuildEnv = {
    PLAYGROUND_BASE: baseHref,
    PLAYGROUND_ORIGIN: origin,
  };

  run('npm', ['run', 'build.client'], {
    cwd: shellDir,
    env: qwikBuildEnv,
    label: 'qwik client build',
  });
  run('npm', ['run', 'build.server'], {
    cwd: shellDir,
    env: qwikBuildEnv,
    label: 'qwik static SSG',
  });

  const built = firstExistingDir(shellDir, ['dist']);
  if (!built) {
    throw new Error(`Qwik build output not found for ${demo.slug}`);
  }

  const nested = path.join(built, 'examples', demo.slug);
  const deploySource = dirExists(nested) ? nested : built;

  const indexHtml = path.join(deploySource, 'index.html');
  if (!fileExists(indexHtml)) {
    writeQwikShellIndex(deploySource, baseHref);
  }

  copyDir(deploySource, distDemoDir(demo.slug, category));

  const mfesSrc = path.join(built, 'mfes');
  const deployMfes = path.join(deploySource, 'mfes');
  if (!dirExists(deployMfes) && dirExists(mfesSrc)) {
    copyDir(mfesSrc, path.join(distDemoDir(demo.slug, category), 'mfes'));
  }
}

export function buildStaticHtml(demo, category) {
  const cwd = projectDir(demo);
  const dest = distDemoDir(demo.slug, category);
  ensureDir(dest);

  for (const folder of ['before-bootstrap', 'after-tailwind']) {
    const src = path.join(cwd, folder);
    if (!dirExists(src)) {
      throw new Error(`Missing ${folder} for ${demo.slug}`);
    }
    copyDir(src, path.join(dest, folder));
  }

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bootstrap to Tailwind Migration</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    h1 { font-size: 1.4rem; }
    ul { padding-left: 1.2rem; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <h1>Bootstrap to Tailwind Migration</h1>
  <p>Compare the same layout with two styling approaches:</p>
  <ul>
    <li><a href="before-bootstrap/index.html">Before — Bootstrap-style markup</a></li>
    <li><a href="after-tailwind/index.html">After — Tailwind CSS</a></li>
  </ul>
</body>
</html>`;
  fs.writeFileSync(path.join(dest, 'index.html'), indexHtml, 'utf8');
}

export function buildDemo(demo, category) {
  switch (demo.type) {
    case 'angular':
    case 'angular-workspace':
      return buildAngular(demo, category);
    case 'vite':
      return buildVite(demo, category);
    case 'rust-wasm':
      return buildRustWasm(demo, category);
    case 'stencil-angular':
      return buildStencilAngular(demo, category);
    case 'qwik-mfe':
      return buildQwikMfe(demo, category);
    case 'static-html':
      return buildStaticHtml(demo, category);
    default:
      throw new Error(`Unknown demo type: ${demo.type}`);
  }
}
