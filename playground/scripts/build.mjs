#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { getAffectedSlugs } from './lib/affected.mjs';
import { parseBuildArgs } from './lib/build-args.mjs';
import {
  computeLockHash,
  resolveCacheRoot,
  restoreFromCache,
  writeToCache,
} from './lib/build-cache.mjs';
import { buildDemo } from './lib/builders.mjs';
import { injectCompanionFrame } from './lib/companion-frame.mjs';
import { emptyDir, ensureDir } from './lib/fs-utils.mjs';
import { filterTargets, loadManifest } from './lib/manifest-load.mjs';
import { writeLandingPage } from './lib/landing-page.mjs';
import {
  DIST_NEXT_ROOT,
  DIST_ROOT,
  PLAYGROUND_ROOT,
  setActiveDistRoot,
} from './lib/paths.mjs';
import { writeSeoAssets } from './lib/seo.mjs';
import { writeSharedAssets } from './lib/theme.mjs';

const args = parseBuildArgs();
const { manifest, targets, buildConfig } = loadManifest();
let selected = filterTargets(targets, args);

if (args.affected) {
  const affected = getAffectedSlugs(targets);
  if (affected && affected.length > 0) {
    const affectedSet = new Set(affected);
    selected = selected.filter((t) => affectedSet.has(t.slug));
    console.log(`  Affected builds: ${selected.map((t) => t.slug).join(', ')}`);
  }
}

const isPartialBuild = args.only.length > 0 || args.category || args.affected;
const useAtomicSwap = !isPartialBuild;
const distOut = useAtomicSwap ? DIST_NEXT_ROOT : DIST_ROOT;

console.log('Playground build starting…');
console.log(`  Targets: ${selected.length} / ${targets.length}`);
console.log(`  Output: ${distOut}`);
if (args.only.length) console.log(`  --only: ${args.only.join(', ')}`);
if (args.category) console.log(`  --category: ${args.category}`);
if (args.exclude.length) console.log(`  --exclude: ${args.exclude.join(', ')}`);

setActiveDistRoot(distOut);

if (isPartialBuild && fs.existsSync(DIST_ROOT)) {
  // Partial build: start from existing dist
  if (!fs.existsSync(distOut)) {
    fs.cpSync(DIST_ROOT, distOut, { recursive: true });
  }
} else {
  emptyDir(distOut);
}

writeSharedAssets();
if (!args.skipLanding) {
  // Matrix slice builds pass --skip-landing; only filter sitemap in that mode
  writeSeoAssets(manifest, args.skipLanding ? selected : null);
}

const cacheRoot = resolveCacheRoot(manifest);
const failures = [];

async function buildTarget(target) {
  const lockHash = computeLockHash(target);
  const cacheHit =
    !args.skipCache && restoreFromCache(cacheRoot, target, lockHash, distOut);

  if (cacheHit) {
    console.log(`  ✓ Cache restore: ${target.slug} (${lockHash})`);
  } else {
    buildDemo(target, target.category);
    if (!args.skipCache) {
      writeToCache(cacheRoot, target, lockHash, distOut);
    }
  }

  injectCompanionFrame(target, target.category, manifest);
}

async function runWithConcurrency(items, concurrency, fn) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      try {
        await fn(item);
      } catch (err) {
        failures.push({ slug: item.slug, error: err });
        if (!args.allowSkip) {
          throw err;
        }
        console.error(`  ✗ ${item.slug}: ${err.message}`);
      }
    }
  });
  await Promise.all(workers);
}

// Stagger heavy targets: run light first, heavy last (alone if concurrency=1)
const heavy = selected.filter((t) => t.tier === 'heavy');
const light = selected.filter((t) => t.tier !== 'heavy');

for (const target of light) {
  console.log(`\n━━━ ${target.slug} (${target.category}) ━━━`);
  try {
    await buildTarget(target);
  } catch (err) {
    failures.push({ slug: target.slug, error: err });
    if (!args.allowSkip) {
      console.error(`\n✗ Build failed: ${target.slug}`);
      console.error(err);
      process.exit(1);
    }
    console.error(`  ✗ ${target.slug}: ${err.message}`);
  }
}

if (heavy.length > 0) {
  console.log(`\n━━━ Heavy targets (${heavy.length}) ━━━`);
  await runWithConcurrency(heavy, 1, async (target) => {
    console.log(`\n━━━ ${target.slug} (${target.category}) ━━━`);
    await buildTarget(target);
  }).catch((err) => {
    if (!args.allowSkip) {
      console.error('\n✗ Heavy build failed');
      console.error(err);
      process.exit(1);
    }
  });
}

if (!args.skipLanding) {
  writeLandingPage(manifest);
}

if (useAtomicSwap) {
  if (failures.length > 0 && !args.allowSkip) {
    console.error(`\n✗ ${failures.length} target(s) failed — dist unchanged`);
    fs.rmSync(DIST_NEXT_ROOT, { recursive: true, force: true });
    process.exit(1);
  }
  fs.rmSync(DIST_ROOT, { recursive: true, force: true });
  fs.renameSync(DIST_NEXT_ROOT, DIST_ROOT);
  setActiveDistRoot(DIST_ROOT);
}

if (failures.length > 0) {
  console.warn(`\n⚠ ${failures.length} target(s) failed (allowSkip=${args.allowSkip})`);
  for (const f of failures) {
    console.warn(`  - ${f.slug}: ${f.error.message}`);
  }
  if (!args.allowSkip) process.exit(1);
}

console.log('\n✓ Playground build complete');
