import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = process.env.PORT || 3100;

const DEMO_MODE = !process.env.ANTHROPIC_API_KEY;
const client = DEMO_MODE ? null : new Anthropic();

// The Morning Coffee briefing is the core loop: the four v1 agents
// (Brand Manager, PR, Content Creator, Executive Assistant) each contribute
// a section, synthesized into one thing the artist reviews and approves.
const BRIEFING_SCHEMA = {
  type: "object",
  properties: {
    greeting: {
      type: "string",
      description: "A warm, personal one-line good-morning to the artist by name, referencing something specific about them or their week"
    },
    headline: {
      type: "string",
      description: "The single most important thing for the artist to focus on today, stated plainly in one sentence"
    },
    analytics_insight: {
      type: "object",
      properties: {
        metric: { type: "string", description: "The platform/metric this is about, e.g. 'Spotify monthly listeners'" },
        observation: { type: "string", description: "What the data is showing, specific to this artist's stage" },
        action: { type: "string", description: "The one concrete move this insight implies" }
      },
      required: ["metric", "observation", "action"],
      additionalProperties: false
    },
    today_tasks: {
      type: "array",
      description: "3-5 concrete tasks for today, prioritized",
      items: {
        type: "object",
        properties: {
          task: { type: "string", description: "The action, stated as a verb phrase" },
          why: { type: "string", description: "One sentence on why it matters now" },
          agent: { type: "string", enum: ["Brand Manager", "PR", "Content Creator", "Executive Assistant"] },
          est_minutes: { type: "integer", description: "Rough time estimate in minutes" }
        },
        required: ["task", "why", "agent", "est_minutes"],
        additionalProperties: false
      }
    },
    week_plan: {
      type: "array",
      description: "A 7-day rollout plan, one entry per day, working backward from goals",
      items: {
        type: "object",
        properties: {
          day: { type: "string", description: "Day name, e.g. 'Monday'" },
          focus: { type: "string", description: "The theme of the day in a few words" },
          items: { type: "array", items: { type: "string" }, description: "1-3 specific things planned that day" }
        },
        required: ["day", "focus", "items"],
        additionalProperties: false
      }
    },
    brand_note: {
      type: "object",
      description: "A note from the Brand Manager keeping the artist's identity consistent",
      properties: {
        insight: { type: "string", description: "An observation about the artist's brand at this moment" },
        guidance: { type: "string", description: "Specific, actionable brand guidance tailored to this artist — never generic" }
      },
      required: ["insight", "guidance"],
      additionalProperties: false
    },
    content_calendar: {
      type: "array",
      description: "3-5 ready-to-approve content pieces for the week, tailored to the artist's sound and audience",
      items: {
        type: "object",
        properties: {
          day: { type: "string", description: "Day to post" },
          platform: { type: "string", enum: ["Instagram", "TikTok", "YouTube", "X", "Threads"] },
          type: { type: "string", description: "Format, e.g. 'Reel', 'Carousel', 'Story', 'Short'" },
          hook: { type: "string", description: "The scroll-stopping first line or visual hook" },
          caption: { type: "string", description: "Full ready-to-post caption in the artist's voice" },
          hashtags: { type: "array", items: { type: "string" }, description: "5-8 targeted hashtags, no leading #" },
          visual_direction: { type: "string", description: "What the artist should film/shoot, using assets they have" }
        },
        required: ["day", "platform", "type", "hook", "caption", "hashtags", "visual_direction"],
        additionalProperties: false
      }
    },
    pr_opportunities: {
      type: "array",
      description: "2-3 realistic PR/outreach opportunities for an artist at this exact stage, each with a draft pitch to approve",
      items: {
        type: "object",
        properties: {
          target: { type: "string", description: "Who to reach out to — a type of playlist curator, blog, or collaborator realistic for this artist's size" },
          type: { type: "string", enum: ["Playlist", "Blog", "Collab", "Press", "Brand"] },
          why_fit: { type: "string", description: "Why this is a genuine fit for the artist, specific to their sound/audience" },
          draft_pitch: { type: "string", description: "A short, personalized, ready-to-send pitch the artist approves before anything sends" }
        },
        required: ["target", "type", "why_fit", "draft_pitch"],
        additionalProperties: false
      }
    }
  },
  required: ["greeting", "headline", "analytics_insight", "today_tasks", "week_plan", "brand_note", "content_calendar", "pr_opportunities"],
  additionalProperties: false
};

const SYSTEM_PROMPT = `You are the management team for an independent music artist — a Brand Manager, a PR lead, a
Content Creator, and an Executive Assistant working as one. Your client has real traction (1k–100k followers) but
no team, no label, and no budget for $3-5k/month management. You are the back office that lets them act like they
have a label behind them.

Your output is the "Morning Coffee" briefing: the first thing the artist sees each day. It must feel like it was
written by people who know THIS artist intimately — their sound, their brand, their audience, their goals — not a
generic content tool. Specificity is the entire product. Never give advice that could apply to any other artist.
If the artist gave you their genre, influences, and audience, every section should visibly use that.

Discipline:
- The Executive Assistant plans rollouts in advance — music marketing wins by working weeks ahead, not reacting.
- The Content Creator writes captions in the ARTIST'S voice, and only directs shoots using assets the artist
  actually has access to. Nothing posts without the artist approving it.
- The PR lead surfaces opportunities that are realistic for the artist's CURRENT size — no "get on Today's Top
  Hits." Every pitch is a draft the artist approves before anything is sent on their behalf.
- The Brand Manager keeps everything consistent with who the artist is and is NOT.
- Be honest: meaningful growth takes 3-6 months of consistency. Set manageable goals, not hype.`;

async function buildBriefing(profile) {
  const profileBlock = Object.entries(profile)
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    output_config: {
      format: { type: "json_schema", schema: BRIEFING_SCHEMA }
    },
    messages: [
      {
        role: "user",
        content: `Generate today's Morning Coffee briefing for this artist. Make every section unmistakably theirs.\n\n<artist_profile>\n${profileBlock}\n</artist_profile>`
      }
    ]
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The briefing request was declined. Please check the submitted content.");
  }
  const text = response.content.find((b) => b.type === "text")?.text;
  return JSON.parse(text);
}

async function demoBriefing() {
  const sample = JSON.parse(
    await readFile(path.join(__dirname, "sample-briefing.json"), "utf8")
  );
  // A short, honest delay so the demo feels real on camera.
  await new Promise((r) => setTimeout(r, 1600));
  return { ...sample, demo: true };
}

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml" };

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/briefing") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const { profile } = JSON.parse(body || "{}");

      if (!profile || !profile.name?.trim() || !profile.genre?.trim()) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Tell us at least your artist name and genre first." }));
      }

      const result = DEMO_MODE ? await demoBriefing() : await buildBriefing(profile);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(result));
    }

    // Static files
    const urlPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
    const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(PUBLIC_DIR, safePath);
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    return res.end(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      res.writeHead(404);
      return res.end("Not found");
    }
    console.error(err);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: err.message || "Internal error" }));
  }
});

server.listen(PORT, () => {
  console.log(`Roster Studio running at http://localhost:${PORT}`);
  console.log(DEMO_MODE
    ? "Mode: DEMO (no ANTHROPIC_API_KEY set — returns a sample briefing)"
    : "Mode: LIVE (using Claude API)");
});
