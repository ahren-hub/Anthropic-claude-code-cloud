# Shortlist Studio — staffing-vertical build

Assets for the 90-day plan (see `90-day-plan.md`): paid internal-tool builds for staffing
agencies (Phase 1–3), productizing into a vertical AI screening agent (Phase 4).

## What's here

| Path | What it is |
|---|---|
| `90-day-plan.md` | The full 90-day execution plan |
| `screener/` | **Shortlist** — demo tool: AI candidate screening for tech staffing |
| `landing/index.html` | Portfolio landing page selling fixed-scope tool builds |
| `studio/` | **Roster** (working title) — separate project: an AI management team for independent music artists. See `studio/README.md` |

## Running the demo tool (Shortlist)

```bash
cd screener
npm install
node server.js           # demo mode — canned sample results, no key needed
```

Open http://localhost:3000, click **Load sample data**, then **Screen candidates**.

For live screening with Claude:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
node server.js
```

Paste a job spec on the left, resumes on the right (separate candidates with a line
containing only `---`), and screen up to 10 per batch. Each candidate gets a fit score,
verdict, strengths, red flags, screening-call questions, and a copy-ready submittal draft.

## The landing page

`landing/index.html` is fully static — open it in a browser, or deploy free on
Netlify/Vercel/GitHub Pages. Before publishing, personalize:

- The brand name (currently "Shortlist Studio" — placeholder, rename freely)
- The contact email in the final section
- Pricing, if you want to localize or adjust tiers

## Recording the 3-minute Loom (your sales asset)

1. Start the screener in demo mode (it shows a realistic 2-second "processing" delay).
2. Script: *"Here's a job spec from a real req... here are three resumes — a strong one,
   a maybe, and a keyword-stuffed one. One click."* Walk the results top to bottom:
   recommendation first, then Priya's card, then point at Candidate 3's red flags —
   *"this is the resume that wastes your recruiter's afternoon."*
3. End on the submittal draft + Copy button: *"and the client email is already written."*
4. Close with the landing page on screen and your offer: fixed price, two weekends.
