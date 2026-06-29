#!/usr/bin/env python3
"""Parse the cookbook markdown into structured recipes.json
Iterates over CALORIES: entries (every recipe has one)."""
import re
import json
import os

INPUT = '/tmp/cookbook.md'
OUTPUT = '/home/z/my-project/data/recipes.json'

with open(INPUT, 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

# Determine section boundary
sweets_line = None
for i, line in enumerate(lines):
    if line.strip() == '### S W E E T S':
        sweets_line = i
        break

def extract_num(text):
    m = re.search(r'[\d.]+', text.replace(' ', ''))
    return float(m.group()) if m else None

def clean_text(s):
    s = s.replace('\\', '')
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def parse_servings(text):
    m = re.search(r'\(\s*(\d+)\s+([^)]+)\)', text)
    if m:
        return int(m.group(1)), m.group(2).strip().lower()
    return None, None

def num_to_int(v):
    if v is None:
        return 0
    return int(v) if v == int(v) else v

# Find all CALORIES: line indices
cal_indices = [i for i, l in enumerate(lines) if l.strip().startswith('CALORIES:')]

recipes = []

for ci, cal_idx in enumerate(cal_indices):
    # Determine section
    current_section = 'Sweet' if (sweets_line and cal_idx > sweets_line) else 'Savoury'

    # ---- Look backward for page_num, servings, is_total ----
    calories = carbs = fats = protein = sugar = None
    servings = None
    servings_unit = None
    page_num = None
    is_total = False

    j = cal_idx - 1
    steps_back = 0
    while j >= 0 and steps_back < 15:
        l = lines[j].strip()
        if l == 'TOTAL':
            is_total = True
        elif re.match(r'^\(\s*\d+\s+\w', l):
            servings, servings_unit = parse_servings(l)
        elif re.match(r'^#\s*\d+', l):
            pm = re.search(r'\d+', l)
            if pm:
                page_num = int(pm.group())
        elif l.startswith('CALORIES:') or l.startswith('PROTEIN:') or l.startswith('SUGAR:'):
            break  # hit previous recipe
        j -= 1
        steps_back += 1

    calories = extract_num(lines[cal_idx].strip())

    # ---- Look forward for CARBS, FATS, PROTEIN, SUGAR (they come after CALORIES) ----
    fwd_limit = min(cal_idx + 20, len(lines))
    for x in range(cal_idx + 1, fwd_limit):
        l = lines[x].strip()
        if l.startswith('CARBS:'):
            carbs = extract_num(l)
        elif l.startswith('FATS:'):
            fats = extract_num(l)
        elif l.startswith('PROTEIN:'):
            protein = extract_num(l)
        elif l.startswith('SUGAR:'):
            sugar = extract_num(l)
        elif l.startswith('CALORIES:'):
            break  # next recipe

    # ---- Look forward for cook time, tag, title, DIRECTIONS, INGREDIENTS ----
    # Search window: from cal_idx+1 to next CALORIES or 200 lines
    end_idx = cal_indices[ci+1] if ci+1 < len(cal_indices) else len(lines)
    search_end = min(end_idx, cal_idx + 200)

    dir_idx = None
    ing_idx = None
    cook_time = None
    tag_lines = []
    title_lines = []
    cook_time_line_idx = None

    # Find DIRECTIONS and INGREDIENTS
    for x in range(cal_idx+1, search_end):
        ls = lines[x].strip()
        if ls == 'DIRECTIONS' and dir_idx is None:
            dir_idx = x
        elif ls == 'INGREDIENTS' and dir_idx is not None and ing_idx is None:
            ing_idx = x
            break

    # Skip this CALORIES entry if there's no DIRECTIONS following it
    # (it's a TOTAL/PER SERVE summary block, not a real recipe)
    if dir_idx is None:
        continue

    # Find cook time: either combined "<tag>\^<num> MIN" or standalone "<num> MIN"
    # Look between cal_idx and dir_idx
    combined_pat = re.compile(r'^(.+?)\\?\^(\d+)\s*(?:\+\s*\\?\^)?\s*MIN\s*$', re.IGNORECASE)
    standalone_pat = re.compile(r'^(\d+)\s*(?:\+\s*)?MIN\s*$', re.IGNORECASE)

    for x in range(cal_idx+1, dir_idx if dir_idx else search_end):
        ls = lines[x].strip()
        if not ls:
            continue
        m = combined_pat.match(ls)
        if m:
            tag_lines.append(m.group(1).strip().rstrip('\\').strip())
            cook_time = int(m.group(2))
            cook_time_line_idx = x
            break
        m2 = standalone_pat.match(ls)
        if m2:
            cook_time = int(m2.group(1))
            cook_time_line_idx = x
            break

    # If standalone cook time, collect tag lines after it until title
    if cook_time_line_idx is not None and not tag_lines:
        # Tag is on lines after cook_time_line_idx, before title
        # Title is the line(s) just before DIRECTIONS
        # Collect all non-empty lines between cook_time_line_idx and dir_idx
        between = []
        for x in range(cook_time_line_idx+1, dir_idx if dir_idx else cook_time_line_idx+20):
            ls = lines[x].strip()
            if ls:
                between.append(ls)
        # Heuristic: tag words are known prefixes. Title is the rest.
        # Known tag prefixes: HIGH PROTEIN, LOW CALORIE, MACRO FRIENDLY, MEAL PREP, etc.
        # Collect tag lines until we hit something that looks like a title (food words)
        tag_words_set = {'HIGH', 'PROTEIN', 'LOW', 'CALORIE', 'MACRO', 'FRIENDLY',
                         'MEAL', 'PREP', 'EASY', 'QUICK', '4', 'INGREDIENT', '5',
                         'MINUTE', 'MEGA', 'HUGE', 'MASSIVE', 'VOLUME', 'CREAMY',
                         'LOADED', 'ONE', 'PAN', 'POT', 'CHEESY', 'GARLIC', 'SWEET',
                         'AND', '&', 'PROTIEN'}
        idx = 0
        while idx < len(between):
            words = between[idx].split()
            if all(w.upper() in tag_words_set for w in words):
                tag_lines.append(between[idx])
                idx += 1
            else:
                break
        title_lines = between[idx:]

    elif cook_time_line_idx is not None and tag_lines:
        # Combined pattern: tag is in tag_lines[0], title is lines after cook_time_line_idx until dir_idx
        for x in range(cook_time_line_idx+1, dir_idx if dir_idx else cook_time_line_idx+20):
            ls = lines[x].strip()
            if ls:
                title_lines.append(ls)

    # Handle the "& HIGH" + "PROTEIN" title prefix case
    tags_raw = ' '.join(tag_lines)
    if title_lines:
        first = title_lines[0]
        if (tags_raw.upper().endswith('& HIGH') or tags_raw.upper().endswith('&')) and first.upper().startswith('PROTEIN'):
            tags_raw = tags_raw + ' PROTEIN'
            remainder = first[len('PROTEIN'):].strip()
            title_lines = ([remainder] if remainder else []) + title_lines[1:]
        # Handle "MASSIVE LOW" / "LOW" + "CALORIE" prefix leaking into title
        if first.upper().startswith('CALORIE'):
            tags_raw = tags_raw + ' CALORIE'
            remainder = first[len('CALORIE'):].strip()
            title_lines = ([remainder] if remainder else []) + title_lines[1:]

    title = clean_text(' '.join(title_lines))

    # ---- Generate tags ----
    tags = []
    tp_upper = tags_raw.upper()
    if any(k in tp_upper for k in ['LOW CALORIE', 'MEGA LOW', 'HUGE LOW', 'MASSIVE LOW', 'MINI']):
        tags.append('Low Calorie')
    if 'HIGH PROTEIN' in tp_upper or 'HIGH PROTIEN' in tp_upper:
        tags.append('High Protein')
    if 'MACRO FRIENDLY' in tp_upper:
        tags.append('Macro Friendly')
    if 'MEAL PREP' in tp_upper:
        tags.append('Meal Prep')
    if 'EASY' in tp_upper:
        tags.append('Easy')
    if 'QUICK' in tp_upper:
        tags.append('Quick')
    if '4 INGREDIENT' in tp_upper or '5 MINUTE' in tp_upper:
        tags.append('Few Ingredients')
    if 'HIGH VOLUME' in tp_upper:
        tags.append('High Volume')
    if 'CREAMY' in tp_upper:
        tags.append('Creamy')
    if 'LOADED' in tp_upper:
        tags.append('Loaded')
    if 'ONE PAN' in tp_upper or 'ONE POT' in tp_upper:
        tags.append('One Pan')
    if 'CHEESY' in tp_upper:
        tags.append('Cheesy')
    if 'GARLIC' in tp_upper:
        tags.append('Garlic')
    if 'SWEET' in tp_upper and current_section == 'Sweet':
        tags.append('Sweet')
    if not tags:
        tags.append(current_section)

    # ---- Parse directions and ingredients ----
    directions = []
    ingredients = []
    if dir_idx is not None:
        # If no INGREDIENTS label found, use end of search window (handles last recipe)
        block_end = ing_idx if ing_idx is not None else min(end_idx, dir_idx + 250)
        block = lines[dir_idx+1:block_end]
        # Find the last numbered step, then extend to include its continuation lines
        # (non-blank lines after the last step, until a blank line)
        last_step_idx = -1
        for bi, bl in enumerate(block):
            if re.match(r'^\s*\d+\.\s', bl):
                last_step_idx = bi
        if last_step_idx >= 0:
            # Extend past continuation lines of the last step
            ext = last_step_idx + 1
            while ext < len(block) and block[ext].strip():
                ext += 1
            dir_end = ext
        else:
            dir_end = 0
        dir_block = block[:dir_end]
        ing_block = block[dir_end:]

        current_step = ''
        step_pat = re.compile(r'^(\d+)\.\s+(.*)')
        for dl in dir_block:
            dl_stripped = dl.strip()
            if not dl_stripped:
                continue
            sm = step_pat.match(dl_stripped)
            if sm:
                if current_step:
                    directions.append(clean_text(current_step))
                current_step = sm.group(2)
            else:
                current_step += ' ' + dl_stripped
        if current_step:
            directions.append(clean_text(current_step))

        merged = []
        for bl in ing_block:
            bs = bl.strip()
            if not bs:
                continue
            bs = bs.replace('\\', '')
            starts_new = bool(re.match(r'^(\d+[/\d]*\s*\w*|½|¼|¾|One|Two|Three|Half|A\s|An\s|Salt|Pepper|Dash|Few|Pinch)', bs, re.IGNORECASE)) or bool(re.match(r'^\d', bs))
            if merged and not starts_new:
                merged[-1] = merged[-1] + ' ' + bs
            else:
                merged.append(bs)
        for ing in merged:
            c = clean_text(ing)
            if c and c.upper() not in ('DIRECTIONS', 'INGREDIENTS', 'NUTRITIONAL', 'INFORMATION', 'PAGE', 'TOTAL'):
                ingredients.append(c)

    # Normalize title casing (Title Case for consistency)
    if title and title.isupper():
        title = title.title().replace("'S", "'s")

    recipes.append({
        'id': f'r{len(recipes)+1:03d}',
        'title': title if title else 'Untitled Recipe',
        'category': current_section,
        'calories': num_to_int(calories),
        'carbs': num_to_int(carbs),
        'fats': num_to_int(fats),
        'protein': num_to_int(protein),
        'sugar': num_to_int(sugar) if sugar is not None else None,
        'servings': servings or 1,
        'servingsUnit': servings_unit or 'meals',
        'cookTime': cook_time or 0,
        'ingredients': ingredients,
        'directions': directions,
        'tags': tags,
        'sourcePage': page_num,
        'isTotal': is_total,
    })

# Assign premium: first 25 high-protein/low-cal recipes are free
sorted_for_free = sorted(
    range(len(recipes)),
    key=lambda idx: (-recipes[idx]['protein'], recipes[idx]['calories'])
)
free_ids = set(sorted_for_free[:25])
for idx, r in enumerate(recipes):
    r['premium'] = idx not in free_ids

# Post-process: clean up titles that still have leaked tag words
tag_prefixes_to_strip = [
    'Low Calorie ', 'High Protein ', 'Macro Friendly ', 'Meal Prep ',
    'Easy ', 'Quick ', 'Mega ', 'Huge ', 'Massive ', 'Mini ', 'High Volume ',
    'Creamy ', 'Loaded ', 'Sweet ', 'Savoury ',
]
for r in recipes:
    t = r['title']
    changed = True
    while changed:
        changed = False
        for p in tag_prefixes_to_strip:
            if t.startswith(p) and len(t) > len(p):
                # Only strip if the corresponding tag exists
                tag_map = {
                    'Low Calorie ': 'Low Calorie', 'High Protein ': 'High Protein',
                    'Macro Friendly ': 'Macro Friendly', 'Meal Prep ': 'Meal Prep',
                    'Easy ': 'Easy', 'Quick ': 'Quick', 'Mini ': 'Low Calorie',
                    'Mega ': 'Low Calorie', 'Huge ': 'Low Calorie', 'Massive ': 'Low Calorie',
                    'High Volume ': 'High Volume', 'Creamy ': 'Creamy',
                    'Loaded ': 'Loaded', 'Sweet ': 'Sweet',
                }
                tag_name = tag_map.get(p)
                if tag_name and tag_name in r['tags']:
                    t = t[len(p):]
                    changed = True
                    break
    r['title'] = t

# Sort recipes by sourcePage (None last)
recipes.sort(key=lambda r: (r['sourcePage'] is None, r['sourcePage'] or 0))

for idx, r in enumerate(recipes):
    r['id'] = f'r{idx+1:03d}'

os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump({'recipes': recipes, 'total': len(recipes)}, f, indent=2, ensure_ascii=False)

print(f'Parsed {len(recipes)} recipes -> {OUTPUT}')
sav = sum(1 for r in recipes if r['category'] == 'Savoury')
swt = sum(1 for r in recipes if r['category'] == 'Sweet')
print(f'  Savoury: {sav}, Sweet: {swt}')
free = sum(1 for r in recipes if not r['premium'])
print(f'  Free: {free}, Premium: {len(recipes)-free}')
no_ing = sum(1 for r in recipes if not r['ingredients'])
no_dir = sum(1 for r in recipes if not r['directions'])
print(f'  Missing ingredients: {no_ing}, Missing directions: {no_dir}')
for r in recipes[:8]:
    print(f"  {r['id']}: {r['title']} ({r['calories']}cal, {r['protein']}p, {r['cookTime']}min) tags={r['tags']} ing={len(r['ingredients'])} dir={len(r['directions'])}")
print('  ...')
for r in recipes[-4:]:
    print(f"  {r['id']}: {r['title']} ({r['calories']}cal, {r['protein']}p, {r['cookTime']}min) tags={r['tags']}")
