#!/usr/bin/env node
/**
 * Turn the creator's public media (collected 6 Nov 2026 from aussiefitnessbooks.com,
 * payhip.com/AussieFitness, aussiefitness.info and the Aussie Fitness YouTube channel)
 * into web-ready WebP files in public/brand/.
 *
 *   node scripts/process-brand-media.mjs <download-dir>
 *
 * <download-dir> must contain the files named in SOURCES below plus yt/<videoId>.jpg
 * Shorts thumbnails (https://i.ytimg.com/vi/<id>/oardefault.jpg). Raw downloads are
 * not committed (large, and one carries GPS EXIF). sharp drops all metadata on output.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2];
if (!src) throw new Error('Usage: node scripts/process-brand-media.mjs <download-dir>');
const out = join(root, 'public/brand');
await mkdir(join(out, 'shorts'), { recursive: true });

const q = { quality: 80, effort: 5 };
const jobs = [];
/** crop = { left, top, width, height } in source pixels; w = output width */
const job = (file, name, crop, w, source) => jobs.push({ file, name, crop, w, source });

// Before/after mirror selfies (Payhip shop image). Left half = before, right half = after.
job('misc-5', 'dez-before', { left: 0, top: 0, width: 1999, height: 3999 }, 900, 'https://payhip.com/AussieFitness');
job('misc-5', 'dez-after', { left: 2000, top: 0, width: 1999, height: 3999 }, 900, 'https://payhip.com/AussieFitness');
// Profile photo (YouTube avatar), cropped inside the circle.
job('misc-10', 'dez-beach', { left: 200, top: 140, width: 500, height: 620 }, 500, 'https://www.youtube.com/channel/UCblexCGILCHMDAlIM62Xpbw');
// TikTok cover, cropped below the baked-in caption.
job('misc-11', 'dez-kitchen', { left: 0, top: 230, width: 540, height: 730 }, 540, 'https://aussiefitness.info/');
// Meal Prep cover: Dez with the prepped containers, below the title block.
job('cover-mealprep.png', 'dez-mealprep', { left: 520, top: 545, width: 876, height: 700 }, 876, 'https://aussiefitnessbooks.com/');

// Ebook covers, whole.
for (const id of ['bundle', 'elite', 'fakeaway', 'mealprep']) {
  job(`cover-${id}.png`, `cover-${id}`, null, 720, 'https://aussiefitnessbooks.com/products.json');
}

// Food photography cut from the cookbook covers (photos from inside the books).
const F = 'https://aussiefitnessbooks.com/products.json';
job('cover-fakeaway.png', 'food-pizza', { left: 14, top: 14, width: 676, height: 666 }, 676, F);
job('cover-fakeaway.png', 'food-cheeseburgers', { left: 724, top: 14, width: 676, height: 666 }, 676, F);
job('cover-fakeaway.png', 'food-chicken-burgers', { left: 14, top: 1320, width: 676, height: 666 }, 676, F);
job('cover-fakeaway.png', 'food-hot-tenders', { left: 724, top: 1320, width: 676, height: 666 }, 676, F);
job('cover-elite.png', 'food-choc-pudding', { left: 0, top: 0, width: 690, height: 580 }, 690, F);
job('cover-elite.png', 'food-blueberry-slice', { left: 724, top: 0, width: 690, height: 580 }, 690, F);
job('cover-elite.png', 'food-crispy-burger', { left: 0, top: 1430, width: 690, height: 570 }, 690, F);
job('cover-elite.png', 'food-taco-boats', { left: 724, top: 1420, width: 690, height: 580 }, 690, F);
job('cover-mealprep.png', 'food-mealprep-bowl', { left: 30, top: 1160, width: 1350, height: 820 }, 1200, F);

// YouTube Shorts frames: bottom 4:5 of the 1080x1920 frame (under the caption text).
const shorts = JSON.parse(await readFile(join(root, 'src/content/shorts.json'), 'utf8'));
for (const s of shorts) {
  job(`yt/${s.id}.jpg`, `shorts/${s.id}`, { left: 0, top: 570, width: 1080, height: 1350 }, 720, `https://www.youtube.com/shorts/${s.id}`);
}

const manifest = [];
for (const j of jobs) {
  let img = sharp(join(src, j.file));
  if (j.crop) img = img.extract(j.crop);
  const info = await img.resize({ width: j.w, withoutEnlargement: true }).webp(q).toFile(join(out, `${j.name}.webp`));
  manifest.push({ file: `public/brand/${j.name}.webp`, source_url: j.source, type: 'image', resolution: `${info.width}x${info.height}`, platform: 'creator-public', date: '2026-11-06' });
}
await writeFile(join(root, 'assets/brand-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`[brand-media] ${manifest.length} files → public/brand/`);
