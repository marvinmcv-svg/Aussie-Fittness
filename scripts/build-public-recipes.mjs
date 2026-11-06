#!/usr/bin/env node
/**
 * Generates data/recipes.public.json from data/recipes.json.
 *
 * The public file is the ONLY recipe data that may be imported by client
 * components. Premium recipes keep their title, macros, tags and a 3-ingredient
 * teaser, but their full ingredient list and directions are stripped so they
 * never ship in the JS bundle. Full content is served by /api/recipes/[id]
 * only to premium users.
 *
 * Runs automatically before `dev` and `build` (see package.json).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEASER_INGREDIENTS = 3;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = JSON.parse(readFileSync(join(root, 'data/recipes.json'), 'utf8'));

const recipes = src.recipes.map((r) => {
  const counts = { ingredientCount: r.ingredients.length, stepCount: r.directions.length };
  if (!r.premium) return { ...r, ...counts };
  return {
    ...r,
    ...counts,
    ingredients: r.ingredients.slice(0, TEASER_INGREDIENTS),
    directions: [],
  };
});

writeFileSync(
  join(root, 'data/recipes.public.json'),
  JSON.stringify({ recipes, total: recipes.length }, null, 1) + '\n',
);
console.log(`[build-public-recipes] wrote ${recipes.length} recipes (${recipes.filter((r) => r.premium).length} premium stripped)`);
