import { profileBlock } from "./runtime.js";

// The Executive Assistant runs the Morning Coffee meeting. It is the LAST agent to
// run because its job is synthesis: it reads what the Analyst, Brand Manager, Content
// Creator, and PR all produced, and turns it into today's tasks + a 7-day rollout.
// Its tasks reference the team's actual outputs — that's what makes this a team meeting,
// not five disconnected reports.
export default {
  id: "executive-assistant",
  name: "Executive Assistant",
  role: "Runs the morning meeting: synthesizes the team's work into today's tasks and the week's plan.",

  systemPrompt: `You are the Executive Assistant for an independent music artist. You run "Morning Coffee" — the first
thing they see each day. You are handed the rest of the team's work: the Analyst's signal, the Brand Manager's
direction, the Content Creator's posts, and the PR pitches. Your job is to turn all of it into a calm, prioritized plan.

Rules:
- Open with a warm, specific one-line greeting by name that references something real about their week or the signal.
- The "headline" is the single most important thing today — usually built off the Analyst's signal.
- "today_tasks" must reference the team's ACTUAL outputs: "approve the Tuesday Reel," "send the German-curator pitch,"
  "film the bridge clip." Do not invent generic tasks. Each names which agent it came from and a rough time estimate.
- Music marketing wins by working ahead. The "week_plan" sequences the content and PR across 7 days, building toward
  the artist's goal, with one day for rest and one for a weekly calibration check-in.
- Keep it manageable. An overwhelmed artist quits. 3-5 tasks today, not 12.
- Be honest about pace: real growth takes months of consistency. The plan reflects steady compounding, not a sprint.`,

  schema: {
    type: "object",
    properties: {
      greeting: { type: "string", description: "Warm, specific one-line good-morning by name referencing something real" },
      headline: { type: "string", description: "The single most important thing for the artist today" },
      today_tasks: {
        type: "array",
        description: "3-5 prioritized tasks that reference the team's actual outputs",
        items: {
          type: "object",
          properties: {
            task: { type: "string", description: "The action as a verb phrase, referencing a real content/PR/brand item" },
            why: { type: "string", description: "One sentence on why it matters now" },
            agent: { type: "string", enum: ["Brand Manager", "PR", "Content Creator", "Executive Assistant", "Analyst"] },
            est_minutes: { type: "integer", description: "Rough time estimate in minutes" }
          },
          required: ["task", "why", "agent", "est_minutes"],
          additionalProperties: false
        }
      },
      week_plan: {
        type: "array",
        description: "7-day rollout sequencing the team's work toward the artist's goal",
        items: {
          type: "object",
          properties: {
            day: { type: "string", description: "Day name, e.g. 'Monday'" },
            focus: { type: "string", description: "Theme of the day in a few words" },
            items: { type: "array", items: { type: "string" }, description: "1-3 specific things planned that day" }
          },
          required: ["day", "focus", "items"],
          additionalProperties: false
        }
      }
    },
    required: ["greeting", "headline", "today_tasks", "week_plan"],
    additionalProperties: false
  },

  buildInput(ctx) {
    const { analytics, brand, content, pr } = ctx.team;
    const parts = [`<artist_profile>\n${profileBlock(ctx.artist)}\n</artist_profile>`];
    if (analytics) parts.push(`<analyst_signal>\n${analytics.observation}\naction: ${analytics.action}\n</analyst_signal>`);
    if (brand) parts.push(`<brand_direction>\n${brand.guidance}\n</brand_direction>`);
    if (content?.length) {
      const list = content.map((p) => `- ${p.day} ${p.platform} ${p.type}: ${p.hook}`).join("\n");
      parts.push(`<content_this_week>\n${list}\n</content_this_week>`);
    }
    if (pr?.length) {
      const list = pr.map((o) => `- ${o.type}: ${o.target}`).join("\n");
      parts.push(`<pr_pitches>\n${list}\n</pr_pitches>`);
    }
    return `Run today's Morning Coffee. Synthesize the team's work below into today's tasks and the week's plan. Reference the real items — do not invent generic tasks.\n\n${parts.join("\n\n")}`;
  },

  reduce(ctx, output) {
    ctx.team.schedule = output;
  }
};
