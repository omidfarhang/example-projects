import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(__dirname, '../../..');
export const PLAYGROUND_ROOT = path.join(REPO_ROOT, 'playground');
export const DIST_ROOT = path.join(PLAYGROUND_ROOT, 'dist');
export const DIST_NEXT_ROOT = path.join(PLAYGROUND_ROOT, 'dist-next');
export const MANIFEST_PATH = path.join(PLAYGROUND_ROOT, 'manifest.json');

let activeDistRoot = DIST_ROOT;

/** Point dist output at dist-next during atomic assembly. */
export function setActiveDistRoot(root) {
  activeDistRoot = root;
}

export function getActiveDistRoot() {
  return activeDistRoot;
}

export function distDemoDirIn(distRoot, slug, category = 'examples') {
  return path.join(distRoot, category, slug);
}

export function demoPublicPath(slug, category = 'examples') {
  return `/${category}/${slug}/`;
}

export function demoPublicUrl(baseUrl, slug, category = 'examples') {
  const base = baseUrl.replace(/\/$/, '');
  return `${base}/${category}/${slug}/`;
}

export function projectDir(demo) {
  return path.join(REPO_ROOT, demo.projectDir);
}

export function distDemoDir(slug, category = 'examples') {
  return distDemoDirIn(activeDistRoot, slug, category);
}
