import fs from 'node:fs';
import path from 'node:path';

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function emptyDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
}

export function copyDir(src, dest) {
  ensureDir(path.dirname(dest));
  fs.cpSync(src, dest, { recursive: true });
}

export function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

export function dirExists(dir) {
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

export function fileExists(file) {
  return fs.existsSync(file) && fs.statSync(file).isFile();
}

/** Resolve first existing path relative to cwd. */
export function firstExistingDir(cwd, candidates) {
  for (const rel of candidates) {
    const full = path.join(cwd, rel);
    if (dirExists(full)) {
      return full;
    }
  }
  return null;
}
