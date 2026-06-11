import fs from 'node:fs';
import path from 'node:path';
import { getActiveDistRoot } from './paths.mjs';
import { ensureDir } from './fs-utils.mjs';

/** CSS custom properties aligned with omid.dev themes/omid-dev/assets/css/core/theme-vars.css */
export function themeVarsCss() {
  return `
    :root {
      color-scheme: light dark;
      --gap: 32px;
      --radius: 8px;
      --theme: #ffffff;
      --theme-rgb: 255, 255, 255;
      --primary: #0f172a;
      --primary-rgb: 15, 23, 42;
      --secondary: #64748b;
      --content: #334155;
      --code-bg: #f1f5f9;
      --border: #dbe4f0;
      --accent: #2563eb;
      --accent-rgb: 37, 99, 235;
      --accent-hover: #1d4ed8;
      --accent-light: #dbeafe;
      --accent-2: #4f46e5;
      --accent-2-rgb: 79, 70, 229;
      --accent-3-rgb: 8, 145, 178;
      --accent-border-soft: rgba(var(--accent-rgb), 0.14);
      --surface-tint: rgba(var(--accent-rgb), 0.06);
      --surface-tint-strong: rgba(var(--accent-rgb), 0.12);
      --page-bg: #f0f4fc;
      --hero-glow: rgba(var(--accent-rgb), 0.2);
      --hero-glow-2: rgba(var(--accent-2-rgb), 0.14);
      --hero-glow-3: rgba(var(--accent-3-rgb), 0.1);
      --shadow-sm: 0 1px 2px 0 rgba(15, 23, 42, 0.06);
      --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.05);
      --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.06);
      --shadow-accent: 0 8px 24px -6px rgba(var(--accent-rgb), 0.28);
      --main-width: 1200px;
      --pg-companion-height: 52px;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --theme: #0f172a;
        --theme-rgb: 15, 23, 42;
        --primary: #f1f5f9;
        --primary-rgb: 241, 245, 249;
        --secondary: #94a3b8;
        --content: #cbd5e1;
        --code-bg: #1e293b;
        --border: #334155;
        --accent: #60a5fa;
        --accent-rgb: 96, 165, 250;
        --accent-hover: #3b82f6;
        --accent-light: #1e3a8a;
        --accent-2: #818cf8;
        --accent-2-rgb: 129, 140, 248;
        --accent-3-rgb: 34, 211, 238;
        --accent-border-soft: rgba(var(--accent-rgb), 0.22);
        --surface-tint: rgba(var(--accent-rgb), 0.1);
        --surface-tint-strong: rgba(var(--accent-rgb), 0.18);
        --page-bg: #020617;
        --hero-glow: rgba(var(--accent-rgb), 0.28);
        --hero-glow-2: rgba(var(--accent-2-rgb), 0.22);
        --hero-glow-3: rgba(var(--accent-3-rgb), 0.14);
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -1px rgba(0, 0, 0, 0.25);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
        --shadow-accent: 0 8px 24px -6px rgba(var(--accent-rgb), 0.35);
      }
    }
  `;
}

