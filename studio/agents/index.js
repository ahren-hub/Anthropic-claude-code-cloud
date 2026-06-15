// The team registry and the orchestrator that runs Morning Coffee.
//
// Agents run in a deliberate dependency order so the output is a real team meeting,
// not five parallel prompts:
//
//   analyst            → finds the signal              (reads: artist)
//   brand-manager      → sets the rules                (reads: artist, signal)
//   content-creator    → makes posts within the rules  (reads: artist, signal, brand)
//   pr                 → drafts size-appropriate pitches(reads: artist, signal, brand)
//   executive-assistant→ runs the meeting, synthesizes (reads: everything)
//
// Each agent writes its result into a shared ctx.team object that downstream agents read.

import { runAgent } from "./runtime.js";
import analyst from "./analyst.js";
import brandManager from "./brand-manager.js";
import contentCreator from "./content-creator.js";
import pr from "./pr.js";
import executiveAssistant from "./executive-assistant.js";

export const AGENTS = {
  analyst,
  "brand-manager": brandManager,
  "content-creator": contentCreator,
  pr,
  "executive-assistant": executiveAssistant
};

// The order the morning meeting runs in.
export const TEAM_ORDER = ["analyst", "brand-manager", "content-creator", "pr", "executive-assistant"];

// Run a single agent against a context. Useful for testing one agent in isolation.
export async function runOne(agentId, ctx) {
  const agent = AGENTS[agentId];
  if (!agent) throw new Error(`Unknown agent: ${agentId}. Known: ${Object.keys(AGENTS).join(", ")}`);
  ctx.team = ctx.team || {};
  const output = await runAgent(agent, ctx);
  agent.reduce(ctx, output);
  return output;
}

// Run the full Morning Coffee meeting and assemble the briefing the app renders.
// onStep(agentId, name) is an optional progress callback.
export async function runMorningCoffee(artist, onStep) {
  const ctx = { artist, team: {} };
  for (const id of TEAM_ORDER) {
    if (onStep) onStep(id, AGENTS[id].name);
    await runOne(id, ctx);
  }
  return assembleBriefing(ctx);
}

// Flatten the team's shared context into the briefing shape the frontend expects.
export function assembleBriefing(ctx) {
  const { analytics, brand, content, pr: prItems, schedule } = ctx.team;
  return {
    greeting: schedule?.greeting || "",
    headline: schedule?.headline || "",
    analytics_insight: analytics
      ? { metric: analytics.metric, observation: analytics.observation, action: analytics.action }
      : null,
    brand_note: brand ? { insight: brand.insight, guidance: brand.guidance } : null,
    brand_rules: brand ? { voice: brand.voice_rules, visual: brand.visual_rules, avoid: brand.avoid } : null,
    content_calendar: content || [],
    pr_opportunities: prItems || [],
    today_tasks: schedule?.today_tasks || [],
    week_plan: schedule?.week_plan || []
  };
}
