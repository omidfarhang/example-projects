export const DEFAULT_REPO_URL = 'https://github.com/omidfarhang/example-projects';
export const DEFAULT_REPO_BRANCH = 'master';
export const SITE_URL = 'https://omid.dev';

export function getRepoUrl(manifest) {
  return manifest?.repoUrl ?? DEFAULT_REPO_URL;
}

export function getRepoBranch(manifest, demo) {
  return demo?.repoBranch ?? manifest?.repoBranch ?? DEFAULT_REPO_BRANCH;
}

export function getSourcePath(demo) {
  return demo.sourcePath ?? demo.projectDir ?? demo.slug;
}

export function getSourceUrl(demo, manifest) {
  if (demo.repoUrl) {
    return demo.repoUrl;
  }
  const repo = getRepoUrl(manifest);
  const branch = getRepoBranch(manifest, demo);
  const sourcePath = getSourcePath(demo);
  return `${repo.replace(/\/$/, '')}/tree/${branch}/${sourcePath}`;
}

export function getArticleTitle(demo) {
  return demo.articleTitle ?? demo.title;
}

export function getArticleContext(demo) {
  return demo.articleContext ?? demo.description;
}

export function getDemoPublicUrl(manifest, demo, category = 'examples') {
  const base = (manifest.baseUrl ?? 'https://playground.omid.dev').replace(/\/$/, '');
  return `${base}/${category}/${demo.slug}/`;
}

export function getLandingUrl(manifest) {
  return `${(manifest.baseUrl ?? 'https://playground.omid.dev').replace(/\/$/, '')}/`;
}
