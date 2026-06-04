import fs from 'node:fs';
import path from 'node:path';
import { DIST_ROOT } from './paths.mjs';
import { ensureDir } from './fs-utils.mjs';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function writeLandingPage(manifest) {
  const { baseUrl, demos, category } = manifest;
  const demoCards = demos
    .map((demo) => {
      const href = `${baseUrl.replace(/\/$/, '')}/${category}/${demo.slug}/`;
      return `
        <article class="demo-card">
          <h3><a href="${escapeHtml(href)}">${escapeHtml(demo.title)}</a></h3>
          <p>${escapeHtml(demo.description)}</p>
          <p class="demo-card__links">
            <a class="demo-card__primary" href="${escapeHtml(href)}">Open live demo</a>
            <a href="${escapeHtml(demo.articleUrl)}">Read article</a>
          </p>
        </article>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Omid Playground — Live Examples</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #0f1419;
      --surface: #1a2332;
      --text: #e8eef4;
      --muted: #9aa8b8;
      --accent: #3d9cf5;
      --border: #2a3a4f;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
    }
    .wrap { max-width: 960px; margin: 0 auto; padding: 2rem 1.25rem 3rem; }
    header { margin-bottom: 2rem; }
    h1 { font-size: 1.75rem; margin: 0 0 0.5rem; }
    .lede { color: var(--muted); margin: 0; }
    .sections { display: grid; gap: 2rem; }
    section h2 { font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin: 0 0 1rem; }
    .demo-grid { display: grid; gap: 1rem; }
    @media (min-width: 640px) { .demo-grid { grid-template-columns: repeat(2, 1fr); } }
    .demo-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.1rem;
    }
    .demo-card h3 { margin: 0 0 0.35rem; font-size: 1rem; }
    .demo-card h3 a { color: var(--text); text-decoration: none; }
    .demo-card h3 a:hover { color: var(--accent); }
    .demo-card p { margin: 0 0 0.75rem; color: var(--muted); font-size: 0.92rem; }
    .demo-card__links { display: flex; flex-wrap: wrap; gap: 0.75rem 1rem; font-size: 0.88rem; }
    .demo-card__links a { color: var(--accent); }
    .demo-card__primary { font-weight: 600; }
    .reserved { color: var(--muted); font-size: 0.9rem; }
    footer { margin-top: 2.5rem; color: var(--muted); font-size: 0.85rem; }
    footer a { color: var(--accent); }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>Playground</h1>
      <p class="lede">Live browser demos for companion projects on <a href="https://omid.dev">omid.dev</a>.</p>
    </header>
    <div class="sections">
      <section>
        <h2>Examples</h2>
        <div class="demo-grid">
          ${demoCards}
        </div>
      </section>
      <section>
        <h2>Coming later</h2>
        <p class="reserved"><code>/tools</code>, <code>/benchmarks</code>, and <code>/labs</code> are reserved for future interactive content.</p>
      </section>
    </div>
    <footer>
      <p>Source: <a href="https://github.com/omidfarhang/example-projects">github.com/omidfarhang/example-projects</a></p>
    </footer>
  </div>
</body>
</html>`;

  ensureDir(DIST_ROOT);
  fs.writeFileSync(path.join(DIST_ROOT, 'index.html'), html, 'utf8');
}
