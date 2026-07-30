/**
 * Pattern rules for Angular CSP footguns.
 * Each rule returns zero or more findings: { id, severity, message, file, line, snippet }
 */

const INLINE_HANDLER =
  /\son(?:click|load|error|submit|change|input|focus|blur|keyup|keydown|mouseover|mouseout)\s*=/gi;

const JAVASCRIPT_URL = /(?:href|src|action)\s*=\s*["']?\s*javascript:/gi;
const STYLE_ATTR_BINDING = /\[style\.[a-zA-Z0-9_-]+\]\s*=/g;
const NG_STYLE = /\[ngStyle\]/g;
const INNER_HTML = /\[innerHTML\]/g;
const BYPASS =
  /bypassSecurityTrust(?:Html|Script|Style|Url|ResourceUrl)\s*\(/g;
const EVAL_LIKE =
  /\beval\s*\(|\bnew\s+Function\s*\(|\bsetTimeout\s*\(\s*["'`]|\bsetInterval\s*\(\s*["'`]/g;
const DOCUMENT_WRITE = /\bdocument\.write\s*\(/g;
const INLINE_SCRIPT_TAG = /<script(?![^>]*\bsrc=)[^>]*>/gi;
const INLINE_STYLE_TAG = /<style\b[^>]*>/gi;
const UNSAFE_INLINE_HINT = /unsafe-inline|unsafe-eval/gi;

/**
 * @param {string} file
 * @param {string} content
 * @param {RegExp} re
 * @param {object} meta
 */
function collectMatches(file, content, re, meta) {
  const findings = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    re.lastIndex = 0;
    if (re.test(line)) {
      findings.push({
        ...meta,
        file,
        line: i + 1,
        snippet: line.trim().slice(0, 160),
      });
    }
  }
  return findings;
}

export function scanTemplate(file, content) {
  return [
    ...collectMatches(file, content, INLINE_HANDLER, {
      id: 'inline-event-handler',
      severity: 'error',
      message:
        'Inline DOM event handler (onclick=…). Use (click) bindings — inline handlers need unsafe-inline / are blocked by CSP.',
    }),
    ...collectMatches(file, content, JAVASCRIPT_URL, {
      id: 'javascript-url',
      severity: 'error',
      message:
        'javascript: URL in template. Blocked by default CSP and treated as a script sink.',
    }),
    ...collectMatches(file, content, INNER_HTML, {
      id: 'inner-html-binding',
      severity: 'warn',
      message:
        '[innerHTML] binding. Prefer sanitization; with Trusted Types you may need angular#unsafe-bypass if you bypass DomSanitizer.',
    }),
    ...collectMatches(file, content, NG_STYLE, {
      id: 'ng-style',
      severity: 'info',
      message:
        '[ngStyle] can force dynamic style attributes. Prefer classes; with nonces, Angular-managed styles are preferred over ad-hoc style bindings.',
    }),
    ...collectMatches(file, content, STYLE_ATTR_BINDING, {
      id: 'style-property-binding',
      severity: 'info',
      message:
        'Per-property [style.*] binding. Usually fine with Angular CSP nonces; avoid concatenating untrusted CSS strings.',
    }),
  ];
}

export function scanTypeScript(file, content) {
  return [
    ...collectMatches(file, content, EVAL_LIKE, {
      id: 'eval-like',
      severity: 'error',
      message:
        'eval / new Function / string-timer. Requires script-src unsafe-eval and is hostile to strict CSP.',
    }),
    ...collectMatches(file, content, DOCUMENT_WRITE, {
      id: 'document-write',
      severity: 'error',
      message: 'document.write(). Often blocked under strict CSP and Trusted Types.',
    }),
    ...collectMatches(file, content, BYPASS, {
      id: 'bypass-security-trust',
      severity: 'warn',
      message:
        'DomSanitizer bypassSecurityTrust*. Required Trusted Types policy: angular#unsafe-bypass. Audit every call site.',
    }),
  ];
}

export function scanIndexHtml(file, content) {
  const findings = [
    ...collectMatches(file, content, INLINE_SCRIPT_TAG, {
      id: 'inline-script-tag',
      severity: 'error',
      message:
        'Inline <script> without src. Needs a matching nonce (or hash) in script-src — prefer external bundles.',
    }),
    ...collectMatches(file, content, INLINE_STYLE_TAG, {
      id: 'inline-style-tag',
      severity: 'warn',
      message:
        'Inline <style> block. Needs style-src nonce/hash, or move to stylesheets / Angular styles.',
    }),
  ];

  if (!/ngCspNonce|csp_nonce|CSP_NONCE/i.test(content)) {
    findings.push({
      id: 'missing-ngcspnonce-hint',
      severity: 'info',
      message:
        'No ngCspNonce attribute spotted in index.html. If you are not using autoCsp or CSP_NONCE, Angular-injected styles/scripts may violate a nonce-based policy.',
      file,
      line: 1,
      snippet: '<app-root> …',
    });
  }

  return findings;
}

export function scanAngularJson(file, content) {
  const findings = [];
  let json;
  try {
    json = JSON.parse(content);
  } catch {
    findings.push({
      id: 'angular-json-parse',
      severity: 'error',
      message: 'Could not parse angular.json.',
      file,
      line: 1,
      snippet: content.slice(0, 80),
    });
    return findings;
  }

  const projects = json.projects || {};
  for (const [name, project] of Object.entries(projects)) {
    const buildOpts =
      project?.architect?.build?.options ||
      project?.targets?.build?.options ||
      {};
    const configs =
      project?.architect?.build?.configurations ||
      project?.targets?.build?.configurations ||
      {};

    if (buildOpts.autoCsp === true) {
      findings.push({
        id: 'autocsp-enabled',
        severity: 'info',
        message: `Project "${name}" has autoCsp: true — good baseline for CLI-managed CSP nonces.`,
        file,
        line: 1,
        snippet: `"autoCsp": true`,
      });
    } else {
      findings.push({
        id: 'autocsp-missing',
        severity: 'warn',
        message: `Project "${name}" does not set autoCsp: true. Prefer autoCsp, ngCspNonce, or CSP_NONCE for Angular-injected styles.`,
        file,
        line: 1,
        snippet: `projects.${name}.architect.build.options`,
      });
    }

    const prod = configs.production || {};
    const opt = prod.optimization;
    if (opt === true || opt?.styles?.inlineCritical === true) {
      findings.push({
        id: 'critical-css-inlining',
        severity: 'info',
        message: `Project "${name}" may inline critical CSS. Prefer autoCsp or ngCspNonce (not only CSP_NONCE) so inlined CSS gets a nonce.`,
        file,
        line: 1,
        snippet: `configurations.production.optimization`,
      });
    }

    const serveHeaders =
      project?.architect?.serve?.options?.headers ||
      project?.targets?.serve?.options?.headers;
    if (serveHeaders) {
      const joined = JSON.stringify(serveHeaders);
      if (UNSAFE_INLINE_HINT.test(joined)) {
        findings.push({
          id: 'serve-unsafe-inline',
          severity: 'warn',
          message: `Project "${name}" serve headers include unsafe-inline and/or unsafe-eval. Fine for local experiments; do not copy into production without a plan to remove them.`,
          file,
          line: 1,
          snippet: joined.slice(0, 160),
        });
      }
      if (/Report-Only|report-only|Content-Security-Policy/i.test(joined)) {
        findings.push({
          id: 'serve-csp-headers',
          severity: 'info',
          message: `Project "${name}" already defines CSP-related serve headers — good place to iterate in report-only mode.`,
          file,
          line: 1,
          snippet: joined.slice(0, 160),
        });
      }
    }
  }

  return findings;
}
