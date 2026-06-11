import fs from 'node:fs';
import path from 'node:path';
import { getActiveDistRoot, PLAYGROUND_ROOT } from './paths.mjs';
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
const PLAYGROUND_OG_IMAGE_PATH = '/assets/og-image.png';
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
  const imagePath = manifest.generatedOgImagePath ?? PLAYGROUND_OG_IMAGE_PATH;
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
        itemListElement: getAllBuildTargets(manifest).map((target, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: getDemoPublicUrl(manifest, target, target.category),
          name: target.title,
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

export function writeSeoAssets(manifest, selectedTargets = null) {
  const baseUrl = getLandingUrl(manifest);
  const distRoot = getActiveDistRoot();
  const assetsDir = path.join(distRoot, 'assets');
  ensureDir(assetsDir);

  const ogImageSourcePath = path.join(PLAYGROUND_ROOT, 'assets', 'og-image.png');
  const ogImageDistPath = path.join(assetsDir, 'og-image.png');

  fs.copyFileSync(ogImageSourcePath, ogImageDistPath);
  manifest.generatedOgImagePath = PLAYGROUND_OG_IMAGE_PATH;
  fs.writeFileSync(path.join(distRoot, 'robots.txt'), renderRobotsTxt(baseUrl), 'utf8');
  fs.writeFileSync(path.join(distRoot, 'sitemap.xml'), renderSitemapXml(manifest, selectedTargets), 'utf8');
}

function renderRobotsTxt(baseUrl) {
  return `User-agent: *
Allow: /

Sitemap: ${baseUrl.replace(/\/$/, '')}/sitemap.xml
`;
}

function getAllBuildTargets(manifest) {
  const categories = manifest.categories ?? {};
  const examples = (categories.examples ?? manifest.demos ?? []).map((d) => ({ ...d, category: 'examples' }));
  const labs = (categories.labs ?? []).map((d) => ({ ...d, category: 'labs' }));
  return [...examples, ...labs];
}

function renderSitemapXml(manifest, selectedTargets = null) {
  let targets = getAllBuildTargets(manifest);
  if (selectedTargets) {
    const slugs = new Set(selectedTargets.map((t) => t.slug));
    targets = targets.filter((t) => slugs.has(t.slug));
  }

  const urls = [
    {
      loc: getLandingUrl(manifest),
      priority: '1.0',
      changefreq: 'weekly',
    },
    ...targets.map((target) => ({
      loc: getDemoPublicUrl(manifest, target, target.category),
      priority: target.category === 'labs' ? '0.85' : '0.8',
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