export function companionFrameCss() {
  return `
    ${themeVarsCss()}

    .pg-companion {
      position: fixed;
      inset: 0 0 auto 0;
      z-index: 2147483000;
      height: var(--pg-companion-height);
      border-bottom: 1px solid var(--accent-border-soft);
      background:
        linear-gradient(135deg, var(--accent-light) 0%, rgba(var(--theme-rgb), 0.96) 58%, var(--surface-tint) 100%),
        rgba(var(--theme-rgb), 0.96);
      backdrop-filter: blur(10px);
      box-shadow: var(--shadow-sm);
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      font-size: 0.86rem;
      line-height: 1.35;
    }

    .pg-companion__inner {
      display: flex;
      align-items: center;
      gap: 14px;
      max-width: var(--main-width);
      height: 100%;
      margin: 0 auto;
      padding: 0 16px;
    }

    .pg-companion__brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      color: var(--secondary);
      white-space: nowrap;
    }

    .pg-companion__brand a {
      color: var(--primary);
      font-weight: 800;
      text-decoration: none;
      letter-spacing: -0.02em;
    }

    .pg-companion__brand a:hover {
      color: var(--accent);
    }

    .pg-companion__sep {
      color: var(--border);
    }

    .pg-companion__eyebrow {
      color: var(--accent);
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .pg-companion__content {
      display: flex;
      min-width: 0;
      flex: 1;
      flex-direction: column;
      gap: 1px;
    }

    .pg-companion__title {
      overflow: hidden;
      color: var(--primary);
      font-size: 0.88rem;
      font-weight: 750;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pg-companion__context {
      overflow: hidden;
      color: var(--secondary);
      font-size: 0.76rem;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pg-companion__actions {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      gap: 8px;
    }

    .pg-companion__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 32px;
      padding: 6px 12px;
      border: 1px solid transparent;
      border-radius: 999px;
      color: var(--accent);
      background: rgba(var(--theme-rgb), 0.72);
      font-size: 0.78rem;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
      transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
    }

    .pg-companion__btn:hover {
      border-color: var(--accent);
      color: var(--accent-hover);
      box-shadow: var(--shadow-sm);
    }

    .pg-companion__btn--primary {
      color: var(--theme);
      background: var(--accent);
      border-color: var(--accent);
    }

    .pg-companion__btn--primary:hover {
      color: #fff;
      background: var(--accent-hover);
      border-color: var(--accent-hover);
      box-shadow: var(--shadow-accent);
    }

    html.pg-has-companion-bar,
    html.pg-has-companion-bar body {
      scroll-padding-top: var(--pg-companion-height);
    }

    html.pg-has-companion-bar body {
      padding-top: var(--pg-companion-height) !important;
    }

    @media screen and (max-width: 768px) {
      :root {
        --pg-companion-height: 64px;
      }

      .pg-companion__inner {
        gap: 10px;
        padding: 0 12px;
      }

      .pg-companion__context,
      .pg-companion__sep,
      .pg-companion__eyebrow {
        display: none;
      }

      .pg-companion__btn--secondary {
        display: none;
      }
    }
  `;
}

export function landingPageCss() {
  return `
    ${themeVarsCss()}

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
      max-width: 20ch;
    }
    .hero__lede {
      margin: 0;
      font-size: 1.08rem;
      color: var(--secondary);
      max-width: 62ch;
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
    .demo-card__article,
    .source-card__article {
      margin: 0;
      font-size: 0.82rem;
      color: var(--accent);
      font-weight: 650;
      line-height: 1.4;
    }
    .demo-card__article a,
    .source-card__article a {
      color: inherit;
      text-decoration: none;
    }
    .demo-card__article a:hover,
    .source-card__article a:hover {
      text-decoration: underline;
    }
    .demo-card__source {
      display: block;
      overflow: hidden;
      width: fit-content;
      max-width: 100%;
      padding: 4px 8px;
      color: var(--accent);
      background: var(--code-bg);
      border-radius: 8px;
      font-size: 0.76rem;
      line-height: 1.35;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
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
  `;
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function faviconHead() {
  return `
  <link rel="icon" href="https://omid.dev/logo/favicon.ico" />
  <link rel="icon" type="image/png" sizes="16x16" href="https://omid.dev/logo/favicon-16x16.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="https://omid.dev/logo/favicon-32x32.png" />
  <link rel="apple-touch-icon" href="https://omid.dev/logo/apple-touch-icon.png" />
  <link rel="mask-icon" href="https://omid.dev/logo/safari-pinned-tab.svg" />`;
}

export function writeSharedAssets() {
  const assetsDir = path.join(getActiveDistRoot(), 'assets');
  ensureDir(assetsDir);
  fs.writeFileSync(path.join(assetsDir, 'companion-frame.css'), companionFrameCss(), 'utf8');
}
