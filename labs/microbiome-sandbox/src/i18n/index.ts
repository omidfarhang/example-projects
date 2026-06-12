import { en, type I18nStrings } from './en';
import { de } from './de';
import { fa } from './fa';

export type Locale = 'en' | 'de' | 'fa';

const LOCALES: Record<Locale, I18nStrings> = { en, de, fa };

let currentLocale: Locale = parseLocaleFromUrl();
applyDocumentLocale(currentLocale);

function parseLocaleFromUrl(): Locale {
  const param = new URLSearchParams(window.location.search).get('lang');
  if (param === 'de' || param === 'fa' || param === 'en') return param;
  const nav = navigator.language.toLowerCase();
  if (nav.startsWith('de')) return 'de';
  if (nav.startsWith('fa') || nav.startsWith('per')) return 'fa';
  return 'en';
}

export function applyDocumentLocale(locale: Locale): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = LOCALES[locale] ? locale : 'en';
  applyDocumentLocale(currentLocale);
}

export function t(
  path: string,
  params?: Record<string, string | number>,
): string {
  const parts = path.split('.');
  let node: unknown = LOCALES[currentLocale];
  for (const part of parts) {
    if (node && typeof node === 'object' && part in node) {
      node = (node as Record<string, unknown>)[part];
    } else {
      node = undefined;
      break;
    }
  }
  let text = typeof node === 'string' ? node : path;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
  }
  return text;
}

/** Translate known engine event log patterns (UX-05). Falls back to raw English. */
export function translateEvent(raw: string): string {
  if (currentLocale === 'en') return raw;

  const rules: { re: RegExp; key: keyof I18nStrings['events']; groups: string[] }[] = [
    {
      re: /^(.+) prebiotic added — substrate for probiotics$/,
      key: 'prebioticAdded',
      groups: ['name'],
    },
    {
      re: /^(.+) — reduced efficacy outside (.+)$/,
      key: 'postbioticReduced',
      groups: ['label', 'regions'],
    },
    {
      re: /^(.+) applied — postbiotic metabolites active$/,
      key: 'postbioticApplied',
      groups: ['label'],
    },
    {
      re: /^Trigger "(.+)" not available for (.+) tissue$/,
      key: 'triggerUnavailable',
      groups: ['id', 'region'],
    },
    { re: /^Unknown trigger "(.+)"$/, key: 'unknownTrigger', groups: ['id'] },
    {
      re: /^Inoculation "(.+)" not available for (.+) tissue$/,
      key: 'inoculationUnavailable',
      groups: ['id', 'region'],
    },
    { re: /^Unknown inoculation "(.+)"$/, key: 'unknownInoculation', groups: ['id'] },
    {
      re: /^(.+) inoculated — strain colony forming$/,
      key: 'inoculated',
      groups: ['name'],
    },
    {
      re: /^Day (\d+) begins — overnight sugar load decay continues$/,
      key: 'dayBegins',
      groups: ['day'],
    },
  ];

  for (const rule of rules) {
    const m = raw.match(rule.re);
    if (!m) continue;
    const params: Record<string, string> = {};
    rule.groups.forEach((name, i) => {
      params[name] = m[i + 1];
    });
    return t(`events.${rule.key}`, params);
  }

  return raw;
}

export { en, de, fa };
