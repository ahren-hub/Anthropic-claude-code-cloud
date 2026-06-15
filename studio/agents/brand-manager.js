import { profileBlock } from "./runtime.js";

// The Brand Manager is the strategic brain of the whole team. It speaks first in
// every morning meeting. Every other agent (Content Creator, PR) must obey the
// rules it sets.
//
// It runs in two modes:
//
//   ONBOARDING — called once when an artist joins. Builds the Brand Bible: a
//   complete identity document the team references forever. Grounded in five
//   frameworks (see system prompt below).
//
//   DAILY — called at the start of every morning meeting. Opens with a greeting,
//   sets the strategic lens for the week, runs a brand check against the week's
//   planned work, surfaces one business move, and issues enforcement notes to
//   the other agents.
//
// Which mode runs is determined by whether ctx.artist.brand_bible exists.

export const ONBOARDING_SYSTEM_PROMPT = `You are the Brand Manager for an independent music artist. You have been asked to build their Brand Bible —
the master identity document that every member of their team will reference for as long as they work together.

Your analytical framework is built from five specific thinkers. Apply all five to every artist you work with:

ALEX HORMOZI (business architecture):
- Identify the artist's "unique mechanism" — the one thing they do that no other artist does in exactly the same way.
- Define the dream customer with specificity: not a demographic, a psychographic. What does this person desperately want
  that this artist uniquely provides?
- Think about retention over acquisition: what makes a fan feel dumb for leaving?
- Every career decision should be evaluated as an offer: what is the value stack the artist is delivering?

JESSE CANNON / MUSFORMATION (music marketing):
- Fan acquisition is a repeatable process, not luck. Identify the specific lane the artist owns and can be
  consistently found in.
- Release strategy matters as much as the music. Build the bible with release cadence in mind.
- Data informs identity: what platforms are already working tell you something about who the audience actually is.
- Metadata, pitching, DSP profile optimization are not afterthoughts — they are brand expression.

OREN JOHN (independent artist economics):
- Independence is leverage. The brand bible should always protect the artist's ability to own their decisions.
- Multiple revenue streams are not a plan B — they are the plan. Identify them from day one.
- The audience relationship is the most valuable asset on the balance sheet.
- Build in public. The artist's journey, not just their music, is the content.

MANAGERS PLAYBOOK (career management thinking):
- Think in 6, 12, and 18-month arcs. The brand bible is not just who they are today — it's who they're
  building toward.
- Every opportunity must be evaluated against the brand. Saying no is a career decision as much as saying yes.
- Relationships are the business. The bible should identify what kinds of industry relationships to build.
- Sync, touring, publishing, brand partnerships — diversify from day one, even at small scale.

NEIGHBORHOOD ART SUPPLY (visual identity):
- The visual world is not decoration — it is communication. Everything should feel like it lives in the same
  universe.
- Consistency in aesthetic creates recognition. Recognition creates trust. Trust creates fans.
- DIY does not mean cheap. It means intentional and authentic to the artist's actual world.
- Every asset should be able to answer: "does this look like it belongs in this artist's world?"

RULES FOR THE BRAND BIBLE:
- No generic outputs. Two artists should never get the same document. Every field should be unmistakably about THIS person.
- The "never_list" is the most important section. Be specific and ruthless.
- The "unique_mechanism" (Hormozi) and the "dream_customer.desperate_want" are the spine of everything.
- Archetypes: the artist archetype (who they ARE), the audience archetype (who their listener IS), and the shadow
  archetype (the version of themselves they must consciously avoid becoming).
- Be honest about where the artist is today vs. where they're building toward — the bible should serve both.`;

export const DAILY_SYSTEM_PROMPT = `You are the Brand Manager for an independent music artist. You open every morning meeting.
You speak first. You set the tone for the entire day.

Your job today has four parts:

1. GREETING — Personal, specific, warm. Reference something real from their week, the data signal the Analyst flagged,
   or a milestone. Never generic. Never "good morning, [name]!" — always something that proves you know them.

2. STRATEGIC LENS — One paragraph on the brand and business context for this week. Draw from the Brand Bible.
   Reference the Analyst's signal and fold it into a business or brand opportunity. Think like Alex Hormozi
   (what is the offer this week?), Jesse Cannon (what does the data say about where to push?), and the Managers
   Playbook (what career decision is hiding inside this week?).

3. BRAND CHECK — Review the Content Creator's planned posts and the PR pitches against the Brand Bible. Call out
   what's on-brand (specifically). Flag anything that drifts — and give a concrete fix, not just a warning.
   Reference the voice rules, visual rules, and never_list. Be the enforcer, not the cheerleader.

4. BUSINESS MOVE — One specific business strategy action for this week. Size-appropriate. Could be a revenue
   stream to begin building, a relationship to start, a deal type to research, a platform to optimize. Drawn from
   the Managers Playbook and Oren John frameworks. One move, clearly reasoned, with a concrete first step.

5. ENFORCEMENT NOTE — A one-paragraph brief to the rest of the team (Content Creator, PR, Executive Assistant)
   on what they must keep in mind this week. Brand guardrails, voice reminders, anything that is non-negotiable.

Tone: authoritative but warm. You are the most senior voice in the room. You protect the artist's long-term
brand even when short-term temptations (a viral trend, an off-brand collab request) might pull them off course.`;

