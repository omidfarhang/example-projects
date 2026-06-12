import fs from 'node:fs';
import path from 'node:path';
import { getActiveDistRoot } from './paths.mjs';
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
  lab: 'Lab',
};

function typeLabel(type, kind) {
  if (kind === 'lab') return 'Lab';
  return TYPE_LABELS[type] ?? type;
}

function uniqueTypes(targets) {
  return [...new Set(targets.map((t) => t.type))];
}

function renderCompanionCard(target, manifest) {
  const href = `/${target.category}/${target.slug}/`;
  const badge = typeLabel(target.type, target.kind);
  const sourcePath = getSourcePath(target);
  const sourceUrl = getSourceUrl(target, manifest);

  return `
        <article class="card card--companion" data-type="${escapeHtml(target.type)}">
          <div class="card__chrome" aria-hidden="true">
            <span class="card__dot"></span>
            <span class="card__dot"></span>
            <span class="card__dot"></span>
            <span class="card__url">${escapeHtml(`playground.omid.dev${href}`)}</span>
          </div>
          <div class="card__body">
            <div class="card__meta">
              <span class="card__badge">${escapeHtml(badge)}</span>
            </div>
            <h3 class="card__title"><a href="${escapeHtml(href)}">${escapeHtml(target.title)}</a></h3>
            <p class="card__article">Article: <a href="${escapeHtml(target.articleUrl)}">${escapeHtml(getArticleTitle(target))}</a></p>
            <p class="card__description">${escapeHtml(target.description)}</p>
            <code class="card__path">${escapeHtml(sourcePath)}</code>
            <div class="card__actions">
              <a class="btn btn--primary" href="${escapeHtml(href)}">Open demo</a>
              <a class="btn btn--secondary" href="${escapeHtml(target.articleUrl)}">Read article</a>
              <a class="btn btn--ghost" href="${escapeHtml(sourceUrl)}">Source</a>
            </div>
          </div>
        </article>`;
}

function renderLabCard(target, manifest) {
  const href = `/${target.category}/${target.slug}/`;
  const badge = typeLabel(target.type, target.kind);
  const sourcePath = getSourcePath(target);
  const sourceUrl = getSourceUrl(target, manifest);

  return `
        <article class="card card--lab">
          <div class="card__body">
            <div class="card__meta">
              <span class="card__badge card__badge--lab">${escapeHtml(badge)}</span>
              <span class="card__status">Interactive</span>
            </div>
            <h3 class="card__title"><a href="${escapeHtml(href)}">${escapeHtml(target.title)}</a></h3>
            <p class="card__description">${escapeHtml(target.description)}</p>
            <code class="card__path">${escapeHtml(sourcePath)}</code>
            <div class="card__actions">
              <a class="btn btn--lab" href="${escapeHtml(href)}">Enter lab</a>
              <a class="btn btn--ghost btn--ghost-on-dark" href="${escapeHtml(sourceUrl)}">Source</a>
            </div>
          </div>
        </article>`;
}

function renderSourceCard(project, manifest) {
  const repoHref = getSourceUrl(project, manifest);
  const articleTitle = getArticleTitle(project);

  return `
        <article class="card card--source">
          <div class="card__body card__body--row">
            <div class="card__main">
              <div class="card__meta">
                <span class="card__badge card__badge--source">${escapeHtml(project.reason)}</span>
              </div>
              <h3 class="card__title">${escapeHtml(project.title)}</h3>
              <p class="card__description">${escapeHtml(project.description)}</p>
            </div>
            <div class="card__actions card__actions--inline">
              <a class="btn btn--secondary" href="${escapeHtml(repoHref)}">Clone repo</a>
              <a class="btn btn--ghost" href="${escapeHtml(project.articleUrl)}">Article</a>
            </div>
          </div>
          <p class="card__article card__article--subtle">From: <a href="${escapeHtml(project.articleUrl)}">${escapeHtml(articleTitle)}</a></p>
        </article>`;
}

function renderStats(examples, labs, sourceOnly) {
  const stacks = uniqueTypes([...examples, ...labs]);

  return `
      <dl class="stats">
        <div class="stat">
          <dt class="stat__label">Companions</dt>
          <dd class="stat__value">${examples.length}</dd>
        </div>
        <div class="stat">
          <dt class="stat__label">Labs</dt>
          <dd class="stat__value">${labs.length}</dd>
        </div>
        <div class="stat">
          <dt class="stat__label">Stacks</dt>
          <dd class="stat__value">${stacks.length}</dd>
        </div>
        <div class="stat">
          <dt class="stat__label">Clone-only</dt>
          <dd class="stat__value">${sourceOnly.length}</dd>
        </div>
      </dl>`;
}

