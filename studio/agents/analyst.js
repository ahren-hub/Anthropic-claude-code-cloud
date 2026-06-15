import { profileBlock } from "./runtime.js";

// The Analyst reads the room. In v1 it works from what the artist tells us about
// their stage; later it reads live Spotify/IG/TikTok data. Its job is to find the
// ONE signal that should shape the day — not a dashboard, a decision.
export default {
  id: "analyst",
  name: "Analyst",
  role: "Finds the single most important signal in the artist's data and turns it into a decision.",

  systemPrompt: `You are the data analyst on an independent music artist's team. You do NOT produce dashboards.
Your entire job is to find the ONE signal in the artist's current numbers that should change what they do this week,
and state the move it implies.

Rules:
- Be specific to THIS artist's stage and genre. An artist with 4k monthly listeners has different leverage than one
  with 80k. Never give advice that would fit any artist.
- Prefer a signal that is actionable this week (a geographic spike, a song overperforming, a platform pulling ahead,
  a retention drop) over a vanity metric.
- If the artist's notes mention something unexplained ("Berlin listeners showed up"), treat that as the lead — chase it.
- The "action" must be a concrete first step the artist can take today, not a strategy.
- Honesty over hype. If the signal is small, say it's early and worth a probe, not a breakout.`,

  schema: {
    type: "object",
    properties: {
      metric: { type: "string", description: "The platform/metric this is about, e.g. 'Spotify monthly listeners (geographic split)'" },
      observation: { type: "string", description: "What the data is showing, specific to this artist's stage and sound" },
      action: { type: "string", description: "The one concrete first step this implies, doable today" },
      confidence: { type: "string", enum: ["early_signal", "worth_acting", "clear_trend"], description: "How strong this signal is — stay honest" }
    },
    required: ["metric", "observation", "action", "confidence"],
    additionalProperties: false
  },

  buildInput(ctx) {
    return `Find the single most important signal for this artist right now and the move it implies.\n\n<artist_profile>\n${profileBlock(ctx.artist)}\n</artist_profile>`;
  },

  reduce(ctx, output) {
    ctx.team.analytics = output;
  }
};
