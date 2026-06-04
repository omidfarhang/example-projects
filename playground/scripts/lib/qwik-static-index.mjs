import fs from 'node:fs';
import path from 'node:path';

function findStylesheet(manifest, baseHref) {
  const injection = manifest.injections?.find(
    (item) => item.tag === 'style' && item.attributes?.['data-src'],
  );
  if (injection?.attributes?.['data-src']) {
    return injection.attributes['data-src'];
  }
  const base = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
  return `${base}build/q-Cn8YeGBN.css`;
}

function findEntryScript(manifest) {
  for (const [file, meta] of Object.entries(manifest.bundles ?? {})) {
    const origins = meta.origins ?? [];
    if (origins.some((origin) => origin.includes('routes/index'))) {
      return file;
    }
  }

  for (const [file, meta] of Object.entries(manifest.bundles ?? {})) {
    const origins = meta.origins ?? [];
    if (origins.some((origin) => origin.includes('@qwik-city-sw-register'))) {
      return file;
    }
  }

  return 'q-BS1K64cX.js';
}

function findCoreScript(manifest) {
  let largest = null;
  let largestSize = 0;
  for (const [file, meta] of Object.entries(manifest.bundles ?? {})) {
    if ((meta.size ?? 0) > largestSize) {
      largestSize = meta.size;
      largest = file;
    }
  }
  return largest ?? 'q-LZYP00Iy.js';
}

/**
 * Qwik client-only build does not emit index.html without a full static adapter SSR pass.
 * Generate a minimal shell that bootstraps the prebuilt client bundle for Cloudflare Pages.
 */
export function writeQwikShellIndex(distDir, baseHref) {
  const manifestPath = path.join(distDir, 'q-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing q-manifest.json in ${distDir}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const base = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
  const coreScript = `${base}build/${findCoreScript(manifest)}`;
  const entryScript = `${base}build/${findEntryScript(manifest)}`;
  const stylesheet = findStylesheet(manifest, base);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Micro Frontends (Qwik + Angular + React)</title>
  <link rel="manifest" href="${base}manifest.json" />
  <link rel="icon" href="${base}favicon.svg" />
  <link rel="stylesheet" href="${stylesheet}" />
</head>
<body>
  <div id="qwik-loader">Loading demo…</div>
  <script type="module" src="${coreScript}"></script>
  <script type="module" src="${entryScript}"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');
}