// --- Schemas ---

export const ONBOARDING_SCHEMA = {
  type: "object",
  properties: {
    identity: {
      type: "object",
      properties: {
        story: { type: "string", description: "The real origin story — why this artist makes music, the WHY behind the work" },
        personality: { type: "string", description: "How they'd describe themselves if not talking about music" },
        unique_mechanism: { type: "string", description: "The one thing they do that no other artist does in exactly the same way — Hormozi lens" }
      },
      required: ["story", "unique_mechanism", "personality"],
      additionalProperties: false
    },
    dream_customer: {
      type: "object",
      properties: {
        who: { type: "string", description: "Psychographic portrait — not demographics, but the inner life of this listener" },
        desperate_want: { type: "string", description: "What this person deeply needs that this artist uniquely provides" },
        where_they_live: { type: "string", description: "Where to find them: platforms, communities, moments of the day" }
      },
      required: ["who", "desperate_want", "where_they_live"],
      additionalProperties: false
    },
    archetypes: {
      type: "object",
      properties: {
        artist: { type: "string", description: "The archetype this artist embodies — specific and argued, not just a label" },
        audience: { type: "string", description: "The archetype their listener identifies as" },
        shadow: { type: "string", description: "The version of themselves they must consciously avoid — the brand's shadow side" }
      },
      required: ["artist", "audience", "shadow"],
      additionalProperties: false
    },
    pillars: {
      type: "array",
      description: "3-4 brand pillars — the recurring themes that run through everything the artist makes and does",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string", description: "What this pillar means for this specific artist" },
          content_expression: { type: "string", description: "Concretely how this pillar shows up in posts, visuals, and conversation" }
        },
        required: ["name", "description", "content_expression"],
        additionalProperties: false
      }
    },
    voice_rules: {
      type: "array",
      description: "5-6 concrete, enforceable rules for how this artist speaks in every caption, pitch, and public word",
      items: { type: "string" }
    },
    visual_rules: {
      type: "array",
      description: "5-6 concrete rules for the visual world — lighting, palette, framing, texture, what belongs and what doesn't",
      items: { type: "string" }
    },
    positioning: {
      type: "object",
      properties: {
        lane: { type: "string", description: "The specific lane they own — narrow enough to be findable, wide enough to grow" },
        not_competing_with: { type: "string", description: "Who they are NOT — the adjacent artists or sounds they consciously distinguish from" },
        adjacent_artists: { type: "string", description: "Who they sit near in the listener's mind but are distinct from" }
      },
      required: ["lane", "not_competing_with", "adjacent_artists"],
      additionalProperties: false
    },
    business_foundation: {
      type: "object",
      properties: {
        primary_revenue_now: { type: "string", description: "The most realistic immediate revenue source given where they are" },
        revenue_streams_to_build: {
          type: "array",
          items: { type: "string" },
          description: "3-5 revenue streams to develop over 6-18 months (sync, merch, live, brand deals, publishing, etc.)"
        },
        six_month_milestones: {
          type: "array",
          items: { type: "string" },
          description: "3-4 specific, measurable milestones for 6 months out — career arc thinking"
        },
        relationship_targets: {
          type: "array",
          items: { type: "string" },
          description: "Types of industry relationships to prioritize building — not names, but roles and contexts"
        }
      },
      required: ["primary_revenue_now", "revenue_streams_to_build", "six_month_milestones", "relationship_targets"],
      additionalProperties: false
    },
    never_list: {
      type: "array",
      description: "5-7 specific things that would break this artist's brand — concrete and ruthless, not generic",
      items: { type: "string" }
    }
  },
  required: ["identity", "dream_customer", "archetypes", "pillars", "voice_rules", "visual_rules", "positioning", "business_foundation", "never_list"],
  additionalProperties: false
};

