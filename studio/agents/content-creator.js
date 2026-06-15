import { profileBlock } from "./runtime.js";

// The Content Creator turns the brand rules + the week's signal into ready-to-post
// content in the artist's voice. It is DOWNSTREAM of the Brand Manager on purpose:
// it must obey the voice/visual rules and avoid-list it's handed. Nothing it makes
// posts without the artist's approval.
export default {
  id: "content-creator",
  name: "Content Creator",
  role: "Writes a week of ready-to-approve posts in the artist's voice, within the brand rules.",

  systemPrompt: `You are the Content Creator for an independent music artist. You produce a week of posts that are
ready for the artist to approve in minutes. You are handed the Brand Manager's voice rules, visual rules, and
avoid-list — these are not suggestions, they are constraints. If a post would violate them, you don't make it.

Rules:
- Every caption is written in THIS artist's voice per the voice rules. It should sound like them, not like a brand.
- Visual direction must only use assets the artist plausibly has (their face, their room, their existing shoot) —
  no "hire a videographer." Reuse existing assets where possible.
- Ride the Analyst's signal where it's natural (e.g. a regional spike → a geo-leaning post), without forcing it.
- Vary platform and format across the week. Match posting moments to the audience (e.g. primetime in the city that's
  spiking).
- Respect the avoid-list absolutely. If the brand says "never post hype graphics," you never do.
- Hashtags: 5-8, targeted to the artist's genre and audience, no leading '#'.`,

  schema: {
    type: "object",
    properties: {
      posts: {
        type: "array",
        description: "3-5 ready-to-approve posts for the week",
        items: {
          type: "object",
          properties: {
            day: { type: "string", description: "Day to post" },
            platform: { type: "string", enum: ["Instagram", "TikTok", "YouTube", "X", "Threads"] },
            type: { type: "string", description: "Format, e.g. 'Reel', 'Carousel', 'Story', 'Short'" },
            hook: { type: "string", description: "The scroll-stopping first line or visual hook" },
            caption: { type: "string", description: "Full ready-to-post caption in the artist's voice" },
            hashtags: { type: "array", items: { type: "string" }, description: "5-8 targeted hashtags, no leading #" },
            visual_direction: { type: "string", description: "What to film/shoot, using assets the artist has" }
          },
          required: ["day", "platform", "type", "hook", "caption", "hashtags", "visual_direction"],
          additionalProperties: false
        }
      }
    },
    required: ["posts"],
    additionalProperties: false
  },

  buildInput(ctx) {
    const { brand, analytics } = ctx.team;
    const brandBlock = brand
      ? `\n\n<brand_rules>\nvoice: ${(brand.voice_rules || []).join(" | ")}\nvisual: ${(brand.visual_rules || []).join(" | ")}\nAVOID: ${(brand.avoid || []).join(" | ")}\n</brand_rules>`
      : "";
    const signal = analytics
      ? `\n\n<analyst_signal>\n${analytics.observation}\naction: ${analytics.action}\n</analyst_signal>`
      : "";
    return `Create this week's content. Obey the brand rules exactly; ride the signal where natural.\n\n<artist_profile>\n${profileBlock(ctx.artist)}\n</artist_profile>${brandBlock}${signal}`;
  },

  reduce(ctx, output) {
    ctx.team.content = output.posts || [];
  }
};
