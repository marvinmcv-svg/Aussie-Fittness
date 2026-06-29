/**
 * Generate food photography images for all recipes using z-ai-web-dev-sdk.
 * Idempotent: skips images that already exist. Run with: bun scripts/generate_images.ts
 */
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

interface Recipe {
  id: string;
  title: string;
  category: string;
  tags: string[];
}

const RECIPES_PATH = path.join(__dirname, '../data/recipes.json');
const OUTPUT_DIR = path.join(__dirname, '../public/recipes');

function buildPrompt(recipe: Recipe): string {
  const title = recipe.title;
  const cat = recipe.category === 'Sweet' ? 'sweet treat' : 'savoury dish';
  const tagStr = recipe.tags.slice(0, 2).join(', ').toLowerCase();
  return `Professional food photography of ${title}, a ${cat}${tagStr ? ` (${tagStr})` : ''}, plated beautifully on a dark ceramic plate, dark moody slate background, top-down view, appetizing, soft studio lighting, high quality, healthy fitness meal, vibrant fresh ingredients, sharp focus`;
}

async function generateOne(zai: any, recipe: Recipe): Promise<boolean> {
  const outPath = path.join(OUTPUT_DIR, `${recipe.id}.png`);
  if (fs.existsSync(outPath)) {
    return true; // already generated
  }
  // Retry with exponential backoff for rate limits
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const response = await zai.images.generations.create({
        prompt: buildPrompt(recipe),
        size: '1024x1024',
      });
      const base64 = response.data[0].base64;
      fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
      return true;
    } catch (e: any) {
      const msg = e.message || '';
      const isRateLimit = msg.includes('429') || msg.includes('Too many requests');
      if (isRateLimit && attempt < 6) {
        const wait = attempt * 10000; // 10s, 20s, 30s, 40s, 50s
        console.log(`  ⏳ ${recipe.id} rate-limited, waiting ${wait / 1000}s (attempt ${attempt})`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      console.error(`✗ ${recipe.id} (attempt ${attempt}): ${msg.split('\n')[0]}`);
      return false;
    }
  }
  return false;
}

async function runPool(
  zai: any,
  items: Recipe[],
  concurrency: number,
  delayMs: number,
  onResult: (item: Recipe, ok: boolean) => void
) {
  let i = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (i < items.length) {
      const idx = i++;
      const item = items[idx];
      const ok = await generateOne(zai, item);
      onResult(item, ok);
      // Small delay between requests to space them out
      await new Promise((r) => setTimeout(r, delayMs));
    }
  });
  await Promise.all(workers);
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const data = JSON.parse(fs.readFileSync(RECIPES_PATH, 'utf-8'));
  const recipes: Recipe[] = data.recipes;

  // Filter to only those still needing generation
  const todo = recipes.filter((r) => !fs.existsSync(path.join(OUTPUT_DIR, `${r.id}.png`)));
  const existing = recipes.length - todo.length;
  console.log(`Total recipes: ${recipes.length}, already have: ${existing}, to generate: ${todo.length}`);

  if (todo.length === 0) {
    console.log('All images already generated. Nothing to do.');
    return;
  }

  const zai = await ZAI.create();
  let done = 0;
  let ok = 0;
  let failed = 0;
  const start = Date.now();

  await runPool(zai, todo, 2, 3000, (item, success) => {
    done++;
    if (success) ok++;
    else failed++;
    const elapsed = ((Date.now() - start) / 1000).toFixed(0);
    const rate = (done / (Number(elapsed) || 1)).toFixed(2);
    console.log(`[${done}/${todo.length}] ${success ? '✓' : '✗'} ${item.id}: ${item.title} (${elapsed}s, ${rate}/s)`);
  });

  console.log(`\nDone! ${ok} generated, ${failed} failed, in ${((Date.now() - start) / 1000).toFixed(0)}s`);
  console.log(`Total images now: ${existing + ok} / ${recipes.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
