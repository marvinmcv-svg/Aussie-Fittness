#!/usr/bin/env node
/**
 * Import the creator's own media for the website.
 *
 * 1. Put files in assets/raw/ (e.g. from Instagram: Settings → Accounts Center →
 *    Your information and permissions → Download your information → Media).
 * 2. Run: node scripts/import-media.mjs
 * 3. Images become optimised WebP (max 2000px) in public/brand/; .mp4/.mov/.webm
 *    are copied as-is. A list is appended to assets/manifest.json.
 * 4. Point src/content/media.ts (heroVideo, heroImage, portrait) at the files.
 */
import { readdir, mkdir, copyFile, readFile, writeFile, stat } from 'node:fs/promises';
import { extname, basename, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rawDir = join(root, 'assets/raw');
const outDir = join(root, 'public/brand');
const IMG = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.avif']);
const VID = new Set(['.mp4', '.mov', '.webm']);

await mkdir(outDir, { recursive: true });
const files = (await readdir(rawDir)).filter((f) => !f.startsWith('.'));
const entries = [];

for (const f of files) {
  const src = join(rawDir, f);
  const ext = extname(f).toLowerCase();
  const slug = basename(f, extname(f)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (IMG.has(ext)) {
    const out = join(outDir, `${slug}.webp`);
    const info = await sharp(src).rotate().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
    entries.push({ file: `public/brand/${slug}.webp`, source_url: `assets/raw/${f}`, type: 'image', resolution: `${info.width}x${info.height}` });
  } else if (VID.has(ext)) {
    const out = join(outDir, `${slug}${ext}`);
    await copyFile(src, out);
    const { size } = await stat(out);
    entries.push({ file: `public/brand/${slug}${ext}`, source_url: `assets/raw/${f}`, type: 'video', resolution: `${(size / 1e6).toFixed(1)}MB` });
  }
}

const manifestPath = join(root, 'assets/manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
for (const e of entries) {
  if (manifest.some((m) => m.file === e.file)) continue;
  manifest.push({ ...e, platform: 'client-supplied', date: new Date().toISOString().slice(0, 10), subject: '', quality: 'section', rights_flag: false, suggested_use: '' });
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`[import-media] ${entries.length} file(s) → public/brand/`);
