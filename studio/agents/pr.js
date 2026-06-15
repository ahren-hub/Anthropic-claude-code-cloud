import { profileBlock } from "./runtime.js";

// The PR agent finds opportunities that are REALISTIC for the artist's current
// size and drafts pitches in their voice. It reads the brand rules (so pitches stay
// on-brand) and the signal (so it pitches from strength). Every pitch is a draft the
// artist approves before anything is ever sent on their behalf.
export default {
  id: "pr",
  name: "PR",
  role: "Surfaces size-appropriate opportunities and drafts approval-ready pitches.",

  systemPrompt: `You are the PR lead for an independent music artist. You find real opportunities and write pitches the
artist can approve and send. You are realistic to a fault: an artist with a few thousand listeners does not pitch
Today's Top Hits. You target curators, blogs, and collaborators ONE rung above where they are — reachable, not fantasy.

Rules:
- Calibrate every opportunity to the artist's actual size. Name the TYPE of target precisely (e.g. "curators of
  mid-size late-night R&B Spotify playlists, 5k-50k followers, German market"), since we can't see a live database in v1.
- Pitch from strength: if the Analyst found a signal (a regional spike, an overperforming song), build the angle around
  it. "Found in Germany first" is a real hook; manufactured hype is not.
- Every draft_pitch is short, personalized, human, and on-brand per the brand voice rules. No mail-merge energy.
- These are DRAFTS. The artist approves (and edits) before anything sends. Write accordingly — ready, but theirs to okay.
- Honesty: a "no" rate is normal. Don't promise placements; open doors.`,

  schema: {
    type: "object",
    properties: {
      opportunities: {
        type: "array",
        description: "2-3 realistic opportunities for this artist's size, each with an approval-ready draft",
        items: {
          type: "object",
          properties: {
            target: { type: "string", description: "Precisely described target type, calibrated to the artist's size" },
            type: { type: "string", enum: ["Playlist", "Blog", "Collab", "Press", "Brand"] },
            why_fit: { type: "string", description: "Why this is a genuine fit, specific to the artist's sound/audience/signal" },
            draft_pitch: { type: "string", description: "Short, personalized, on-brand pitch the artist approves before sending" }
          },
          required: ["target", "type", "why_fit", "draft_pitch"],
          additionalProperties: false
        }
      }
    },
    required: ["opportunities"],
    additionalProperties: false
  },

  buildInput(ctx) {
    const { brand, analytics } = ctx.team;
    const voice = brand?.voice_rules ? `\n\n<brand_voice>\n${brand.voice_rules.join(" | ")}\n</brand_voice>` : "";
    const signal = analytics
      ? `\n\n<analyst_signal>\n${analytics.observation}\n</analyst_signal>`
      : "";
    return `Find realistic outreach opportunities for this artist's size and draft approval-ready pitches in their voice.\n\n<artist_profile>\n${profileBlock(ctx.artist)}\n</artist_profile>${voice}${signal}`;
  },

  reduce(ctx, output) {
    ctx.team.pr = output.opportunities || [];
  }
};
