import fs from 'node:fs';
import path from 'node:path';
import { DIST_ROOT } from './paths.mjs';
import { ensureDir } from './fs-utils.mjs';
import {
  getArticleTitle,
  getRepoUrl,
  getSourcePath,
  getSourceUrl,
} from './manifest-utils.mjs';
import {
  getOgImageUrl,
  landingSchema,
  PLAYGROUND_DESCRIPTION,
  PLAYGROUND_KEYWORDS,
  PLAYGROUND_TITLE,
  renderSeoHead,
} from './seo.mjs';
import { escapeHtml, faviconHead, landingPageCss } from './theme.mjs';

const TYPE_LABELS = {
  angular: 'Angular',
  'rust-wasm': 'Rust / WASM',
  'qwik-mfe': 'Micro Frontends',
  'stencil-angular': 'Web Components',
  'angular-workspace': 'Angular Workspace',
  vite: 'React / Vite',
  'static-html': 'CSS',
};

function typeLabel(type) {
  return TYPE_LABELS[type] ?? type;
}

function uniqueTypes(demos) {
  return [...new Set(demos.map((demo) => demo.type))];
}

function renderDemoCard(demo, category, manifest) {
  const href = `/${category}/${demo.slug}/`;
  const badge = typeLabel(demo.type);
  const articleTitle = getArticleTitle(demo);
  const sourcePath = getSourcePath(demo);
  const sourceUrl = getSourceUrl(demo, manifest);

  return `
        <article class="demo-card">
          <div class="demo-card__meta">
            <span class="demo-card__badge">${escapeHtml(badge)}</span>
          </div>
          <h3><a href="${escapeHtml(href)}">${escapeHtml(demo.title)}</a></h3>
          <p class="demo-card__article">Article: <a href="${escapeHtml(demo.articleUrl)}">${escapeHtml(articleTitle)}</a></p>
          <p class="demo-card__description">${escapeHtml(demo.description)}</p>
          <code class="demo-card__source">${escapeHtml(sourcePath)}</code>
          <div class="demo-card__actions">
            <a class="btn btn--primary" href="${escapeHtml(href)}">Open live demo</a>
            <a class="btn btn--secondary" href="${escapeHtml(demo.articleUrl)}">Read article</a>
            <a class="btn btn--ghost" href="${escapeHtml(sourceUrl)}">View source</a>
          </div>
        </article>`;
}

function renderSourceCard(project, manifest) {
  const repoHref = getSourceUrl(project, manifest);
  const articleTitle = getArticleTitle(project);

  return `
        <article class="source-card">
          <div class="source-card__meta">
            <span class="source-card__badge">${escapeHtml(project.reason)}</span>
          </div>
          <h3>${escapeHtml(project.title)}</h3>
          <p class="source-card__article">Article: <a href="${escapeHtml(project.articleUrl)}">${escapeHtml(articleTitle)}</a></p>
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
  const repoUrl = getRepoUrl(manifest);
  const canonicalUrl = `${baseUrl.replace(/\/$/, '')}/`;
  const title = `${PLAYGROUND_TITLE} | Live companion demos for omid.dev`;
  const description = PLAYGROUND_DESCRIPTION;
  const imageUrl = getOgImageUrl(manifest);
  const demoCards = demos.map((demo) => renderDemoCard(demo, category, manifest)).join('\n');
  const sourceCards = sourceOnly.map((project) => renderSourceCard(project, manifest)).join('\n');
  const stats = renderStats(demos, sourceOnly);
  const sourceSection =
    sourceOnly.length > 0
      ? `
      <section class="panel">
        <div class="section-header">
          <p class="section-eyebrow">Clone &amp; run</p>
          <h2>Source-only companions</h2>
          <p class="section-lede">These article companions need Firebase, a local API server, native Linux tooling, or other setup that does not fit a static browser demo yet. Each one still links back to the article it supports.</p>
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
  <title>${escapeHtml(title)}</title>
  ${renderSeoHead({
    title,
    description,
    canonicalUrl,
    imageUrl,
    imageAlt: 'Omid Playground - live companion demos for omid.dev articles',
    keywords: PLAYGROUND_KEYWORDS,
    schema: landingSchema(manifest),
  })}
  ${faviconHead()}
  <style>${landingPageCss()}</style>
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
      <p class="hero__eyebrow">Article companions</p>
      <h1>Working examples for omid.dev posts</h1>
      <p class="hero__lede">Each demo belongs to a specific article. Open the companion, try the idea in your browser, then read the post for context, tradeoffs, and the full implementation walkthrough.</p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="#live-demos">Browse companions</a>
        <a class="btn btn--secondary" href="${escapeHtml(repoUrl)}">View source on GitHub</a>
      </div>
      ${stats}
    </div>
  </section>

  <main class="content">
    <section class="panel" id="live-demos">
      <div class="section-header">
        <p class="section-eyebrow">In your browser</p>
        <h2>Live companions</h2>
        <p class="section-lede">Static builds hosted on Cloudflare Pages. Every card links to its article, source folder, and runnable demo.</p>
      </div>
      <div class="demo-grid">
        ${demoCards}
      </div>
    </section>
    ${sourceSection}
  </main>

  <footer class="site-footer">
    <p>Source repository: <a href="${escapeHtml(repoUrl)}">github.com/omidfarhang/example-projects</a> · Articles on <a href="https://omid.dev/">omid.dev</a></p>
  </footer>
</body>
</html>`;

  ensureDir(DIST_ROOT);
  fs.writeFileSync(path.join(DIST_ROOT, 'index.html'), html, 'utf8');
}
