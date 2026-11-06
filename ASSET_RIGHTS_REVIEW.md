# Asset & rights review (approve before launch)

| Asset | Rights question | Owner to confirm | Status |
|---|---|---|---|
| **All 135 recipes** (titles, ingredients, directions, macros) in `data/recipes.json` | Content appears to come from the Aussie Fitness cookbooks (file carries `sourcePage`; the "Elite" cookbook advertises 130+ recipes). Use in a paid app needs the creator's **written licence/permission**. | Dez Cerimagic / Aussie Fitness | Builder states permission exists (5 Nov 2026). **Get it in writing.** |
| "Aussie Fitness" name & branding | Trademark/brand use | Aussie Fitness | Same as above |
| Recipe titles that use third-party brands (e.g. "Big Mac Quesadilla", "Biscoff", "Snickers") | Trademarks in recipe names are common descriptive use, but avoid using them in ads/OG images | Legal review | REVIEW |
| AI-generated food images | No third-party rights issue, but they misrepresent the real food | Client | Replace before launch |
| Press article links (NZ Herald, LA FM, The Nightly) | Linking is fine; no logos or article photos used | — | OK |
| Fonts: Bricolage Grotesque, Inter | SIL Open Font License | — | OK |
| **Creator's public media** (6 Nov 2026): ebook covers + food photos cut from them, before/after selfies, profile and kitchen photos of Dez, frames from 13 YouTube Shorts (`public/brand/`, sources in `assets/brand-manifest.json`) | The creator's own images, taken from his store, Payhip, Beacons and YouTube. Covered by the same permission as the recipes. Original Payhip before/after file carried **GPS EXIF**; it was stripped on export and the raw file is not committed | Dez Cerimagic | Confirm in writing alongside the recipe permission |
| Copywriting + CRO skills in `.claude/skills/` | MIT, © 2025 Corey Haines (LICENSE copied into each skill) | — | OK |
