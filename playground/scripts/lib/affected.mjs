import { execSync } from 'node:child_process';
import path from 'node:path';
import { PLAYGROUND_ROOT, REPO_ROOT } from './paths.mjs';

function gitDiffFiles(baseRef) {
  try {
    const out = execSync(`git diff --name-only ${baseRef}...HEAD`, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return out.trim().split('\n').filter(Boolean);
  } catch {
    return null;
  }
}

function mergeBase() {
  try {
    return execSync('git merge-base HEAD origin/master 2>/dev/null || git merge-base HEAD master', {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Return slugs of targets whose projectDir or playground scripts changed since merge-base.
 */
export function getAffectedSlugs(targets) {
  const base = mergeBase();
  if (!base) {
    return null;
  }

  const changed = gitDiffFiles(base);
  if (!changed) {
    return null;
  }

  const playgroundScriptsChanged = changed.some((f) => f.startsWith('playground/scripts/') || f === 'playground/manifest.json');

  if (playgroundScriptsChanged) {
    return targets.map((t) => t.slug);
  }

  const affected = new Set();
  for (const target of targets) {
    const dir = target.projectDir.replace(/\\/g, '/');
    if (changed.some((f) => f === dir || f.startsWith(`${dir}/`))) {
      affected.add(target.slug);
    }
  }

  // Playground assets affect landing/seo
  if (changed.some((f) => f.startsWith('playground/assets/'))) {
    return targets.map((t) => t.slug);
  }

  return [...affected];
}
