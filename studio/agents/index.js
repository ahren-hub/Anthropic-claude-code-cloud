// The team registry and orchestrator.
//
// Morning Coffee — daily run order:
//   analyst → brand-manager (daily) → content-creator → pr → executive-assistant
//
// Onboarding — one-time run order (called separately from the daily meeting):
//   brand-manager (onboarding)   ← builds the Brand Bible, saved to artist profile
//
// Each agent reads upstream agents' ctx.team output via its buildInput().
// The Brand Manager's bible (ctx.artist.brand_bible) persists across the day
// and is available to all downstream agents.

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

// Daily meeting order. Brand Manager runs after Analyst so it has the signal.
export const TEAM_ORDER = ["analyst", "brand-manager", "content-creator", "pr", "executive-assistant"];

// Run a single agent. If agent needs a mode, set it before calling.
export async function runOne(agentId, ctx) {
  const agent = AGENTS[agentId];
  if (!agent) throw new Error(`Unknown agent: ${agentId}. Known: ${Object.keys(AGENTS).join(", ")}`);
  ctx.team = ctx.team || {};
  const output = await runAgent(agent, ctx);
  agent.reduce(ctx, output);
  return output;
}

// Build the Brand Bible. Called once at onboarding.
// Result is stored in ctx.artist.brand_bible and should be persisted to the artist's profile.
export async function runOnboarding(artist) {
  const ctx = { artist, team: {} };
  brandManager.mode = "onboarding";
  const bible = await runOne("brand-manager", ctx);
  brandManager.mode = "daily"; // reset
  return { brand_bible: bible, artist: ctx.artist };
}

// Run the full Morning Coffee meeting.
// Expects ctx.artist.brand_bible to exist if the artist has been onboarded.
// onStep(agentId, name) is an optional progress callback.
export async function runMorningCoffee(artist, onStep) {
  const ctx = { artist, team: {} };
  brandManager.mode = "daily";

  for (const id of TEAM_ORDER) {
    if (onStep) onStep(id, AGENTS[id].name);
    await runOne(id, ctx);
  }

  return assembleBriefing(ctx);
}

// Flatten the team's shared context into the briefing shape the app renders.
export function assembleBriefing(ctx) {
  const { analytics, brand, content, pr: prItems, schedule } = ctx.team;
  return {
    // Brand Manager opens the meeting
    greeting:         brand?.greeting         || schedule?.greeting || "",
    strategic_lens:   brand?.strategic_lens   || "",
    brand_check:      brand?.brand_check      || null,
    business_move:    brand?.business_move    || null,
    enforcement_note: brand?.enforcement_note || "",

    // Analyst
    analytics_insight: analytics
      ? { metric: analytics.metric, observation: analytics.observation, action: analytics.action }
      : null,

    // Brand rules (from bible, for Content/PR to display)
    brand_rules: ctx.artist.brand_bible
      ? {
          unique_mechanism: ctx.artist.brand_bible.identity?.unique_mechanism,
          voice:   ctx.artist.brand_bible.voice_rules,
          visual:  ctx.artist.brand_bible.visual_rules,
          avoid:   ctx.artist.brand_bible.never_list
        }
      : null,

    // Content Creator
    content_calendar: content || [],

    // PR
    pr_opportunities: prItems || [],

    // Executive Assistant closes
    today_tasks: schedule?.today_tasks || [],
    week_plan:   schedule?.week_plan   || []
  };
}
