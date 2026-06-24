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

    .pg-companion__menu {
      position: relative;
    }

    .pg-companion__menu > summary {
      list-style: none;
      cursor: pointer;
    }

    .pg-companion__menu > summary::-webkit-details-marker {
      display: none;
    }

    .pg-companion__menu > summary::after {
      content: "▾";
      margin-left: 0.35rem;
      font-size: 0.65rem;
      opacity: 0.85;
    }

    .pg-companion__menu[open] > summary::after {
      content: "▴";
    }

    .pg-companion__menu-panel {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      z-index: 20;
      display: flex;
      flex-direction: column;
      min-width: min(22rem, 80vw);
      padding: 0.35rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--theme);
      box-shadow: var(--shadow-lg);
    }

    .pg-companion__menu-item {
      display: block;
      padding: 0.55rem 0.75rem;
      border-radius: calc(var(--radius) - 2px);
      color: var(--content);
      font-size: 0.78rem;
      font-weight: 600;
      line-height: 1.35;
      text-decoration: none;
      white-space: normal;
    }

    .pg-companion__menu-item:hover {
      color: var(--accent-hover);
      background: var(--surface-tint);
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

    :root {
      --font-sans: "IBM Plex Sans", system-ui, -apple-system, sans-serif;
      --font-mono: "IBM Plex Mono", ui-monospace, "Cascadia Code", monospace;
      --lab-bg: #050b14;
      --lab-panel: #0c1628;
      --lab-border: #1e3a5f;
      --lab-text: #e2e8f0;
      --lab-muted: #94a3b8;
      --lab-accent: #38bdf8;
      --lab-glow: rgba(56, 189, 248, 0.15);
      --grid-dot: rgba(var(--accent-rgb), 0.08);
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --grid-dot: rgba(var(--accent-rgb), 0.12);
      }
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: var(--font-sans);
      background:
        radial-gradient(ellipse 70% 50% at 50% -10%, var(--hero-glow), transparent 60%),
        radial-gradient(circle at 1px 1px, var(--grid-dot) 1px, transparent 0) 0 0 / 24px 24px,
        var(--page-bg);
      color: var(--content);
      line-height: 1.6;
    }

    a { color: var(--accent); }
    a:hover { color: var(--accent-hover); }

    .site-header {
      border-bottom: 1px solid var(--border);
      background: rgba(var(--theme-rgb), 0.92);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 20;
    }

    .site-header__inner {
      max-width: var(--main-width);
      margin: 0 auto;
      padding: 12px var(--gap);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .site-brand {
      display: inline-flex;
      align-items: baseline;
      gap: 0;
      text-decoration: none;
      font-family: var(--font-mono);
      font-size: 0.95rem;
      font-weight: 500;
      letter-spacing: -0.01em;
    }

    .site-brand__prompt {
      color: var(--accent);
      margin-right: 6px;
      font-weight: 600;
    }

    .site-brand__name {
      color: var(--primary);
      font-weight: 600;
    }

    .site-brand__domain {
      color: var(--secondary);
      font-weight: 400;
    }

    .site-nav {
      display: flex;
      gap: 20px;
    }

    .site-nav a {
      text-decoration: none;
      font-size: 0.86rem;
      font-weight: 600;
      color: var(--secondary);
    }

    .site-nav a:hover { color: var(--accent); }

    .intro {
      padding: 40px var(--gap) 32px;
      border-bottom: 1px solid var(--border);
    }

    .intro__inner {
      max-width: var(--main-width);
      margin: 0 auto;
      display: grid;
      gap: 18px;
    }

    .intro__eyebrow {
      margin: 0;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .intro__title {
      margin: 0;
      font-size: clamp(1.65rem, 3.5vw, 2.35rem);
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.03em;
      color: var(--primary);
      max-width: 28ch;
    }

    .intro__title a {
      color: inherit;
      text-decoration: underline;
      text-decoration-color: var(--accent-border-soft);
      text-underline-offset: 3px;
    }

    .intro__title a:hover {
      color: var(--accent);
      text-decoration-color: var(--accent);
    }

    .intro__lede {
      margin: 0;
      font-size: 1.02rem;
      color: var(--secondary);
      max-width: 58ch;
    }

    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 4px 0 0;
      padding: 0;
    }

    .stat {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin: 0;
      padding: 6px 12px;
      background: var(--theme);
      border: 1px solid var(--border);
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 0.78rem;
    }

    .stat__label {
      margin: 0;
      color: var(--secondary);
      font-weight: 400;
      text-transform: lowercase;
    }

    .stat__value {
      margin: 0;
      color: var(--primary);
      font-weight: 600;
    }

    .section-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 6px;
    }

    .section-nav a {
      display: inline-flex;
      align-items: center;
      padding: 7px 14px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--theme);
      color: var(--primary);
      font-size: 0.84rem;
      font-weight: 600;
      text-decoration: none;
      transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
    }

    .section-nav a:hover {
      border-color: var(--accent);
      color: var(--accent);
      background: var(--surface-tint);
    }

    .catalog {
      max-width: var(--main-width);
      margin: 0 auto;
      padding: 40px var(--gap) 64px;
      display: grid;
      gap: 48px;
    }

    .zone__header {
      margin-bottom: 22px;
    }

    .zone__eyebrow {
      margin: 0 0 6px;
      font-family: var(--font-mono);
      font-size: 0.68rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .zone__title {
      margin: 0 0 8px;
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--primary);
    }

    .zone__lede {
      margin: 0;
      font-size: 0.94rem;
      color: var(--secondary);
      max-width: 58ch;
    }

    .zone--labs {
      padding: 28px;
      background:
        radial-gradient(ellipse 80% 60% at 20% 0%, var(--lab-glow), transparent 55%),
        radial-gradient(ellipse 50% 40% at 90% 80%, rgba(34, 197, 94, 0.06), transparent 50%),
        var(--lab-bg);
      border: 1px solid var(--lab-border);
      border-radius: calc(var(--radius) * 2);
      color: var(--lab-text);
    }

    .zone--labs .zone__eyebrow { color: var(--lab-accent); }
    .zone--labs .zone__title { color: var(--lab-text); }
    .zone--labs .zone__lede { color: var(--lab-muted); }

    .lab-grid {
      display: grid;
      gap: 16px;
    }

    @media (min-width: 640px) {
      .lab-grid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
    }

    .companion-grid {
      display: grid;
      gap: 18px;
    }

    @media (min-width: 720px) {
      .companion-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    .source-list {
      display: grid;
      gap: 10px;
    }

    .card {
      display: flex;
      flex-direction: column;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .card--companion {
      background: var(--theme);
      border: 1px solid var(--border);
      border-radius: calc(var(--radius) + 2px);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .card--companion:hover {
      border-color: var(--accent);
      box-shadow: var(--shadow-md);
    }

    .card__chrome {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 14px;
      background: var(--code-bg);
      border-bottom: 1px solid var(--border);
      font-family: var(--font-mono);
      font-size: 0.68rem;
      color: var(--secondary);
    }

    .card__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--border);
    }

    .card--companion:hover .card__dot:nth-child(1) { background: #ef4444; }
    .card--companion:hover .card__dot:nth-child(2) { background: #eab308; }
    .card--companion:hover .card__dot:nth-child(3) { background: #22c55e; }

    .card__url {
      margin-left: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      opacity: 0.75;
    }

    .card__body {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 18px;
    }

    .card__body--row {
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 16px 18px;
    }

    .card__main { flex: 1; min-width: 0; }

    .card__title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.35;
      color: var(--primary);
    }

    .card__title a {
      color: inherit;
      text-decoration: none;
    }

    .card__title a:hover { color: var(--accent); }

    .card--lab .card__title a:hover { color: var(--lab-accent); }

    .card__article {
      margin: 0;
      font-size: 0.8rem;
      color: var(--accent);
      font-weight: 500;
      line-height: 1.4;
    }

    .card__article a {
      color: inherit;
      text-decoration: none;
    }

    .card__article a:hover { text-decoration: underline; }

    .card__article--subtle {
      padding: 0 18px 14px;
      font-size: 0.76rem;
      color: var(--secondary);
    }

    .card__description {
      margin: 0;
      flex: 1;
      font-size: 0.9rem;
      color: var(--secondary);
      line-height: 1.5;
    }

    .card--lab .card__description { color: var(--lab-muted); }

    .card__path {
      display: block;
      overflow: hidden;
      width: fit-content;
      max-width: 100%;
      padding: 3px 8px;
      color: var(--accent);
      background: var(--code-bg);
      border-radius: 4px;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      line-height: 1.4;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card--lab .card__path {
      color: var(--lab-accent);
      background: rgba(56, 189, 248, 0.08);
      border: 1px solid rgba(56, 189, 248, 0.15);
    }

    .card__meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .card__badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 4px;
      font-family: var(--font-mono);
      font-size: 0.65rem;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--accent);
      background: var(--surface-tint);
      border: 1px solid var(--accent-border-soft);
    }

    .card__badge--lab {
      color: var(--lab-accent);
      background: rgba(56, 189, 248, 0.1);
      border-color: rgba(56, 189, 248, 0.25);
    }

    .card__badge--source {
      color: var(--secondary);
      background: var(--code-bg);
      border-color: var(--border);
    }

    .card__status {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #22c55e;
    }

    .card__status::before {
      content: "";
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 5px;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .card--lab {
      background: var(--lab-panel);
      border: 1px solid var(--lab-border);
      border-radius: calc(var(--radius) + 2px);
    }

    .card--lab:hover {
      border-color: var(--lab-accent);
      box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.2), 0 8px 32px -8px rgba(56, 189, 248, 0.2);
    }

    .card--lab .card__title { color: var(--lab-text); }

    .card--source {
      background: var(--theme);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }

    .card--source:hover {
      border-color: var(--accent-border-soft);
      background: var(--surface-tint);
    }

    .card__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 4px;
    }

    .card__actions--inline {
      flex-shrink: 0;
      margin-top: 0;
      align-self: center;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 14px;
      border-radius: 6px;
      font-family: var(--font-sans);
      font-size: 0.82rem;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .btn--primary {
      background: var(--primary);
      color: var(--theme) !important;
      border: 1px solid var(--primary);
    }

    .btn--primary:hover {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff !important;
      box-shadow: var(--shadow-accent);
    }

    .btn--lab {
      background: var(--lab-accent);
      color: var(--lab-bg) !important;
      border: 1px solid var(--lab-accent);
      font-weight: 700;
    }

    .btn--lab:hover {
      background: #7dd3fc;
      border-color: #7dd3fc;
      box-shadow: 0 0 20px -4px rgba(56, 189, 248, 0.5);
    }

    .btn--secondary {
      background: transparent;
      color: var(--accent) !important;
      border: 1px solid var(--accent-border-soft);
    }

    .btn--secondary:hover {
      border-color: var(--accent);
      background: var(--surface-tint);
    }

    .card__menu {
      position: relative;
    }

    .card__menu > summary {
      list-style: none;
      cursor: pointer;
    }

    .card__menu > summary::-webkit-details-marker {
      display: none;
    }

    .card__menu > summary::after {
      content: "▾";
      margin-left: 0.35rem;
      font-size: 0.65rem;
      opacity: 0.85;
    }

    .card__menu[open] > summary::after {
      content: "▴";
    }

    .card__menu-panel {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 0;
      z-index: 10;
      display: flex;
      flex-direction: column;
      min-width: min(22rem, 80vw);
      padding: 0.35rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--theme);
      box-shadow: var(--shadow-lg);
    }

    .card__menu-item {
      display: block;
      padding: 0.55rem 0.75rem;
      border-radius: calc(var(--radius) - 2px);
      color: var(--content);
      font-size: 0.82rem;
      font-weight: 600;
      line-height: 1.35;
      text-decoration: none;
      white-space: normal;
    }

    .card__menu-item:hover {
      color: var(--accent-hover);
      background: var(--surface-tint);
    }

    .btn--ghost {
      color: var(--secondary) !important;
      padding-inline: 4px;
      border: none;
      background: transparent;
    }

    .btn--ghost:hover { color: var(--accent) !important; }

    .btn--ghost-on-dark {
      color: var(--lab-muted) !important;
    }

    .btn--ghost-on-dark:hover {
      color: var(--lab-accent) !important;
    }

    .site-footer {
      max-width: var(--main-width);
      margin: 0 auto;
      padding: 0 var(--gap) 48px;
      color: var(--secondary);
      font-size: 0.84rem;
      font-family: var(--font-mono);
    }

    .site-footer p { margin: 0; }
    .site-footer a { font-weight: 500; }

    @media screen and (max-width: 768px) {
      .intro { padding: 28px var(--gap) 24px; }
      .catalog { padding-top: 28px; gap: 36px; }
      .zone--labs { padding: 20px; }
      .card__body--row {
        flex-direction: column;
        align-items: stretch;
      }
      .card__actions--inline { align-self: flex-start; }
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
