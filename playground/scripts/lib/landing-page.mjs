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
  lab: 'Lab',
};

function typeLabel(type, kind) {
  if (kind === 'lab') return 'Lab';
  return TYPE_LABELS[type] ?? type;
}

function uniqueTypes(targets) {
  return [...new Set(targets.map((t) => t.type))];
}

function renderDemoCard(target, manifest) {
  const href = `/${target.category}/${target.slug}/`;
  const badge = typeLabel(target.type, target.kind);
  const sourcePath = getSourcePath(target);
  const sourceUrl = getSourceUrl(target, manifest);
  const isLab = target.kind === 'lab' || target.category === 'labs';

  const articleBlock = isLab
    ? ''
    : `<p class="demo-card__article">Article: <a href="${escapeHtml(target.articleUrl)}">${escapeHtml(getArticleTitle(target))}</a></p>`;

  const actions = isLab
    ? `<a class="btn btn--primary" href="${escapeHtml(href)}">Open lab</a>
            <a class="btn btn--secondary" href="${escapeHtml(sourceUrl)}">View source</a>`
    : `<a class="btn btn--primary" href="${escapeHtml(href)}">Open live demo</a>
            <a class="btn btn--secondary" href="${escapeHtml(target.articleUrl)}">Read article</a>
            <a class="btn btn--ghost" href="${escapeHtml(sourceUrl)}">View source</a>`;

  return `
        <article class="demo-card">
          <div class="demo-card__meta">
            <span class="demo-card__badge">${escapeHtml(badge)}</span>
          </div>
          <h3><a href="${escapeHtml(href)}">${escapeHtml(target.title)}</a></h3>
          ${articleBlock}
          <p class="demo-card__description">${escapeHtml(target.description)}</p>
          <code class="demo-card__source">${escapeHtml(sourcePath)}</code>
          <div class="demo-card__actions">
            ${actions}
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

function renderStats(examples, labs, sourceOnly) {
  const types = uniqueTypes([...examples, ...labs]);
  const sourceCount = sourceOnly.length;

  return `
      <div class="stats">
        <div class="stat">
          <span class="stat__value">${examples.length}</span>
          <span class="stat__label">Companions</span>
        </div>
        <div class="stat">
          <span class="stat__value">${labs.length}</span>
          <span class="stat__label">Labs</span>
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
  const exampleCards = examples.map((demo) => renderDemoCard({ ...demo, category: 'examples', kind: 'example' }, manifest)).join('\n');
  const labCards = labs.map((lab) => renderDemoCard({ ...lab, category: 'labs', kind: lab.kind ?? 'lab' }, manifest)).join('\n');
  const sourceCards = sourceOnly.map((project) => renderSourceCard(project, manifest)).join('\n');
  const stats = renderStats(examples, labs, sourceOnly);

  const labsSection =
    labs.length > 0
      ? `
    <section class="panel" id="labs">
      <div class="section-header">
        <p class="section-eyebrow">Interactive</p>
        <h2>Playground labs</h2>
        <p class="section-lede">Standalone simulations and sandboxes — deeper than article companions, linked from health and tech posts.</p>
      </div>
      <div class="demo-grid">
        ${labCards}
      </div>
    </section>`
      : '';

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
    imageAlt: 'Omid Playground - live demos and labs for omid.dev',
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
        ${labs.length > 0 ? '<a href="#labs">Labs</a>' : ''}
      </nav>
    </div>
  </header>

  <section class="hero">
    <div class="hero__inner">
      <p class="hero__eyebrow">Demos &amp; labs</p>
      <h1>Working examples for omid.dev posts</h1>
      <p class="hero__lede">Article companions you can run in the browser, plus interactive labs for deeper exploration. Open a demo, try the idea, then read the post for context and implementation details.</p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="#live-demos">Browse companions</a>
        ${labs.length > 0 ? '<a class="btn btn--secondary" href="#labs">Explore labs</a>' : ''}
        <a class="btn btn--ghost" href="${escapeHtml(repoUrl)}">View source on GitHub</a>
      </div>
      ${stats}
    </div>
  </section>

  <main class="content">
    <section class="panel" id="live-demos">
      <div class="section-header">
        <p class="section-eyebrow">In your browser</p>
        <h2>Article companions</h2>
        <p class="section-lede">Static builds hosted on Cloudflare Pages. Every card links to its article, source folder, and runnable demo.</p>
      </div>
      <div class="demo-grid">
        ${exampleCards}
      </div>
    </section>
    ${labsSection}
    ${sourceSection}
  </main>

  <footer class="site-footer">
    <p>Source repository: <a href="${escapeHtml(repoUrl)}">github.com/omidfarhang/example-projects</a> · Articles on <a href="https://omid.dev/">omid.dev</a></p>
  </footer>
</body>
</html>`;

  const distRoot = getActiveDistRoot();
  ensureDir(distRoot);
  fs.writeFileSync(path.join(distRoot, 'index.html'), html, 'utf8');
}
