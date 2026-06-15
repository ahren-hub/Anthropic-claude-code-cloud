# Roster — an AI management team for independent artists

**Working title.** The whole label's back office, in an app — for independent artists
(1k–100k followers) who take it seriously but can't afford $3–5k/month management.

This is **v1 (Tier 1)**: the core daily loop with four agents.

## The core loop: "Morning Coffee"

Every morning the artist opens the app to a single briefing — written as if by a team that
knows them intimately — and reviews it in a few minutes:

| Agent | What it contributes to the briefing |
|---|---|
| **Brand Manager** | Keeps everything consistent with who the artist is (and isn't) |
| **PR** | Surfaces realistic opportunities for their size; drafts pitches **the artist approves before anything sends** |
| **Content Creator** | A week of ready-to-post content in the artist's voice; **nothing posts without an okay** |
| **Executive Assistant** | Today's tasks + a 7-day rollout plan (music marketing wins by working ahead) |

Plus a cross-platform **analytics insight** and an honest expectation up front: real growth
takes 3–6 months of consistency.

The approval-first design is deliberate — it sidesteps the auto-posting restrictions on
Instagram/TikTok and keeps the artist intentional. They approve the week; content flows to a
scheduler (Buffer/Later integration is a later phase).

## Running it

```bash
cd studio
npm install
npm start            # demo mode — canned sample briefing, no key needed
```

Open http://localhost:3100, click **Use sample artist**, then **Brew my Morning Coffee**.

For a live, personalized briefing from Claude:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm start
```

Fill in the artist profile (the more specific, the more tailored the briefing) and brew.

## How it works

- `server.js` — vanilla Node HTTP server. One endpoint, `POST /api/briefing`, takes an artist
  profile and returns a structured Morning Coffee briefing via Claude (`claude-opus-4-8`) using a
  JSON-schema output. Falls back to `sample-briefing.json` in demo mode.
- `public/` — single-page app: onboarding (round-one interview) → dashboard with approve/skip
  flows for every content piece and PR pitch.
- The entire system prompt enforces the one rule that makes this not-generic: **every section
  must be unmistakably this artist's.** Specificity is the product.

## What's intentionally NOT in v1

Per the spec, these come later: AI-generated visualizers, the swag/swagger coach (vision + voice),
the full KPI tracker, Creative Director, marketing/ads agent, and live platform integrations
(Spotify, IG, TikTok, YouTube APIs). v1 proves the daily loop and that artists will pay.

## The three ways this fails (watch these)

1. **The output stops feeling tailored.** If the briefing reads like ChatGPT, artists churn in
   two weeks. The onboarding data must visibly drive every section.
2. **Integrations become the whole product.** Six platform APIs with different terms can eat all
   the eng time. Ship useful partial data, not perfect complete data.
3. **Founder-led GTM is one data point.** Get 5 beta artists across genres running by month 3 so
   the proof isn't only the founder's own career.