export const DAILY_SCHEMA = {
  type: "object",
  properties: {
    greeting: {
      type: "string",
      description: "Personal, specific greeting that references something real — the data signal, the week's context, a milestone. Never generic."
    },
    strategic_lens: {
      type: "string",
      description: "One paragraph: the brand and business context for this week. Draws from the Bible and the Analyst's signal. Frames what this week is really about."
    },
    brand_check: {
      type: "object",
      properties: {
        on_brand: {
          type: "array",
          items: { type: "string" },
          description: "Specific content pieces or PR pitches that are on-brand and why"
        },
        flags: {
          type: "array",
          items: {
            type: "object",
            properties: {
              item: { type: "string", description: "The specific post or pitch that drifts" },
              issue: { type: "string", description: "What brand rule it breaks and why it matters" },
              fix: { type: "string", description: "Concrete alternative that stays on-brand" }
            },
            required: ["item", "issue", "fix"],
            additionalProperties: false
          },
          description: "Anything in the week's plan that drifts from the brand bible, with a concrete fix"
        }
      },
      required: ["on_brand", "flags"],
      additionalProperties: false
    },
    business_move: {
      type: "object",
      properties: {
        focus: { type: "string", description: "The business strategy focus for this week" },
        reasoning: { type: "string", description: "Why this move makes sense now, grounded in where the artist is" },
        action: { type: "string", description: "The concrete first step, doable this week" }
      },
      required: ["focus", "reasoning", "action"],
      additionalProperties: false
    },
    enforcement_note: {
      type: "string",
      description: "A direct brief to the rest of the team — what they must keep in mind this week. Non-negotiable guardrails."
    }
  },
  required: ["greeting", "strategic_lens", "brand_check", "business_move", "enforcement_note"],
  additionalProperties: false
};

// --- Agent definition ---

export default {
  id: "brand-manager",
  name: "Brand Manager",
  role: "The strategic brain. Builds the Brand Bible at onboarding and opens every morning meeting. Every other agent follows the rules it sets.",

  // Mode is set by the orchestrator before calling buildInput/reduce.
  // "onboarding" = build the bible. "daily" = run the morning opening.
  mode: "daily",

  get systemPrompt() {
    return this.mode === "onboarding" ? ONBOARDING_SYSTEM_PROMPT : DAILY_SYSTEM_PROMPT;
  },

  get schema() {
    return this.mode === "onboarding" ? ONBOARDING_SCHEMA : DAILY_SCHEMA;
  },

  buildInput(ctx) {
    if (this.mode === "onboarding") {
      return `Build the Brand Bible for this artist. Apply all five frameworks. Make every field unmistakably theirs.\n\n<artist_profile>\n${profileBlock(ctx.artist)}\n</artist_profile>`;
    }

    // Daily mode: has access to the brand bible, analyst signal, and planned content/pitches.
    const parts = [`<artist_profile>\n${profileBlock(ctx.artist)}\n</artist_profile>`];

    if (ctx.artist.brand_bible) {
      const b = ctx.artist.brand_bible;
      const bible = [
        `unique_mechanism: ${b.identity?.unique_mechanism}`,
        `lane: ${b.positioning?.lane}`,
        `never_list: ${(b.never_list || []).join(" | ")}`,
        `voice_rules: ${(b.voice_rules || []).join(" | ")}`,
        `visual_rules: ${(b.visual_rules || []).join(" | ")}`,
        `business_focus: ${b.business_foundation?.six_month_milestones?.join(", ")}`
      ].join("\n");
      parts.push(`<brand_bible>\n${bible}\n</brand_bible>`);
    }

    if (ctx.team.analytics) {
      const a = ctx.team.analytics;
      parts.push(`<analyst_signal>\n${a.observation}\naction: ${a.action}\n</analyst_signal>`);
    }

    if (ctx.team.content?.length) {
      const list = ctx.team.content.map((p) => `- ${p.day} ${p.platform} ${p.type}: "${p.hook}" — ${p.caption?.slice(0, 80)}…`).join("\n");
      parts.push(`<planned_content>\n${list}\n</planned_content>`);
    }

    if (ctx.team.pr?.length) {
      const list = ctx.team.pr.map((o) => `- ${o.type} | ${o.target}: "${o.draft_pitch?.slice(0, 80)}…"`).join("\n");
      parts.push(`<planned_pitches>\n${list}\n</planned_pitches>`);
    }

    return `Open today's morning meeting. Brand check the week's planned work against the Bible. Surface one business move.\n\n${parts.join("\n\n")}`;
  },

  reduce(ctx, output) {
    if (this.mode === "onboarding") {
      ctx.artist.brand_bible = output;
    } else {
      ctx.team.brand = output;
    }
  }
};
