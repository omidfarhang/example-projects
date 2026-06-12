import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { copyDir, dirExists, emptyDir, ensureDir, fileExists } from './fs-utils.mjs';
import { PLAYGROUND_ROOT, REPO_ROOT, distDemoDir } from './paths.mjs';

const IGNORED_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  '.git',
  '.angular',
  '.vite',
  '.nx',
  'coverage',
  '.cache',
  'build',
  'target',
]);

function hashFile(filePath) {
  if (!fileExists(filePath)) {
    return 'missing';
  }
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

function hashProjectTree(projectPath) {
  if (!dirExists(projectPath)) {
    return 'missing';
  }

  const fileHashes = [];
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (IGNORED_DIR_NAMES.has(ent.name)) {
        continue;
      }
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile()) {
        const rel = path.relative(projectPath, full).replace(/\\/g, '/');
        fileHashes.push(`${rel}:${hashFile(full)}`);
      }
    }
  }

  walk(projectPath);
  fileHashes.sort();
  return crypto.createHash('sha256').update(fileHashes.join('\n')).digest('hex').slice(0, 16);
}

/**
 * Hash project inputs for a build target to detect when rebuild is needed.
 */
export function computeLockHash(target) {
  const projectPath = path.join(REPO_ROOT, target.projectDir);
  const parts = [
    hashFile(path.join(projectPath, 'package-lock.json')),
    hashProjectTree(projectPath),
  ];

  // Multi-package projects (qwik-mfe, stencil-angular)
  if (target.type === 'qwik-mfe') {
    for (const sub of ['angular-app', 'react-app', 'qwik-micro-frontend']) {
      parts.push(hashFile(path.join(projectPath, sub, 'package-lock.json')));
    }
  } else if (target.type === 'stencil-angular') {
    for (const sub of ['stencil-my-button', 'angular-app']) {
      parts.push(hashFile(path.join(projectPath, sub, 'package-lock.json')));
    }
  } else if (target.type === 'angular-workspace') {
    parts.push(hashFile(path.join(projectPath, 'package-lock.json')));
  }

  // Include playground scripts hash for landing/seo changes
  parts.push(hashFile(path.join(PLAYGROUND_ROOT, 'scripts', 'build.mjs')));

  return crypto.createHash('sha256').update(parts.join(':')).digest('hex').slice(0, 16);
}

export function cacheEntryDir(cacheRoot, target, lockHash) {
  return path.join(cacheRoot, target.category, target.slug, `lockhash-${lockHash}`);
}

export function restoreFromCache(cacheRoot, target, lockHash, distRoot) {
  const entry = cacheEntryDir(cacheRoot, target, lockHash);
  const dest = path.join(distRoot, target.category, target.slug);
  if (!dirExists(entry)) {
    return false;
  }
  emptyDir(dest);
  copyDir(entry, dest);
  return true;
}

export function writeToCache(cacheRoot, target, lockHash, distRoot) {
  const src = path.join(distRoot, target.category, target.slug);
  const entry = cacheEntryDir(cacheRoot, target, lockHash);
  if (!dirExists(src)) {
    return;
  }
  emptyDir(entry);
  copyDir(src, entry);
}

export function resolveCacheRoot(manifest) {
  const rel = manifest.build?.cacheDir ?? 'playground/.build-cache';
  return path.isAbsolute(rel) ? rel : path.join(REPO_ROOT, rel);
}
