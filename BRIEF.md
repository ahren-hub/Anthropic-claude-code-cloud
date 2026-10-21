# Ahrendezvous Entertainment — Site Brief (canonical reference)

Single source of truth for the site rebuild. The deliverable is the `site/`
folder — self-contained pages (landing, Commercial, Cultural, Portfolio, Contact) that
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

**Typography:** the owner's Canva brand kit specifies Cinzel / Playfair Display
headings, Montserrat subheads and Inter / Lato body. The site deliberately keeps
Cormorant Garamond + Space Grotesk + Space Mono (owner's choice, Oct 2026 — it
matches the depoluce look they liked); match the kit if asked.

## Content
Primary source: the owner's Google Doc "Ahrendezvous Entertainment - Master
Business Backlog & Strategy" (Oct 2026), which supersedes the June chat brief.
Its founder-funnel (Ahren Rene | Modern Romantic), financial forecast and
investment-ask sections are internal — keep them off the site.

**One-liner / mission:** "Bridging the post-pandemic isolation gap through
high-end production, vetted collaboration, and curated cultural experiences."

**The name:** "Ahrendezvous" (ah-rendezvous) plays on "a rendezvous" — a
pre-arranged meeting at a specific time and place — as a bridge out of the
post-COVID isolation that fractured community and emptied "third places".
Brand voice: sophisticated, inclusive, intellectual, community-oriented.
Moody, auteur-driven, indie-film aesthetic. Established 2024 (owner-confirmed;
shown as "EST 2024" on the Enter-screen lens).

**Slogans:** "Isolation is over. Your rendezvous with Atlanta's elite creative
class starts here." · "Shared love, shared entertainment." · "Bridging the
social isolation gap through entertainment." · "Stop managing disjointed
freelancers. Access a unified production studio and a vetted database under
one roof."

**Pillars** (West Midtown, Atlanta sanctuary — physical, commercial, artistic):
1. **Boutique visual production** ("our creative sandbox") — both a rental
   studio (premium, visually optimized space with pro gear and background
   sets) and a full-service production company: films & narrative (scripted
   shorts, indie features, documentary), music videos, short-form (Reels,
   TikTok, Shorts), long-form campaigns (brand docs, corporate profiles,
   product launches, podcasts), weddings & milestones (documentary-style).
2. **Nationwide Artist Hub** (coming soon on the site) — invite-only physical +
   digital network; the **REP SHEET**, a vetted roster (producers, DPs,
   photographers, gaffers, designers, editors) sent to clients and EPs on
   every booked job.
3. **Experiences & events** — curated community experiences, art exhibitions,
   gallery nights and brand activations; sponsorship / brand integration as
   physical "third-place" activations against digital ad fatigue.
4. **Mentorship camps** — 2 film + 2 photography camps a year, 30 participants
   each, immersive weekends of 3–5 (usually 4) days on real working sets with
   active pros; mentees graduate with a professionally directed body of work.
   Packages: single room (lodging + professional seminars) and shared room.

**Retainers — pricing ON REQUEST on the site (owner's choice, Oct 2026)**
because sources disagree: the strategy doc says Tier 1 $1,500/mo and Tier 2
$2,800/mo on a 12-month commitment; the June brief said $2,000 / $5,000 on
3/6/12-month terms. The site shows the doc's inclusions:
- **Tier 1 — The Social Engine.** Brands establishing authority on Reels /
  TikTok / Shorts. One 3-hr production block a month (studio or local
  location); 8 edited high-retention short-form videos (color-graded, custom
  audio, native captions); 10 hi-res editorial photos; 10-day guaranteed delivery.
- **Tier 2 — The Enterprise Presence.** Premium brands, e-commerce, high-tier
  creators. One 6-hr block (or two 3-hr); 16 short-form + 1 cinematic
  long-form brand video; 25 hi-res editorial photos; priority support —
  custom aesthetic templates + monthly visual audit / strategy calls.
Camp prices in the doc ($1,000 single / $500 shared) are also held back.

**Contact:** support@ahrendezvous.com · West Midtown, Atlanta.

## Site structure
- `site/` — built output; upload these files side by side to the R2 bucket
  (`index.html`, `commercial.html`, `cultural.html`, `portfolio.html`,
  `contact.html`). Each is
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
- A link to a page that has no file in `site-src/pages/` shows an "in
  production" notice instead of a dead link; adding the page switches it on.
- Contact form composes an email to support@ahrendezvous.com by default; set
  `FORM_ENDPOINT` in `site-src/pages/contact.html` to deliver via Formspree.
  Links can prefill it: `contact.html?type=tier1|tier2|studio|film|music|commercial|wedding|cultural|camp|other`,
  plus `&topic=exhibition|activation|experience` for cultural.
- No specific events, dates, artists or partners are on record yet, so Cultural
  describes the formats and invites ideas; add real programming here first.

## Workflow notes
- Owner reviews via preview before final approval; iterate on `site-src/`
  and rebuild. The `/website-builder` tool was the v1 path; direct
  iteration is now preferred.
- Reference sites block automated scraping (403) — design direction above is
  from owner's own descriptions, which is canonical anyway.
