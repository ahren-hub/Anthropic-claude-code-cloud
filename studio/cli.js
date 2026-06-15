#!/usr/bin/env node
// Run the agents from the terminal — the fastest way to iterate on them.
//
//   node cli.js team                      # run the full Morning Coffee meeting
//   node cli.js team --artist fixtures/artists/nyla.json
//   node cli.js agent brand-manager       # run ONE agent in isolation
//   node cli.js agent content-creator     # (auto-runs its upstream deps first)
//   node cli.js list                      # list the team
//
// With no ANTHROPIC_API_KEY it uses each agent's fixture, so it always runs.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AGENTS, TEAM_ORDER, runOne, runMorningCoffee, assembleBriefing } from "./agents/index.js";
import { DEMO_MODE } from "./agents/runtime.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

async function loadArtist() {
  const file = arg("artist", path.join(__dirname, "fixtures", "artists", "nyla.json"));
  return JSON.parse(await readFile(file, "utf8"));
}

const C = { dim: "\x1b[2m", bold: "\x1b[1m", amber: "\x1b[33m", green: "\x1b[32m", reset: "\x1b[0m" };
const banner = (s) => console.log(`\n${C.amber}${C.bold}${s}${C.reset}`);

const [, , cmd, target] = process.argv;

try {
  console.log(`${C.dim}mode: ${DEMO_MODE ? "DEMO (fixtures — set ANTHROPIC_API_KEY for live)" : "LIVE (Claude API)"}${C.reset}`);

  if (cmd === "list") {
    banner("The team (runs in this order)");
    TEAM_ORDER.forEach((id, i) => {
      const a = AGENTS[id];
      console.log(`  ${i + 1}. ${C.bold}${a.name}${C.reset} ${C.dim}(${id})${C.reset}\n     ${a.role}`);
    });
  } else if (cmd === "agent") {
    if (!AGENTS[target]) throw new Error(`Unknown agent "${target}". Try: ${Object.keys(AGENTS).join(", ")}`);
    const artist = await loadArtist();
    const ctx = { artist, team: {} };
    // Run upstream deps so the chosen agent has the context it expects.
    const upstream = TEAM_ORDER.slice(0, TEAM_ORDER.indexOf(target));
    for (const id of upstream) {
      process.stdout.write(`${C.dim}  ↳ running ${AGENTS[id].name}…${C.reset}\n`);
      await runOne(id, ctx);
    }
    banner(`${AGENTS[target].name} — output`);
    const out = await runOne(target, ctx);
    console.log(JSON.stringify(out, null, 2));
  } else if (cmd === "team" || !cmd) {
    const artist = await loadArtist();
    banner(`Morning Coffee for ${artist.name}`);
    const briefing = await runMorningCoffee(artist, (id, name) =>
      process.stdout.write(`${C.green}  ✓ ${name}${C.reset}\n`)
    );
    console.log("");
    console.log(JSON.stringify(briefing, null, 2));
  } else {
    console.log(`\nUsage:\n  node cli.js team [--artist <file>]\n  node cli.js agent <id>\n  node cli.js list`);
  }
} catch (err) {
  console.error(`\n\x1b[31m${err.message}\x1b[0m`);
  process.exit(1);
}
