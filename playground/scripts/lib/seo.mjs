import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DIST_ROOT } from './paths.mjs';
import { ensureDir } from './fs-utils.mjs';
import {
  getArticleTitle,
  getDemoPublicUrl,
  getLandingUrl,
  getRepoUrl,
  getSourceUrl,
  SITE_URL,
} from './manifest-utils.mjs';
import { escapeHtml } from './theme.mjs';

export const PLAYGROUND_TITLE = 'Omid Playground';
export const PLAYGROUND_SITE_NAME = 'omid.dev';
export const PLAYGROUND_AUTHOR = 'Omid Farhang';
export const PLAYGROUND_DESCRIPTION =
  'Live companion demos for omid.dev technical articles. Try Angular, React, WebAssembly, Web Workers, micro frontends, Web Components, and CSS migration examples in the browser.';
export const PLAYGROUND_KEYWORDS = [
  'Omid Farhang',
  'omid.dev',
  'Frontend',
  'Angular',
  'React',
  'TypeScript',
  'WebAssembly',
  'Rust',
  'Web Workers',
  'Micro Frontends',
  'Web Components',
  'Frontend Architecture',
  'Live Demos',
  'Companion Projects',
];

export function getOgImageUrl(manifest) {
  const imagePath = manifest.generatedOgImagePath ?? '/assets/og-image.svg';
  return `${getLandingUrl(manifest).replace(/\/$/, '')}${imagePath}`;
}

function renderKeywords(keywords = PLAYGROUND_KEYWORDS) {
  return keywords.join(', ');
}

export function renderMatomo() {
  return `<!-- Matomo -->
<script>
  var _paq = window._paq = window._paq || [];
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(["setCookieDomain", "*.omid.dev"]);
  _paq.push(["setDoNotTrack", true]);
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="https://analytics.omid.dev/";
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', '1']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
  })();
</script>
<noscript><p><img referrerpolicy="no-referrer-when-downgrade" src="https://analytics.omid.dev/matomo.php?idsite=1&amp;rec=1" style="border:0;" alt="" /></p></noscript>
<!-- End Matomo Code -->`;
}

export function renderSeoHead({
  title,
  description,
  canonicalUrl,
  imageUrl,
  imageAlt = title,
  keywords = PLAYGROUND_KEYWORDS,
  type = 'website',
  schema,
}) {
  const imageType = imageUrl.endsWith('.png')
    ? 'image/png'
    : imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg')
      ? 'image/jpeg'
      : 'image/svg+xml';

  return `
  <meta name="robots" content="index, follow" />
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="author" content="${escapeHtml(PLAYGROUND_AUTHOR)}" />
  <meta name="keywords" content="${escapeHtml(renderKeywords(keywords))}" />
  <meta name="application-name" content="${escapeHtml(PLAYGROUND_TITLE)}" />
  <meta name="theme-color" content="#2563eb" />
  <meta name="msapplication-TileColor" content="#0f172a" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <link rel="home" href="${escapeHtml(SITE_URL)}/" />
  <link rel="me" href="https://github.com/omidfarhang" />
  <link rel="me" href="https://x.com/omidfarhangen" />
  <link rel="me" href="https://bsky.app/profile/omid.dev" />
  <link rel="me" href="https://mastodon.social/@omidfarhang" />
  <meta property="og:type" content="${escapeHtml(type)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:site_name" content="${escapeHtml(PLAYGROUND_SITE_NAME)}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />
  <meta property="og:image:type" content="${imageType}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@omidfarhangen" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  <meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />${
    schema
      ? `
  <script type="application/ld+json">${JSON.stringify(schema)}</script>`
      : ''
  }
  ${renderMatomo()}`;
}

export function landingSchema(manifest) {
  const url = getLandingUrl(manifest);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${url}#website`,
        name: PLAYGROUND_TITLE,
        url,
        description: PLAYGROUND_DESCRIPTION,
        publisher: {
          '@id': `${SITE_URL}/#person`,
        },
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: PLAYGROUND_AUTHOR,
        url: SITE_URL,
        sameAs: [
          'https://github.com/omidfarhang',
          'https://linkedin.com/in/omidfarhang',
          'https://x.com/omidfarhangen',
          'https://bsky.app/profile/omid.dev',
          'https://mastodon.social/@omidfarhang',
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#live-demos`,
        name: 'Live companion demos',
        itemListElement: manifest.demos.map((demo, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: getDemoPublicUrl(manifest, demo, manifest.category ?? 'examples'),
          name: demo.title,
        })),
      },
    ],
  };
}

