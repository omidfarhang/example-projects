import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import {
  scanAngularJson,
  scanIndexHtml,
  scanTemplate,
  scanTypeScript,
} from './rules.mjs';

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.angular',
  '.git',
  'coverage',
  'tmp',
  'out-tsc',
]);

/**
 * @param {string} dir
 * @param {(file: string) => boolean} predicate
 * @returns {Promise<string[]>}
 */
async function walk(dir, predicate) {
  /** @type {string[]} */
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...(await walk(full, predicate)));
    } else if (entry.isFile() && predicate(full)) {
      out.push(full);
    }
  }
  return out;
}

async function findAngularJson(root) {
  const direct = join(root, 'angular.json');
  try {
    await stat(direct);
    return direct;
  } catch {
    // allow scanning a monorepo leaf that still has angular.json nearby
  }
  const matches = await walk(root, (f) => f.endsWith('angular.json'));
  return matches[0] || null;
}

/**
 * @param {string} root
 */
export async function scanProject(root) {
  const absRoot = resolve(root);
  /** @type {import('./rules.mjs').Finding[]} */
  const findings = [];

  const angularJsonPath = await findAngularJson(absRoot);
  if (!angularJsonPath) {
    findings.push({
      id: 'no-angular-json',
      severity: 'error',
      message: 'No angular.json found. Pass an Angular workspace root.',
      file: absRoot,
      line: 1,
      snippet: '',
    });
    return { root: absRoot, angularJsonPath: null, findings };
  }

  const angularJsonContent = await readFile(angularJsonPath, 'utf8');
  findings.push(...scanAngularJson(angularJsonPath, angularJsonContent));

  const workspaceRoot = resolve(angularJsonPath, '..');
  const files = await walk(workspaceRoot, (f) => {
    return (
      f.endsWith('.html') ||
      f.endsWith('.ts') ||
      f.endsWith('.component.svg')
    );
  });

  for (const file of files) {
    if (file.includes(`${join('node_modules')}`)) continue;
    const content = await readFile(file, 'utf8');
    const rel = relative(absRoot, file) || file;

    if (file.endsWith('index.html')) {
      findings.push(...scanIndexHtml(rel, content));
      continue;
    }

    if (file.endsWith('.html') || file.endsWith('.component.svg')) {
      findings.push(...scanTemplate(rel, content));
      continue;
    }

    if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
      findings.push(...scanTypeScript(rel, content));
    }
  }

  return { root: absRoot, angularJsonPath, findings };
}
