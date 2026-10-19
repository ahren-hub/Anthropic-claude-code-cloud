# Ahrendezvous Entertainment — Site Brief (canonical reference)

Single source of truth for the site rebuild. The deliverable is the `site/`
folder — self-contained pages (landing, Commercial, Portfolio, Contact) that
are hosted on Cloudflare R2 and embedded in Squarespace as the landing page of
ahrendezvous.com. See "Site structure" below.

## Design direction (from 4 reference sites + owner feedback)
- ~~boazwalma.com~~ — discarded per owner.
- **artefakt.mov — PRIMARY influence.** Interactive 3D elements are the main
  draw. Signature feature: a 3D "AHRENDEZVOUS" wordmark that pixelates /
  scatters on hover.
- **depoluce.xyz** — cinematic design, dark tones/coloring, pleasing
  typography, generous space for background/showreel video.
- **suparistudios.com** — cool interactive details; pops of vivid color
  against dull/muted colors.

## Brand palette (fixed — do not change)
| Name              | Hex     | Use |
|-------------------|---------|-----|
| Midnight Obsidian | #0D0D0D | primary background (~60%) |
| Cinematic Shadow  | #1A1A1A | cards / secondary surfaces |
| Aura Gold         | #C5A880 | luxury accent (5–10%): highlights, borders, CTAs |
| Classic Parchment | #F7F5F0 | body text / headlines |
| Cinematic Slate   | #4A5551 | muted grounding accents |
Plus one sparing "pop" accent (supari influence) for interactive states.

## Content
**One-liner:** "Bridging the post-pandemic isolation gap through high-end
production, vetted collaboration, and curated cultural experiences."

**About:** Physical, commercial, and artistic sanctuary in West Midtown,
Atlanta, addressing the post-COVID loneliness crisis. Moody, auteur-driven
aesthetic. Three layers:
1. **Commercial** — visual storytelling photography & cinematography for B2B
   brands and luxury local businesses.
2. **Professional** — invite-only physical + digital Nationwide Artist Hub;
   signature "REP SHEET" directory; ends the "lone wolf" creative bottleneck.
3. **Cultural** — curated community experiences, art exhibitions, brand
   activations in Atlanta.

Also: intensive **Film & Photography Mentorship Camps**.

**Retainers (3/6/12-month commitments):**
- **Tier 1 — The Social Engine, $2,000/mo.** For brands building authority on
  Reels/TikTok/Shorts. One 3-hr studio block/mo; 8 edited short-form videos
  (color-graded, custom audio, native captions); 10 hi-res editorial photos;
  10-day guaranteed turnaround; 2 revisions.
- **Tier 2 — The Enterprise Presence, $5,000/mo.** For premium service brands,
  e-commerce, high-tier creators. One 8-hr block (or two 4-hr); 16 short-form
  + 1 cinematic long-form OR 5 long-form videos; 25 hi-res editorial photos;
  custom aesthetic-direction templates + monthly visual audit/strategy call;
  24–72 hr priority turnaround; 5 revisions.

**Contact:** support@ahrendezvous.com · West Midtown, Atlanta.

## Site structure
- `site/` — built output; upload these files side by side to the R2 bucket
  (`index.html`, `commercial.html`, `portfolio.html`, `contact.html`). Each is
  self-contained (photos embedded); links between them are relative. Squarespace
  embeds `index.html` in a full-screen iframe and visitors navigate inside it.
- `site-src/` — edit here, then run `node site-src/build.mjs` (no dependencies).
  - `pages/` one source file per page.
  - `partials/` shared head CSS, chrome (nav, mobile menu, page-cut transition,
    cursor, toast), footer and `shared.js` — which also holds `REEL_URL`.
  - `photos/` processed photography + `manifest.json` (title, category, alt).
    To add photos: add rows to `process.py`, run
    `python3 -I site-src/photos/process.py <folder-of-originals>` (needs Pillow;
    strips EXIF/GPS, converts to sRGB), then rebuild.
- Pages not built yet (Cultural) show an "in production" notice instead of a
  dead link; adding `site-src/pages/cultural.html` switches the links on.
- Contact form composes an email to support@ahrendezvous.com by default; set
  `FORM_ENDPOINT` in `site-src/pages/contact.html` to deliver via Formspree.

## Workflow notes
- Owner reviews via preview before final approval; iterate on `site-src/`
  and rebuild. The `/website-builder` tool was the v1 path; direct
  iteration is now preferred.
- Reference sites block automated scraping (403) — design direction above is
  from owner's own descriptions, which is canonical anyway.
