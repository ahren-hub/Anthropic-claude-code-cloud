import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runMorningCoffee } from "./agents/index.js";
import { DEMO_MODE } from "./agents/runtime.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = process.env.PORT || 3100;

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml"
};

const server = http.createServer(async (req, res) => {
  try {
    // POST /api/briefing — run the full Morning Coffee agent pipeline
    if (req.method === "POST" && req.url === "/api/briefing") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const { profile } = JSON.parse(body || "{}");

      if (!profile?.name?.trim() || !profile?.genre?.trim()) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Need at least artist name and genre to get started." }));
      }

      const briefing = await runMorningCoffee(profile);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ...briefing, demo: DEMO_MODE }));
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
  console.log(`Roster Studio at http://localhost:${PORT}`);
  console.log(DEMO_MODE
    ? "DEMO mode (no ANTHROPIC_API_KEY — running fixture agents)"
    : "LIVE mode (Claude API)");
});
