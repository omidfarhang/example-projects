import fs from 'node:fs';
import path from 'node:path';
import { DIST_ROOT } from './paths.mjs';
import { ensureDir } from './fs-utils.mjs';

const TYPE_LABELS = {
  angular: 'Angular',
  'rust-wasm': 'Rust / WASM',
  'qwik-mfe': 'Micro Frontends',
  'stencil-angular': 'Web Components',
  'angular-workspace': 'Angular Workspace',
  vite: 'React / Vite',
  'static-html': 'CSS',
};

const REPO_URL = 'https://github.com/omidfarhang/example-projects';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function typeLabel(type) {
  return TYPE_LABELS[type] ?? type;
}

function uniqueTypes(demos) {
  return [...new Set(demos.map((demo) => demo.type))];
}

function renderDemoCard(demo, category) {
  const href = `/${category}/${demo.slug}/`;
  const badge = typeLabel(demo.type);

  return `
        <article class="demo-card">
          <div class="demo-card__meta">
            <span class="demo-card__badge">${escapeHtml(badge)}</span>
          </div>
          <h3><a href="${escapeHtml(href)}">${escapeHtml(demo.title)}</a></h3>
          <p class="demo-card__description">${escapeHtml(demo.description)}</p>
          <div class="demo-card__actions">
            <a class="btn btn--primary" href="${escapeHtml(href)}">Open live demo</a>
            <a class="btn btn--secondary" href="${escapeHtml(demo.articleUrl)}">Read article</a>
          </div>
        </article>`;
}

function renderSourceCard(project) {
  const repoHref =
    project.repoUrl ??
    `${REPO_URL}/tree/master/${project.slug}`;

  return `
        <article class="source-card">
          <div class="source-card__meta">
            <span class="source-card__badge">${escapeHtml(project.reason)}</span>
          </div>
          <h3>${escapeHtml(project.title)}</h3>
          <p class="source-card__description">${escapeHtml(project.description)}</p>
          <div class="source-card__actions">
            <a class="btn btn--secondary" href="${escapeHtml(repoHref)}">View source</a>
            <a class="btn btn--ghost" href="${escapeHtml(project.articleUrl)}">Read article</a>
          </div>
        </article>`;
}

function renderStats(demos, sourceOnly) {
  const types = uniqueTypes(demos);
  const sourceCount = sourceOnly.length;

  return `
      <div class="stats">
        <div class="stat">
          <span class="stat__value">${demos.length}</span>
          <span class="stat__label">Live demos</span>
        </div>
        <div class="stat">
          <span class="stat__value">${types.length}</span>
          <span class="stat__label">Tech stacks</span>
        </div>
        <div class="stat">
          <span class="stat__value">${sourceCount}</span>
          <span class="stat__label">Source-only</span>
        </div>
      </div>`;
}

