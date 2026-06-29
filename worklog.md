# Aussie Fitness Cookbook — Web App Worklog

This file tracks all work done by agents on the Next.js web version of the
Aussie Fitness Cookbook app (adapted from the React Native + Expo handoff doc).

---
Task ID: 1
Agent: main
Task: Parse 138 recipes from the uploaded cookbook .docx into structured JSON

Work Log:
- Extracted text from `/home/z/my-project/upload/Cook Book 101 Mark Down File.docx` via pandoc → `/tmp/cookbook.md` (13078 lines)
- Wrote Python parser at `scripts/parse_recipes.py` that iterates over CALORIES: entries
- Handles two cook-time formats: combined `<tag>\^<num> MIN` and standalone `<num> MIN`
- Skips TOTAL/PER SERVE summary blocks (no DIRECTIONS following)
- Fixed direction/ingredient split so last step's continuation lines don't leak into ingredients
- Cleans leaked tag words from titles (Low Calorie, High Protein, etc.)
- Assigns 25 free recipes (top by protein, lowest calories); rest are premium

Stage Summary:
- Output: `data/recipes.json` with 135 recipes (91 Savoury, 44 Sweet; 25 free, 110 premium)
- Every recipe has: id, title, category, calories, carbs, fats, protein, sugar(optional), servings, servingsUnit, cookTime, ingredients[], directions[], tags[], sourcePage, premium
- Avg 8.7 ingredients, 6.5 directions, 364 cal, 38g protein per recipe

---
Task ID: 2-12
Agent: main
Task: Build the complete Next.js web app — foundation, API, all screens, images, and browser verification

Work Log:
- Created types (`src/types/index.ts`), data access layer (`src/lib/recipes.ts`) with search/filter/sort/stats
- Created 4 Zustand stores with localStorage persistence: favorites, mealPlan, shoppingList, premium
- Set up dark fitness theme in `globals.css` with custom macro colors (protein=green, carbs=amber, fats=rose, calories=cyan), Inter font
- Built API routes: `/api/recipes` (list + filter + meta), `/api/recipes/[id]` (detail, statically generated)
- Built shared components: RecipeCard (with photo/emoji/gradient, fav toggle, lock badge, cook time), MacroBar, MacroRing
- Built 6 screens as client components with tab-based navigation in `src/app/page.tsx`:
  - HomeScreen: hero with real food image, stats strip, featured high-protein, categories, free recipes, premium CTA
  - BrowseScreen: sticky search bar, category chips, tag filters, expandable filter panel (sliders), sort dropdown, responsive grid
  - RecipeDetailScreen: hero photo, macro rings + macro bar, servings adjuster with live macro scaling, checkable ingredients & directions, add-to-plan picker (7 days × 4 meals), add-to-shopping
  - PlannerScreen: 7-day selector with meal counts, live day/week macro totals, 4 meal types, recipe picker modal, import-to-shopping
  - ShoppingScreen: progress bar, add item form, import-from-planner, auto-categorization (Protein/Carbs/Dairy/Fruit/Vegetables/Pantry), check-off, clear checked/all
  - ProfileScreen: stats grid, premium paywall card with feature list, paywall modal with simulated purchase flow, about section
- Generated 3 real food images via image-generation skill (hero spread, chicken katsu curry, beef burrito) — used in hero + 2 featured recipe cards
- Fixed parser bugs: forward-search for macros (they come AFTER calories), skip TOTAL/PER SERVE summary blocks, direction/ingredient split, title cleanup
- Ran `bun run lint` — 0 errors, 0 warnings
- Agent Browser verification (all passed):
  - Home renders with hero, featured, categories, free recipes, premium CTA, bottom tab nav
  - Recipe detail loads with macros, ingredients, directions, add-to-plan picker
  - Meal planner: added recipe to Monday Dinner, day count updated, week totals computed
  - Shopping list: imported from planner, auto-categorized into Protein/Dairy sections
  - Profile: paywall modal opens, purchase flow completes, "Premium active" shows
  - Browse: search "chicken" filters correctly, tag chips + sort dropdown work
  - Mobile (390x844) and desktop (1280x800) viewports both render correctly
  - Sticky footer (bottom tab nav) present on all screens, no floating gap
  - No console errors, no runtime errors, all API routes return 200

Stage Summary:
- App fully functional and verified end-to-end via Agent Browser
- 135 recipes parsed from the cookbook .docx, all with complete macros/ingredients/directions
- All 5 tabs (Home, Recipes, Planner, Shopping, Profile) working with real data and interactions
- Freemium model: 25 free recipes, 110 premium with simulated one-time unlock ($9.99)
- Data persists across reloads via localStorage (favorites, meal plan, shopping list, premium status)
- Dev server running cleanly on port 3000, lint passes with 0 errors
