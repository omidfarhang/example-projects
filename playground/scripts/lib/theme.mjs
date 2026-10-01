import fs from 'node:fs';
import path from 'node:path';
import { getActiveDistRoot } from './paths.mjs';
import { ensureDir } from './fs-utils.mjs';

/** CSS custom properties aligned with DESIGN.md (mono editorial) and omid.dev theme-vars.css */
export function themeVarsCss() {
  return `
    :root {
      color-scheme: light dark;
      --gap: 32px;
      --radius: 8px;
      --radius-lg: 12px;
      --radius-xl: 16px;
      --theme: #ffffff;
      --theme-rgb: 255, 255, 255;
      --entry: #ffffff;
      --primary: #0c0c0c;
      --primary-rgb: 12, 12, 12;
      --secondary: #6a6a6a;
      --tertiary: #d4d4d4;
      --quaternary: #f5f5f4;
      --content: #3a3a3a;
      --code-bg: #f5f5f4;
      --border: #e2e1de;
      --accent: #0c0c0c;
      --accent-rgb: 12, 12, 12;
      --accent-hover: #3a3a3a;
      --accent-light: color-mix(in srgb, var(--accent) 8%, var(--quaternary) 92%);
      --accent-ring: rgba(var(--accent-rgb), 0.18);
      --accent-border-soft: color-mix(in srgb, var(--border) 78%, var(--accent) 22%);
      --surface-tint: rgba(var(--accent-rgb), 0.04);
      --surface-tint-strong: rgba(var(--accent-rgb), 0.08);
      --page-bg: #f4f4f2;
      --highlight: #ffe36e;
      --highlight-strong: #ffc400;
      --hero-glow: transparent;
      --hero-glow-soft: transparent;
      --surface-gradient-hero: var(--theme);
      --focus-ring: 0 0 0 3px var(--accent-ring);
      --shadow-sm: 0 1px 2px 0 rgba(12, 12, 12, 0.06);
      --shadow-md: 0 4px 6px -1px rgba(12, 12, 12, 0.08), 0 2px 4px -1px rgba(12, 12, 12, 0.05);
      --shadow-lg: 0 10px 15px -3px rgba(12, 12, 12, 0.1), 0 4px 6px -2px rgba(12, 12, 12, 0.06);
      --shadow-accent: 0 8px 24px -6px rgba(var(--accent-rgb), 0.18);
      --main-width: 1200px;
      --pg-companion-height: 52px;
      --transition-interactive: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --theme: #121212;
        --theme-rgb: 18, 18, 18;
        --entry: #171717;
        --primary: #f5f5f4;
        --primary-rgb: 245, 245, 244;
        --secondary: #a3a3a3;
        --tertiary: #3a3a3a;
        --quaternary: #1c1c1c;
        --content: #d4d4d4;
        --code-bg: #1c1c1c;
        --border: #2a2a2a;
        --accent: #fafafa;
        --accent-rgb: 250, 250, 250;
        --accent-hover: #d4d4d4;
        --accent-light: color-mix(in srgb, var(--accent) 10%, var(--entry) 90%);
        --accent-ring: rgba(var(--accent-rgb), 0.28);
        --accent-border-soft: color-mix(in srgb, var(--border) 70%, var(--accent) 30%);
        --surface-tint: rgba(var(--accent-rgb), 0.06);
        --surface-tint-strong: rgba(var(--accent-rgb), 0.1);
        --page-bg: #0a0a0a;
        --highlight: rgba(255, 214, 10, 0.32);
        --highlight-strong: #ffd60a;
        --hero-glow: transparent;
        --hero-glow-soft: transparent;
        --surface-gradient-hero: var(--theme);
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -1px rgba(0, 0, 0, 0.25);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
        --shadow-accent: 0 8px 24px -6px rgba(var(--accent-rgb), 0.22);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :root {
        --transition-interactive: none;
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
      border-bottom: 1px solid var(--border);
      background: rgba(var(--theme-rgb), 0.92);
      backdrop-filter: blur(12px);
      font-family: "IBM Plex Sans", system-ui, -apple-system, sans-serif;
      font-size: 0.875rem;
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
      transition: var(--transition-interactive);
    }

    .pg-companion__brand a:hover {
      transform: scale(1.03);
    }

    .pg-companion__sep {
      color: var(--tertiary);
    }

    .pg-companion__eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--primary);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    .pg-companion__eyebrow::before {
      content: "";
      width: 12px;
      height: 2px;
      border-radius: 1px;
      background: var(--highlight-strong);
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
      font-size: 0.875rem;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pg-companion__context {
      overflow: hidden;
      color: var(--secondary);
      font-size: 0.75rem;
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
      min-height: 36px;
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      color: var(--primary);
      background: var(--theme);
      font-size: 0.75rem;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
      transition: var(--transition-interactive);
    }

    .pg-companion__btn:hover {
      color: var(--primary);
      background: var(--accent-light);
      border-color: var(--accent-border-soft);
    }

    .pg-companion__btn:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    .pg-companion__btn--primary {
      color: var(--theme);
      background: var(--accent);
      border-color: var(--accent);
    }

    .pg-companion__btn--primary:hover {
      color: var(--theme);
      background: var(--accent-hover);
      border-color: var(--accent-hover);
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
      margin-inline-start: 0.35rem;
      font-size: 0.65rem;
      opacity: 0.85;
    }

    .pg-companion__menu[open] > summary::after {
      content: "▴";
    }

    .pg-companion__menu-panel {
      position: absolute;
      top: calc(100% + 6px);
      inset-inline-end: 0;
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
      color: var(--primary);
      background: var(--accent-light);
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
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: var(--font-sans);
      background: var(--surface-gradient-hero), var(--page-bg);
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
      border-radius: var(--radius);
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
      border-radius: var(--radius-lg);
      background: var(--theme);
      color: var(--primary);
      font-size: 0.84rem;
      font-weight: 600;
      text-decoration: none;
      transition: var(--transition-interactive);
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

    .zone__title {
      margin: 0 0 8px;
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--primary);
      position: relative;
      padding-bottom: 12px;
    }

    .zone__title::after {
      content: "";
      position: absolute;
      bottom: 0;
      inset-inline-start: 0;
      width: 42px;
      height: 3px;
      background: var(--accent);
      border-radius: 10px;
    }

    .zone__lede {
      margin: 0;
      font-size: 0.94rem;
      color: var(--secondary);
      max-width: 58ch;
    }

    .zone--labs {
      padding: 28px;
      background: var(--surface-tint);
      border-radius: var(--radius-xl);
    }

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
      height: 100%;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .card--companion {
      background: var(--theme);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .card--companion:hover {
      border-color: color-mix(in srgb, var(--border) 55%, var(--accent) 45%);
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

    .card--companion:hover .card__dot {
      background: var(--accent);
    }

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
      flex: 1;
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

    .card--lab .card__title a:hover { color: var(--accent); }

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

    .card--lab .card__description { color: var(--secondary); }

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
      color: var(--accent);
      background: var(--accent-light);
      border: 1px solid var(--accent-border-soft);
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
      color: var(--accent);
      background: var(--accent-light);
      border-color: var(--accent-border-soft);
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
      background: var(--theme);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }

    .card--lab:hover {
      border-color: color-mix(in srgb, var(--border) 55%, var(--accent) 45%);
      box-shadow: var(--shadow-md);
    }

    .card--lab .card__title { color: var(--primary); }

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
      margin-top: auto;
      padding-top: 8px;
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
      min-height: 42px;
      padding: 8px 16px;
      border-radius: var(--radius-lg);
      font-family: var(--font-sans);
      font-size: 0.82rem;
      font-weight: 700;
      text-decoration: none;
      transition: var(--transition-interactive);
    }

    .btn:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
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
    }

    .btn--lab {
      background: var(--accent);
      color: #fff !important;
      border: 1px solid var(--accent);
    }

    .btn--lab:hover {
      background: var(--accent-hover);
      border-color: var(--accent-hover);
    }

    .btn--secondary {
      background: var(--theme);
      color: var(--primary) !important;
      border: 1px solid var(--border);
    }

    .btn--secondary:hover {
      color: var(--accent) !important;
      background: var(--accent-light);
      border-color: var(--accent-border-soft);
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
      color: var(--secondary) !important;
    }

    .btn--ghost-on-dark:hover {
      color: var(--accent) !important;
    }

    .site-footer {
      max-width: var(--main-width);
      margin: 0 auto;
      padding: 24px var(--gap) 48px;
      border-top: 1px solid var(--border);
      color: var(--secondary);
      font-size: 0.84rem;
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

export function plexFontHead() {
  return `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />`;
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
