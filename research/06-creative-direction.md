# 06 — Creative direction

## Three concepts
**A. "The Swap"** (chosen)
- **Core idea:** every section dramatises turning a fast-food craving into a macro-friendly version.
- **Mood:** bold, cheeky, appetising, confident.
- **Type and colour:** an oversized grotesque display face (Bricolage Grotesque 800) over Inter text. Near-black #0B0B0C, warm off-white #F6F4EF, brand green #1FA855 (from the app) and a single "sauce" accent #FF5A1F for the craving side.
- **Signature interaction:** "The Fakeaway Wall", a pinned section where vertical scroll drives a horizontal run of real fast-food-style recipes while their protein figures count up.
- **Why:** it is the brand's actual idea and the reason press covered it.

**B. "Logbook"**
- **Core idea:** a training diary with macros as handwritten logs.
- **Mood:** gritty and personal.
- **Signature interaction:** a weight-loss timeline.
- **Rejected:** it needs real progress photos and dates we don't have, and it centres the body rather than the food.

**C. "Test Kitchen"**
- **Core idea:** clinical, lab-like nutrition data.
- **Mood:** precise and cool.
- **Signature interaction:** an interactive macro calculator.
- **Rejected:** it reads as a generic SaaS site and loses the fun Aussie voice.

## Chosen: "The Swap"
- **Positioning:** visitors should leave **relieved** ("I don't have to give up my favourite food") with the message: *Eat the food you crave. Hit your macros anyway.*
- **Design tokens** (in `src/app/globals.css`, `.site` scope):
  - **Colour:** ink #0B0B0C, paper #F6F4EF, card #FFFFFF, muted #6B6A66, line rgba(11,11,12,.12), green #1FA855, sauce #FF5A1F.
  - **Type scale (fluid):** display clamp(56px, 11vw, 168px)/0.9 at weight 800 and tracking −0.04em; h2 clamp(36px, 6vw, 84px)/0.95; h3 24/1.15; body 18/1.55; small 14.
  - **Spacing:** a 4px base; section padding clamp(80px, 12vw, 160px).
  - **Radius:** 12 for controls, 24 for media, 999 for pills. **Shadow:** none on paper (flat editorial); one soft shadow on floating chips.
  - **Motion timing:** UI 180ms, reveals 700ms, cubic-bezier(.2,.7,0,1) ("expo-out").
- **Typography:** Bricolage Grotesque (OFL, Google Fonts, licensed for web) for display and Inter for text. The brand has no existing typeface to respect.
- **Art direction:** food shot overhead on dark plates, cropped tight and full-bleed or in rounded 24px frames. Real recipe titles and macros always appear alongside the photo. *All current food photos are AI-generated placeholders* (see MISSING_CONTENT); swap in the creator's real shots before launch.
- **Signature moment:** the Fakeaway Wall.
- **Motion language:**
  - **Reveals** use CSS scroll-driven animations (`animation-timeline: view()`) inside `@supports`, so content is never hidden if JS or the feature is missing.
  - **The pinned wall** uses Motion (`useScroll`/`useTransform`) for transforms only.
  - **Hover** is a 1.02 media scale over 400ms with expo-out.
  - **Buttons** press to 0.97.
  - **Reduced motion:** with `prefers-reduced-motion`, everything static and the wall becomes a native horizontal scroller.
