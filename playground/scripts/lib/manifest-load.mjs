import fs from 'node:fs';
import { MANIFEST_PATH } from './paths.mjs';

/** @typedef {{ slug: string, projectDir: string, type: string, kind?: string, tier?: string, [key: string]: unknown }} BuildTarget */

/**
 * Load manifest and normalize examples + labs into a flat target list.
 * Backward-compatible: top-level `demos` aliases `categories.examples`.
 */
export function loadManifest(manifestPath = MANIFEST_PATH) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const categories = manifest.categories ?? {};
  const examples = categories.examples ?? manifest.demos ?? [];
  const labs = categories.labs ?? [];

  /** @type {Array<BuildTarget & { category: string }>} */
  const targets = [
    ...examples.map((demo) => ({ ...demo, category: 'examples', kind: demo.kind ?? 'example' })),
    ...labs.map((lab) => ({ ...lab, category: 'labs', kind: lab.kind ?? 'lab' })),
  ];

  return {
    manifest,
    targets,
    examples,
    labs,
    buildConfig: {
      concurrency: manifest.build?.concurrency ?? 2,
      cacheDir: manifest.build?.cacheDir ?? 'playground/.build-cache',
    },
  };
}

/**
 * Filter targets by CLI args.
 * @param {ReturnType<typeof loadManifest>['targets']} targets
 * @param {import('./build-args.mjs').parseBuildArgs extends (...args: any) => infer R ? R : never} args
 */
export function filterTargets(targets, args) {
  let filtered = [...targets];

  if (args.category) {
    filtered = filtered.filter((t) => t.category === args.category);
  }

  if (args.only.length > 0) {
    const onlySet = new Set(args.only);
    filtered = filtered.filter((t) => onlySet.has(t.slug));
  }

  if (args.exclude.length > 0) {
    const excludeSet = new Set(args.exclude);
    filtered = filtered.filter((t) => !excludeSet.has(t.slug));
  }

  return filtered;
}
