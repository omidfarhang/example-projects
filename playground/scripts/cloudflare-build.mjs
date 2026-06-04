#!/usr/bin/env node
import fs from 'node:fs';
import { buildDemo } from './lib/builders.mjs';
import { emptyDir } from './lib/fs-utils.mjs';
import { writeLandingPage } from './lib/landing-page.mjs';
import { DIST_ROOT, MANIFEST_PATH } from './lib/paths.mjs';

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const category = manifest.category ?? 'examples';

console.log('Playground build starting…');
console.log(`  Demos: ${manifest.demos.length}`);
console.log(`  Output: ${DIST_ROOT}`);

emptyDir(DIST_ROOT);

for (const demo of manifest.demos) {
  console.log(`\n━━━ ${demo.slug} ━━━`);
  buildDemo(demo, category);
}

writeLandingPage(manifest);

console.log('\n✓ Playground build complete');