export function writeLandingPage(manifest) {
  const { baseUrl, demos, category, sourceOnly = [] } = manifest;
  const canonicalUrl = `${baseUrl.replace(/\/$/, '')}/`;
  const demoCards = demos.map((demo) => renderDemoCard(demo, category)).join('\n');
  const sourceCards = sourceOnly.map(renderSourceCard).join('\n');
  const stats = renderStats(demos, sourceOnly);
  const sourceSection =
    sourceOnly.length > 0
      ? `
      <section class="panel">
        <div class="section-header">
          <p class="section-eyebrow">Clone &amp; run</p>
          <h2>Source-only examples</h2>
          <p class="section-lede">These companions need Firebase, a local API server, native Linux tooling, or other setup that does not fit a static browser demo yet.</p>
        </div>
        <div class="source-grid">
          ${sourceCards}
        </div>
      </section>`
      : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Omid Playground — Live companion demos</title>
  <meta name="description" content="Live browser demos for companion projects on omid.dev. Try Angular, React, WebAssembly, micro frontends, and more without cloning a repository." />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Omid Playground — Live companion demos" />
  <meta property="og:description" content="Live browser demos for companion projects on omid.dev." />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:site_name" content="omid.dev" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Omid Playground — Live companion demos" />
  <meta name="twitter:description" content="Live browser demos for companion projects on omid.dev." />
  <link rel="icon" href="https://omid.dev/logo/favicon.ico" />
  <link rel="icon" type="image/png" sizes="16x16" href="https://omid.dev/logo/favicon-16x16.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="https://omid.dev/logo/favicon-32x32.png" />
  <link rel="apple-touch-icon" href="https://omid.dev/logo/apple-touch-icon.png" />
  <link rel="mask-icon" href="https://omid.dev/logo/safari-pinned-tab.svg" />
  <style>
    :root {
      color-scheme: light dark;
      --gap: 32px;
      --radius: 8px;
      --theme: #ffffff;
      --theme-rgb: 255, 255, 255;
      --primary: #0f172a;
      --secondary: #64748b;
      --content: #334155;
      --border: #dbe4f0;
      --accent: #2563eb;
      --accent-rgb: 37, 99, 235;
      --accent-hover: #1d4ed8;
      --accent-light: #dbeafe;
      --accent-2: #4f46e5;
      --accent-border-soft: rgba(var(--accent-rgb), 0.14);
      --surface-tint: rgba(var(--accent-rgb), 0.06);
      --surface-tint-strong: rgba(var(--accent-rgb), 0.12);
      --page-bg: #f0f4fc;
      --hero-glow: rgba(var(--accent-rgb), 0.2);
      --hero-glow-2: rgba(79, 70, 229, 0.14);
      --hero-glow-3: rgba(8, 145, 178, 0.1);
      --shadow-sm: 0 1px 2px 0 rgba(15, 23, 42, 0.06);
      --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.05);
      --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.06);
      --shadow-accent: 0 8px 24px -6px rgba(var(--accent-rgb), 0.28);
      --main-width: 1200px;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --theme: #0f172a;
        --theme-rgb: 15, 23, 42;
        --primary: #f1f5f9;
        --secondary: #94a3b8;
        --content: #cbd5e1;
        --border: #334155;
        --accent: #60a5fa;
        --accent-rgb: 96, 165, 250;
        --accent-hover: #3b82f6;
        --accent-light: #1e3a8a;
        --accent-2: #818cf8;
        --accent-border-soft: rgba(var(--accent-rgb), 0.22);
        --surface-tint: rgba(var(--accent-rgb), 0.1);
        --surface-tint-strong: rgba(var(--accent-rgb), 0.18);
        --page-bg: #020617;
        --hero-glow: rgba(var(--accent-rgb), 0.28);
        --hero-glow-2: rgba(129, 140, 248, 0.22);
        --hero-glow-3: rgba(34, 211, 238, 0.14);
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -1px rgba(0, 0, 0, 0.25);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
        --shadow-accent: 0 8px 24px -6px rgba(var(--accent-rgb), 0.35);
      }
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      background: var(--page-bg);
      color: var(--content);
      line-height: 1.6;
    }
    a { color: var(--accent); }
    a:hover { color: var(--accent-hover); }

    .site-header {
      border-bottom: 1px solid var(--border);
      background: rgba(var(--theme-rgb), 0.88);
      backdrop-filter: blur(10px);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .site-header__inner {
      max-width: var(--main-width);
      margin: 0 auto;
      padding: 14px var(--gap);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .site-brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--primary);
      font-weight: 800;
      font-size: 0.98rem;
      letter-spacing: -0.02em;
    }
    .site-brand__mark {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      box-shadow: var(--shadow-sm);
    }
    .site-nav a {
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 650;
      color: var(--secondary);
    }
    .site-nav a:hover { color: var(--accent); }

    .hero {
      padding: 64px var(--gap) 48px;
      background:
        radial-gradient(ellipse 80% 60% at 18% 0%, var(--hero-glow), transparent 55%),
        radial-gradient(ellipse 55% 45% at 92% 15%, var(--hero-glow-2), transparent 50%),
        radial-gradient(ellipse 40% 35% at 70% 80%, var(--hero-glow-3), transparent 45%),
        linear-gradient(to bottom, var(--theme), var(--accent-light) 120%, var(--page-bg));
      border-bottom: 1px solid var(--border);
    }
    .hero__inner {
      max-width: var(--main-width);
      margin: 0 auto;
      display: grid;
      gap: 28px;
    }
    .hero__eyebrow {
      margin: 0;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent);
    }
    .hero h1 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 3rem);
      line-height: 1.1;
      letter-spacing: -0.03em;
      color: var(--primary);
      max-width: 18ch;
    }
    .hero__lede {
      margin: 0;
      font-size: 1.08rem;
      color: var(--secondary);
      max-width: 58ch;
    }
    .hero__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 4px;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      max-width: 520px;
    }
    .stat {
      padding: 16px 18px;
      background: rgba(var(--theme-rgb), 0.72);
      border: 1px solid var(--accent-border-soft);
      border-radius: calc(var(--radius) * 2);
      box-shadow: var(--shadow-sm);
    }
    .stat__value {
      display: block;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--primary);
      line-height: 1.1;
    }
    .stat__label {
      display: block;
      margin-top: 4px;
      font-size: 0.78rem;
      font-weight: 650;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--secondary);
    }

    .content {
      max-width: var(--main-width);
      margin: 0 auto;
      padding: 48px var(--gap) 64px;
      display: grid;
      gap: 32px;
    }
    .panel {
      padding: 34px;
      background:
        linear-gradient(145deg, var(--theme) 0%, var(--surface-tint) 100%),
        var(--theme);
      border: 1px solid var(--accent-border-soft);
      border-radius: calc(var(--radius) * 2);
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
    }
    .panel::before {
      content: "";
      position: absolute;
      inset-inline: 34px;
      top: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--accent), var(--accent-2), transparent);
    }
    .section-header { margin-bottom: 24px; }
    .section-eyebrow {
      margin: 0 0 8px;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent);
    }
    .section-header h2 {
      margin: 0 0 10px;
      font-size: 1.45rem;
      color: var(--primary);
      letter-spacing: -0.02em;
    }
    .section-lede {
      margin: 0;
      color: var(--secondary);
      max-width: 62ch;
    }

    .demo-grid,
    .source-grid {
      display: grid;
      gap: 16px;
    }
    @media (min-width: 720px) {
      .demo-grid,
      .source-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    .demo-card,
    .source-card {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 20px;
      background: linear-gradient(135deg, var(--accent-light) 0%, var(--theme) 65%, var(--surface-tint-strong) 100%);
      border: 1px solid var(--accent-border-soft);
      border-radius: var(--radius);
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
    }
    .demo-card:hover,
    .source-card:hover {
      border-color: var(--accent);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    .demo-card h3,
    .source-card h3 {
      margin: 0;
      font-size: 1rem;
      line-height: 1.35;
      color: var(--primary);
    }
    .demo-card h3 a {
      color: inherit;
      text-decoration: none;
    }
    .demo-card h3 a:hover { color: var(--accent); }
    .demo-card__description,
    .source-card__description {
      margin: 0;
      flex: 1;
      font-size: 0.92rem;
      color: var(--secondary);
    }
    .demo-card__meta,
    .source-card__meta { display: flex; flex-wrap: wrap; gap: 8px; }
    .demo-card__badge,
    .source-card__badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--accent);
      background: rgba(var(--theme-rgb), 0.72);
      border: 1px solid var(--accent-border-soft);
    }
    .demo-card__actions,
    .source-card__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 4px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 9px 16px;
      border-radius: 999px;
      font-size: 0.86rem;
      font-weight: 700;
      text-decoration: none;
      transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
    }
    .btn--primary {
      background: var(--primary);
      color: var(--theme) !important;
      box-shadow: var(--shadow-sm);
    }
    .btn--primary:hover {
      background: var(--accent);
      color: #fff !important;
      box-shadow: var(--shadow-accent);
      transform: translateY(-1px);
    }
    .btn--secondary {
      background: rgba(var(--theme-rgb), 0.72);
      color: var(--accent) !important;
      border: 1px solid var(--accent-border-soft);
    }
    .btn--secondary:hover {
      border-color: var(--accent);
      color: var(--accent-hover) !important;
    }
    .btn--ghost {
      color: var(--secondary) !important;
      padding-inline: 0;
    }
    .btn--ghost:hover { color: var(--accent) !important; }

    .site-footer {
      max-width: var(--main-width);
      margin: 0 auto;
      padding: 0 var(--gap) 48px;
      color: var(--secondary);
      font-size: 0.88rem;
    }
    .site-footer p { margin: 0; }
    .site-footer a { font-weight: 650; }

    @media screen and (max-width: 768px) {
      .hero { padding: 48px var(--gap) 32px; }
      .content { padding-top: 32px; }
      .panel { padding: 24px; }
      .panel::before { inset-inline: 24px; }
      .stats { grid-template-columns: 1fr; max-width: none; }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="site-header__inner">
      <a class="site-brand" href="https://omid.dev/">
        <span class="site-brand__mark" aria-hidden="true"></span>
        <span>omid.dev</span>
      </a>
      <nav class="site-nav" aria-label="Playground">
        <a href="https://omid.dev/posts/">Blog</a>
      </nav>
    </div>
  </header>

  <section class="hero">
    <div class="hero__inner">
      <p class="hero__eyebrow">Companion projects</p>
      <h1>Live demos for omid.dev articles</h1>
      <p class="hero__lede">Try working examples in your browser without cloning a repository. Each demo links back to the article that explains the idea.</p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="#live-demos">Browse live demos</a>
        <a class="btn btn--secondary" href="${escapeHtml(REPO_URL)}">View source on GitHub</a>
      </div>
      ${stats}
    </div>
  </section>

  <main class="content">
    <section class="panel" id="live-demos">
      <div class="section-header">
        <p class="section-eyebrow">In your browser</p>
        <h2>Live demos</h2>
        <p class="section-lede">Static builds hosted on Cloudflare Pages. Open a demo, interact with it, then read the article for the full walkthrough.</p>
      </div>
      <div class="demo-grid">
        ${demoCards}
      </div>
    </section>
    ${sourceSection}
  </main>

  <footer class="site-footer">
    <p>Source repository: <a href="${escapeHtml(REPO_URL)}">github.com/omidfarhang/example-projects</a> · Articles on <a href="https://omid.dev/">omid.dev</a></p>
  </footer>
</body>
</html>`;

  ensureDir(DIST_ROOT);
  fs.writeFileSync(path.join(DIST_ROOT, 'index.html'), html, 'utf8');
}
