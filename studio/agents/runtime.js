// Shared runtime for every agent on the team.
//
// An "agent" is a self-contained module (see ./brand-manager.js etc.) that exports:
//   { id, name, role, model?, systemPrompt, schema, buildInput(ctx), reduce(ctx, output) }
//
// runAgent() runs ONE agent: it renders that agent's input from the shared team
// context, calls Claude with the agent's own system prompt and output schema,
// validates the structured result, and returns it. With no ANTHROPIC_API_KEY it
// loads that agent's fixture so every agent is runnable and testable offline.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.join(__dirname, "..", "fixtures", "demo");

export const DEMO_MODE = !process.env.ANTHROPIC_API_KEY;
const client = DEMO_MODE ? null : new Anthropic();
const DEFAULT_MODEL = "claude-opus-4-8";

export async function runAgent(agent, ctx) {
  if (DEMO_MODE) return loadFixture(agent.id, agent.mode);

  const userInput = agent.buildInput(ctx);
  const response = await client.messages.create({
    model: agent.model || DEFAULT_MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: agent.systemPrompt,
    output_config: { format: { type: "json_schema", schema: agent.schema } },
    messages: [{ role: "user", content: userInput }]
  });

  if (response.stop_reason === "refusal") {
    throw new Error(`${agent.name} declined the request. Check the submitted content.`);
  }
  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error(`${agent.name} returned no output.`);
  return JSON.parse(text);
}

async function loadFixture(id, mode) {
  // A short, honest delay so demos feel like real work is happening.
  await new Promise((r) => setTimeout(r, 400));
  // Brand Manager has two fixtures: one per mode.
  const filename = (id === "brand-manager" && mode === "onboarding")
    ? "brand-manager-onboarding.json"
    : `${id}.json`;
  const raw = await readFile(path.join(FIXTURE_DIR, filename), "utf8");
  return JSON.parse(raw);
}

// Render an artist profile into a stable block agents can read.
export function profileBlock(artist) {
  return Object.entries(artist)
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}
