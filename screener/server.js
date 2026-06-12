import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = process.env.PORT || 3000;

const DEMO_MODE = !process.env.ANTHROPIC_API_KEY;
const client = DEMO_MODE ? null : new Anthropic();

const SCREEN_SCHEMA = {
  type: "object",
  properties: {
    candidates: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Candidate name as found in the resume, or 'Candidate N' if absent" },
          fit_score: { type: "integer", description: "Overall fit score from 0 to 100 against the job spec" },
          verdict: { type: "string", enum: ["strong_fit", "possible_fit", "weak_fit"] },
          summary: { type: "string", description: "Two-sentence recruiter-facing summary of fit" },
          strengths: { type: "array", items: { type: "string" }, description: "Specific evidence of fit, quoted or paraphrased from the resume" },
          red_flags: { type: "array", items: { type: "string" }, description: "Gaps, inconsistencies, or quality concerns a recruiter should probe" },
          screening_questions: { type: "array", items: { type: "string" }, description: "3-5 pointed questions for the screening call, targeting the red flags" },
          submittal_draft: { type: "string", description: "A short client-ready submittal paragraph pitching this candidate for the role" }
        },
        required: ["name", "fit_score", "verdict", "summary", "strengths", "red_flags", "screening_questions", "submittal_draft"],
        additionalProperties: false
      }
    },
    ranking_note: { type: "string", description: "One paragraph comparing the candidates and recommending who to submit first" }
  },
  required: ["candidates", "ranking_note"],
  additionalProperties: false
};

const SYSTEM_PROMPT = `You are a technical screening assistant for a staffing agency that places software and IT talent.
You evaluate candidate resumes against a job spec the way a sharp technical recruiter would: skeptical of buzzword
stuffing, focused on evidence of real delivered work, and alert to signals of quality (ownership of outcomes,
specifics, progression) versus noise (vague responsibilities, keyword lists, title inflation).

Scoring guide: 80+ means submit today; 60-79 means worth a screening call; below 60 means likely pass.
Be direct about red flags — the recruiter's reputation with the client depends on not submitting weak candidates.
Submittal drafts should be confident but factual, 3-4 sentences, written for a hiring manager.`;

async function screenCandidates(jobSpec, resumes) {
  const candidateBlocks = resumes
    .map((r, i) => `<candidate id="${i + 1}">\n${r}\n</candidate>`)
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    output_config: {
      format: { type: "json_schema", schema: SCREEN_SCHEMA }
    },
    messages: [
      {
        role: "user",
        content: `Screen the following candidates against this job spec.\n\n<job_spec>\n${jobSpec}\n</job_spec>\n\n${candidateBlocks}`
      }
    ]
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The screening request was declined. Please check the submitted content.");
  }
  const text = response.content.find((b) => b.type === "text")?.text;
  return JSON.parse(text);
}

async function demoScreen() {
  const sample = JSON.parse(
    await readFile(path.join(__dirname, "sample-result.json"), "utf8")
  );
  // Simulate a realistic processing delay so the demo feels honest on camera
  await new Promise((r) => setTimeout(r, 1800));
  return { ...sample, demo: true };
}

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml" };

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/screen") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const { jobSpec, resumes } = JSON.parse(body);

      if (!jobSpec?.trim() || !Array.isArray(resumes) || resumes.length === 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Provide a job spec and at least one resume." }));
      }
      if (resumes.length > 10) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Maximum 10 candidates per batch." }));
      }

      const result = DEMO_MODE ? await demoScreen() : await screenCandidates(jobSpec, resumes);
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
  console.log(`Shortlist running at http://localhost:${PORT}`);
  console.log(DEMO_MODE
    ? "Mode: DEMO (no ANTHROPIC_API_KEY set — returns sample results)"
    : "Mode: LIVE (using Claude API)");
});
