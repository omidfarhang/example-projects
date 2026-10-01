import fs from 'node:fs';
import path from 'node:path';
import { getActiveDistRoot } from './paths.mjs';
import { ensureDir } from './fs-utils.mjs';
import { getCatalogUrl } from './manifest-utils.mjs';
import { escapeHtml, faviconHead } from './theme.mjs';

/**
 * Root index redirects to the omid.dev catalog.
 * Live demos remain under /examples/<slug>/ and /labs/<slug>/.
 */
export function writeLandingPage(_manifest) {
  const catalogUrl = getCatalogUrl();
  const distRoot = getActiveDistRoot();
  ensureDir(distRoot);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Omid Playground → Catalog</title>
  <meta http-equiv="refresh" content="0;url=${escapeHtml(catalogUrl)}" />
  <link rel="canonical" href="${escapeHtml(catalogUrl)}" />
  ${faviconHead()}
  <script>location.replace(${JSON.stringify(catalogUrl)});</script>
</head>
<body>
  <p>The playground catalog moved to <a href="${escapeHtml(catalogUrl)}">${escapeHtml(catalogUrl)}</a>.</p>
</body>
</html>
`;

  fs.writeFileSync(path.join(distRoot, 'index.html'), html, 'utf8');
  // Cloudflare Pages: redirect playground.omid.dev/ to the omid.dev catalog
  fs.writeFileSync(
    path.join(distRoot, '_redirects'),
    `/ https://omid.dev/playground/ 302\n`,
    'utf8',
  );
}
