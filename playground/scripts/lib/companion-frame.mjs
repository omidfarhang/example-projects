import fs from 'node:fs';
import path from 'node:path';
import { fileExists } from './fs-utils.mjs';
import {
  getArticleContext,
  getArticleTitle,
  getDemoPublicUrl,
  getLandingUrl,
  getSourceUrl,
  SITE_URL,
} from './manifest-utils.mjs';
import { distDemoDir } from './paths.mjs';
import { escapeHtml } from './theme.mjs';

const COMPANION_ASSET = '/assets/companion-frame.css';

function renderCompanionBar(demo, manifest) {
  const articleTitle = getArticleTitle(demo);
  const articleContext = getArticleContext(demo);
  const articleUrl = demo.articleUrl;
  const sourceUrl = getSourceUrl(demo, manifest);
  const landingUrl = getLandingUrl(manifest);

  return `
  <header class="pg-companion" data-playground-companion-bar aria-label="Article companion demo">
    <div class="pg-companion__inner">
      <div class="pg-companion__brand">
        <a href="${escapeHtml(SITE_URL)}/">omid.dev</a>
        <span class="pg-companion__sep" aria-hidden="true">·</span>
        <span class="pg-companion__eyebrow">Companion demo</span>
      </div>
      <div class="pg-companion__content">
        <div class="pg-companion__title">${escapeHtml(demo.title)}</div>
        <div class="pg-companion__context">From article: ${escapeHtml(articleTitle)}</div>
      </div>
      <nav class="pg-companion__actions" aria-label="Companion links">
        <a class="pg-companion__btn pg-companion__btn--primary" href="${escapeHtml(articleUrl)}">Read article</a>
        <a class="pg-companion__btn pg-companion__btn--secondary" href="${escapeHtml(sourceUrl)}">View source</a>
        <a class="pg-companion__btn" href="${escapeHtml(landingUrl)}">All demos</a>
      </nav>
    </div>
  </header>`;
}

function renderMetaTags(demo, manifest) {
  const demoUrl = getDemoPublicUrl(manifest, demo, manifest.category ?? 'examples');
  const articleTitle = getArticleTitle(demo);
  const description = `${demo.description} Companion demo for the omid.dev article “${articleTitle}”.`;

  return `
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(demoUrl)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="omid.dev" />
  <meta property="og:title" content="${escapeHtml(`${demo.title} — omid.dev companion demo`)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(demoUrl)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${escapeHtml(`${demo.title} — omid.dev companion demo`)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />`;
}

function injectIntoHead(html, injection) {
  if (html.includes('data-playground-companion-meta')) {
    return html;
  }

  if (html.includes('</head>')) {
    return html.replace('</head>', `${injection}\n</head>`);
  }

  return html;
}

function injectStylesheetLink(html) {
  if (html.includes(COMPANION_ASSET)) {
    return html;
  }

  const link = `<link rel="stylesheet" href="${COMPANION_ASSET}" data-playground-companion-styles />`;
  return injectIntoHead(html, link);
}

function injectMetaTags(html, demo, manifest) {
  const meta = renderMetaTags(demo, manifest).replace(
    '<meta name="description"',
    '<meta data-playground-companion-meta name="description"',
  );
  return injectIntoHead(html, meta);
}

function injectCompanionBar(html, demo, manifest) {
  if (html.includes('data-playground-companion-bar')) {
    return html;
  }

  const bar = renderCompanionBar(demo, manifest);

  const bodyMatch = html.match(/<body([^>]*)>/i);
  if (bodyMatch) {
    const bodyTag = bodyMatch[0];
    const hasClass = /class\s*=/.test(bodyMatch[1]);
    let newBodyTag;

    if (hasClass) {
      newBodyTag = bodyTag.replace(/class=(["'])(.*?)\1/i, (_, quote, classes) => {
        const next = classes.includes('pg-has-companion-bar')
          ? classes
          : `${classes} pg-has-companion-bar`.trim();
        return `class=${quote}${next}${quote}`;
      });
    } else {
      newBodyTag = bodyTag.replace('<body', '<body class="pg-has-companion-bar"');
    }

    html = html.replace(bodyTag, newBodyTag);
    return html.replace(newBodyTag, `${newBodyTag}${bar}`);
  }

  return `${bar}${html}`;
}

function injectHtmlClass(html) {
  if (html.includes('pg-has-companion-bar')) {
    return html;
  }

  const htmlMatch = html.match(/<html([^>]*)>/i);
  if (!htmlMatch) {
    return html;
  }

  const htmlTag = htmlMatch[0];
  const hasClass = /class\s*=/.test(htmlMatch[1]);

  if (hasClass) {
    const newHtmlTag = htmlTag.replace(/class=(["'])(.*?)\1/i, (_, quote, classes) => {
      const next = classes.includes('pg-has-companion-bar')
        ? classes
        : `${classes} pg-has-companion-bar`.trim();
      return `class=${quote}${next}${quote}`;
    });
    return html.replace(htmlTag, newHtmlTag);
  }

  return html.replace(htmlTag, htmlTag.replace('<html', '<html class="pg-has-companion-bar"'));
}

function updateDocumentTitle(html, demo) {
  const title = `${demo.title} — omid.dev companion demo`;
  if (html.includes('<title>')) {
    return html.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(title)}</title>`);
  }
  return injectIntoHead(html, `<title>${escapeHtml(title)}</title>`);
}

export function injectCompanionFrame(demo, category, manifest) {
  const indexPath = path.join(distDemoDir(demo.slug, category), 'index.html');
  if (!fileExists(indexPath)) {
    console.warn(`  ⚠ No index.html to wrap for ${demo.slug}`);
    return;
  }

  let html = fs.readFileSync(indexPath, 'utf8');
  html = injectHtmlClass(html);
  html = injectStylesheetLink(html);
  html = injectMetaTags(html, demo, manifest);
  html = updateDocumentTitle(html, demo);
  html = injectCompanionBar(html, demo, manifest);

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`  ✓ Companion frame injected for ${demo.slug}`);
}