function renderSectionNav(examples, labs, sourceOnly) {
  const items = [];
  if (labs.length > 0) items.push('<a href="#labs">Labs</a>');
  if (examples.length > 0) items.push('<a href="#companions">Companions</a>');
  if (sourceOnly.length > 0) items.push('<a href="#clone-only">Clone-only</a>');
  if (items.length === 0) return '';

  return `
    <nav class="section-nav" aria-label="Sections">
      ${items.join('\n      ')}
    </nav>`;
}

export function writeLandingPage(manifest) {
  const { baseUrl, sourceOnly = [] } = manifest;
  const categories = manifest.categories ?? {};
  const examples = categories.examples ?? manifest.demos ?? [];
  const labs = categories.labs ?? [];
  const repoUrl = getRepoUrl(manifest);
  const canonicalUrl = `${baseUrl.replace(/\/$/, '')}/`;
  const title = `${PLAYGROUND_TITLE} | Live demos & labs for omid.dev`;
  const description =
    'Live companion demos and interactive labs for omid.dev articles. Try Angular, React, WebAssembly, Three.js simulations, and more in the browser.';
  const imageUrl = getOgImageUrl(manifest);
  const exampleCards = examples
    .map((demo) => renderCompanionCard({ ...demo, category: 'examples', kind: 'example' }, manifest))
    .join('\n');
  const labCards = labs
    .map((lab) => renderLabCard({ ...lab, category: 'labs', kind: lab.kind ?? 'lab' }, manifest))
    .join('\n');
  const sourceCards = sourceOnly.map((project) => renderSourceCard(project, manifest)).join('\n');
  const stats = renderStats(examples, labs, sourceOnly);
  const sectionNav = renderSectionNav(examples, labs, sourceOnly);

  const labsSection =
    labs.length > 0
      ? `
    <section class="zone zone--labs" id="labs">
      <header class="zone__header">
        <p class="zone__eyebrow">Interactive sandboxes</p>
        <h2 class="zone__title">Labs</h2>
        <p class="zone__lede">Standalone simulations you can poke at — deeper than article companions, built for exploration.</p>
      </header>
      <div class="lab-grid">
        ${labCards}
      </div>
    </section>`
      : '';

  const companionsSection =
    examples.length > 0
      ? `
    <section class="zone zone--companions" id="companions">
      <header class="zone__header">
        <p class="zone__eyebrow">Runnable in the browser</p>
        <h2 class="zone__title">Article companions</h2>
        <p class="zone__lede">Static builds hosted on Cloudflare Pages — open a demo, then read the post for context.</p>
      </header>
      <div class="companion-grid">
        ${exampleCards}
      </div>
    </section>`
      : '';

  const sourceSection =
    sourceOnly.length > 0
      ? `
    <section class="zone zone--source" id="clone-only">
      <header class="zone__header">
        <p class="zone__eyebrow">Needs local setup</p>
        <h2 class="zone__title">Clone-only companions</h2>
        <p class="zone__lede">Firebase, API servers, native Linux tooling, or notebooks — not yet runnable as static browser demos.</p>
      </header>
      <div class="source-list">
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
    imageAlt: 'Omid Playground - live demos and labs for omid.dev',
    keywords: PLAYGROUND_KEYWORDS,
    schema: landingSchema(manifest),
  })}
  ${faviconHead()}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>${landingPageCss()}</style>
</head>
<body>
  <header class="site-header">
    <div class="site-header__inner">
      <a class="site-brand" href="/">
        <span class="site-brand__prompt" aria-hidden="true">$</span>
        <span class="site-brand__name">playground</span>
        <span class="site-brand__domain">.omid.dev</span>
      </a>
      <nav class="site-nav" aria-label="Site">
        <a href="https://omid.dev/">Blog</a>
        <a href="${escapeHtml(repoUrl)}">GitHub</a>
      </nav>
    </div>
  </header>

  <section class="intro">
    <div class="intro__inner">
      <p class="intro__eyebrow">Companion demos &amp; interactive labs</p>
      <h1 class="intro__title">Try the ideas from <a href="https://omid.dev/">omid.dev</a> — in your browser.</h1>
      <p class="intro__lede">Open a lab or companion demo, break things, read the source. Every project links back to the article it came from.</p>
      ${stats}
      ${sectionNav}
    </div>
  </section>

  <main class="catalog">
    ${labsSection}
    ${companionsSection}
    ${sourceSection}
  </main>

  <footer class="site-footer">
    <p>All source: <a href="${escapeHtml(repoUrl)}">github.com/omidfarhang/example-projects</a> · Articles on <a href="https://omid.dev/">omid.dev</a></p>
  </footer>
</body>
</html>`;

  const distRoot = getActiveDistRoot();
  ensureDir(distRoot);
  fs.writeFileSync(path.join(distRoot, 'index.html'), html, 'utf8');
}