export function demoSchema(manifest, demo) {
  const url = getDemoPublicUrl(manifest, demo, manifest.category ?? 'examples');
  const articleTitle = getArticleTitle(demo);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: demo.title,
    url,
    description: demo.description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web browser',
    isPartOf: {
      '@type': 'WebSite',
      name: PLAYGROUND_TITLE,
      url: getLandingUrl(manifest),
    },
    author: {
      '@type': 'Person',
      name: PLAYGROUND_AUTHOR,
      url: SITE_URL,
    },
    codeRepository: getSourceUrl(demo, manifest),
    discussionUrl: demo.articleUrl,
    about: {
      '@type': 'TechArticle',
      headline: articleTitle,
      url: demo.articleUrl,
    },
  };
}

export function demoDescription(demo) {
  return `${demo.description} Live companion demo for the omid.dev article "${getArticleTitle(demo)}".`;
}

export function demoTitle(demo) {
  return `${demo.title} | Omid Playground`;
}

export function writeSeoAssets(manifest) {
  const baseUrl = getLandingUrl(manifest);
  const assetsDir = path.join(DIST_ROOT, 'assets');
  ensureDir(assetsDir);

  const svgPath = path.join(assetsDir, 'og-image.svg');
  const pngPath = path.join(assetsDir, 'og-image.png');

  fs.writeFileSync(svgPath, renderOgImage(), 'utf8');
  if (tryRenderPng(svgPath, pngPath)) {
    manifest.generatedOgImagePath = '/assets/og-image.png';
  } else {
    manifest.generatedOgImagePath = '/assets/og-image.svg';
  }
  fs.writeFileSync(path.join(DIST_ROOT, 'robots.txt'), renderRobotsTxt(baseUrl), 'utf8');
  fs.writeFileSync(path.join(DIST_ROOT, 'sitemap.xml'), renderSitemapXml(manifest), 'utf8');
}

function tryRenderPng(svgPath, pngPath) {
  for (const command of ['magick', 'convert']) {
    const check = spawnSync(command, ['-version'], { stdio: 'ignore' });
    if (check.status !== 0) {
      continue;
    }

    const result = spawnSync(command, [svgPath, pngPath], { stdio: 'ignore' });
    return result.status === 0 && fs.existsSync(pngPath);
  }

  return false;
}

function renderRobotsTxt(baseUrl) {
  return `User-agent: *
Allow: /

Sitemap: ${baseUrl.replace(/\/$/, '')}/sitemap.xml
`;
}

function renderSitemapXml(manifest) {
  const urls = [
    {
      loc: getLandingUrl(manifest),
      priority: '1.0',
      changefreq: 'weekly',
    },
    ...manifest.demos.map((demo) => ({
      loc: getDemoPublicUrl(manifest, demo, manifest.category ?? 'examples'),
      priority: '0.8',
      changefreq: 'monthly',
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url>
    <loc>${escapeHtml(item.loc)}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
}

function renderOgImage() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">Omid Playground - Live companion demos</title>
  <desc id="desc">OpenGraph image for playground.omid.dev, live browser demos for omid.dev articles.</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="48%" stop-color="#dbeafe"/>
      <stop offset="100%" stop-color="#eef2ff"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#0f172a" flood-opacity="0.14"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1040" cy="80" r="220" fill="#2563eb" opacity="0.12"/>
  <circle cx="120" cy="580" r="220" fill="#0891b2" opacity="0.1"/>
  <rect x="76" y="70" width="1048" height="490" rx="38" fill="#ffffff" opacity="0.84" filter="url(#shadow)"/>
  <rect x="76" y="70" width="1048" height="490" rx="38" fill="none" stroke="#bfdbfe" stroke-width="2"/>
  <circle cx="146" cy="142" r="28" fill="url(#brand)"/>
  <text x="190" y="153" fill="#0f172a" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="34" font-weight="800">omid.dev</text>
  <text x="112" y="252" fill="#2563eb" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="24" font-weight="800" letter-spacing="5">ARTICLE COMPANIONS</text>
  <text x="112" y="336" fill="#0f172a" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="66" font-weight="850">Omid Playground</text>
  <text x="112" y="400" fill="#334155" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="32" font-weight="500">Live demos for Angular, React, WebAssembly,</text>
  <text x="112" y="444" fill="#334155" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="32" font-weight="500">Web Workers, micro frontends, and more.</text>
  <g transform="translate(112 492)">
    <rect width="192" height="46" rx="23" fill="#0f172a"/>
    <text x="28" y="31" fill="#ffffff" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="20" font-weight="800">Try live demos</text>
    <rect x="216" width="238" height="46" rx="23" fill="#eff6ff" stroke="#bfdbfe"/>
    <text x="244" y="31" fill="#2563eb" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="20" font-weight="800">Read the articles</text>
  </g>
</svg>
`;
}
