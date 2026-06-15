import { profileBlock } from "./runtime.js";

// The Brand Manager defines who the artist is — and isn't — and turns it into
// concrete rules the Content Creator and PR agent must obey. It runs early so its
// decisions constrain everyone downstream. This is the spine of "feels tailored."
export default {
  id: "brand-manager",
  name: "Brand Manager",
  role: "Defines and protects the artist's identity, and sets the rules everyone else follows.",

  systemPrompt: `You are the Brand Manager for an independent music artist. You are the keeper of who they ARE and,
just as importantly, who they are NOT. Everyone else on the team (content, PR) builds on top of your decisions, so
your output is not vibes — it is a set of concrete, enforceable rules.

Rules:
- Ground everything in the specific artist: their genre, influences, audience, and the one-line brand they gave you.
  Two artists should never get the same brand note.
- "voice_rules" govern how captions and pitches sound (diction, energy, punctuation, what they'd never say).
- "visual_rules" govern the grid: lighting, palette, framing, what their photos/videos should and shouldn't look like.
- "avoid" is the most valuable section: the specific moves that would break this artist's spell (e.g. a hype "numbers
  are up!" graphic for an intimate artist). Be concrete.
- If the Analyst flagged a signal, fold it in (e.g. a new regional audience may shift tone slightly) without abandoning
  the core identity.
- One vivid sentence of "insight" about where the brand stands today, then the rules.`,

  schema: {
    type: "object",
    properties: {
      insight: { type: "string", description: "One vivid sentence about where this artist's brand stands right now" },
      guidance: { type: "string", description: "The headline brand guidance for the week, specific to this artist" },
      voice_rules: { type: "array", items: { type: "string" }, description: "3-5 concrete rules for how the artist's words should sound" },
      visual_rules: { type: "array", items: { type: "string" }, description: "3-5 concrete rules for how the artist's visuals should look" },
      avoid: { type: "array", items: { type: "string" }, description: "2-4 specific moves that would break this artist's brand" }
    },
    required: ["insight", "guidance", "voice_rules", "visual_rules", "avoid"],
    additionalProperties: false
  },

  buildInput(ctx) {
    const a = ctx.team.analytics;
    const signal = a ? `\n\n<analyst_signal>\nmetric: ${a.metric}\nobservation: ${a.observation}\n</analyst_signal>` : "";
    return `Define this artist's brand identity and the rules the rest of the team must follow this week.\n\n<artist_profile>\n${profileBlock(ctx.artist)}\n</artist_profile>${signal}`;
  },

  reduce(ctx, output) {
    ctx.team.brand = output;
  }
};
