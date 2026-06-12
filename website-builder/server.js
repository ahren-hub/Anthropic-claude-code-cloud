import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = process.env.PORT || 3001;

const client = new Anthropic();

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};

function stripToText(html, maxChars = 15000) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, maxChars);
}

function stripScripts(html, maxChars = 20000) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .substring(0, maxChars);
}

async function fetchUrl(url) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function analyzeDesign(htmlContent) {
  const readable = stripToText(htmlContent);
  const structure = stripScripts(htmlContent, 8000);

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system:
      "You are a visual design analyst. Given website content and structure, describe its design language concisely for a developer recreating a similar aesthetic. Respond in 4-6 sentences.",
    messages: [
      {
        role: "user",
        content: `Analyze this website's visual design. Cover: (1) color palette, (2) typography style, (3) layout approach, (4) motion/animation cues, (5) overall emotional tone.

READABLE CONTENT:
${readable.substring(0, 5000)}

HTML STRUCTURE:
${structure}`,
      },
    ],
  });

  return response.content.find((b) => b.type === "text")?.text || "";
}

async function extractSiteContent(htmlContent) {
  const stripped = stripScripts(htmlContent, 20000);

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: "You extract structured content from website HTML. Return only valid JSON, no other text.",
    messages: [
      {
        role: "user",
        content: `Extract key content from this HTML. Return ONLY a JSON object:
{
  "companyName": "string or null",
  "tagline": "string or null",
  "about": "1-3 sentences or null",
  "services": [{"name": "string", "description": "string"}],
  "portfolioItems": [{"title": "string", "description": "string or null"}],
  "contact": {"email": "string or null", "phone": "string or null", "social": "string or null"}
}

Use null for missing strings, [] for missing arrays. Return ONLY the JSON.

HTML:
${stripped}`,
      },
    ],
  });

  const raw = response.content.find((b) => b.type === "text")?.text || "{}";
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse extracted content");
  return JSON.parse(match[0]);
}

async function generateSite(inspirations, content, additionalNotes) {
  const designNotes = inspirations
    .filter((i) => i.analysis)
    .map(
      (ins, idx) =>
        `Inspiration ${idx + 1} (${ins.url || "pasted HTML"}):\n  Visual style: ${ins.analysis}\n  User especially likes: ${ins.userLikes || "not specified"}`
    )
    .join("\n\n");

  const companyName = content?.companyName || "Ahrendezvous Entertainment";
  const tagline = content?.tagline || "Content Creation & Cinematic Production";
  const about =
    content?.about ||
    "A creative entertainment company specializing in cinematic content creation and visual storytelling.";
  const services = (content?.services || [])
    .map((s) => `  • ${s.name}: ${s.description}`)
    .join("\n");
  const portfolio = (content?.portfolioItems || [])
    .map((p) => `  • ${p.title}${p.description ? ": " + p.description : ""}`)
    .join("\n");
  const contactEmail = content?.contact?.email || "";
  const contactSocial = content?.contact?.social || "";

  const prompt = `You are a master frontend developer building a stunning website for a cinematic entertainment company.

COMPANY: ${companyName}
TAGLINE: ${tagline}
ABOUT: ${about}
${services ? `\nSERVICES:\n${services}` : ""}
${portfolio ? `\nPORTFOLIO ITEMS:\n${portfolio}` : ""}
${contactEmail ? `\nCONTACT EMAIL: ${contactEmail}` : ""}
${contactSocial ? `SOCIAL: ${contactSocial}` : ""}

DESIGN INSPIRATION (${inspirations.filter((i) => i.analysis).length} reference sites):
${designNotes || "No specific references — use a dark, cinematic, high-end creative agency aesthetic."}

${additionalNotes ? `ADDITIONAL INSTRUCTIONS:\n${additionalNotes}\n` : ""}

BUILD a complete single-file HTML page with these requirements:

VISUAL STYLE:
- Dark cinematic background: deep black (#080810) or very dark navy
- Premium gold/amber accent (#c9a550) for headings, borders, highlights
- Clean white (#f0eeea) for body text
- High contrast, editorial — let the work breathe
- Minimal UI chrome, maximum impact

TECHNICAL STACK (use these exact CDN URLs in <script src="..."> tags):
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
Use Google Fonts: Playfair Display (headings) and Inter (body) via @import in <style>.

THREE.JS HERO (implement all of this):
- Full-viewport canvas, position:absolute, top:0, left:0, z-index:0, width:100%, height:100%
- Scene: dark background, 1500 small particles (mix of white and gold, varying sizes 0.5–1.8)
- Particles drift upward very slowly with slight random horizontal movement
- On mousemove: camera shifts subtly (multiply normalized delta by 0.04) for parallax
- Renderer: alpha:true, antialias:true; setClearColor(0x000000, 0)
- Resize handler: update renderer size and camera aspect on window resize

GSAP ANIMATIONS (register ScrollTrigger first):
- On page load: hero title slides up from y:80, opacity:0 → y:0, opacity:1 (duration:1.4, ease:"power3.out", delay:0.3)
- Hero tagline: same but delay:0.6
- Hero CTA button: same but delay:0.9
- Nav: slide in from y:-80 on load (duration:0.8, delay:0.2)
- Each section: ScrollTrigger fade+slide from {opacity:0, y:50} to {opacity:1, y:0} when "top 80%" hits
- Service cards: stagger 0.12s
- Portfolio cards: stagger 0.1s

SECTIONS:
1. NAV: Fixed top, transparent initially, dark semi-transparent on scroll (add 'scrolled' class at 80px);
   left: logo (company name in Playfair Display, gold color); right: 4 nav links (About, Services, Work, Contact)
   smooth scroll to sections on click; hamburger menu on mobile

2. HERO: height:100vh, Three.js canvas behind; centered content (z-index:1, position:relative):
   - Large eyebrow text: "CINEMATIC PRODUCTION" in small caps, letter-spacing, gold color
   - Giant company name in Playfair Display, 5–7rem, white
   - Tagline below in Inter, muted gold/cream
   - CTA button: outlined style, gold border, hover fills gold — "View Our Work" scrolls to #work

3. ABOUT: id="about"; two-column grid — left: large decorative number "01" or word "ABOUT" in huge light text;
   right: section label in gold small-caps, heading, about paragraph; subtle top border in gold

4. SERVICES: id="services"; full-width section; title + grid (auto-fill, min 280px);
   each card: dark card background (#0f0f1a), gold top border 2px, icon area (use a simple CSS shape or emoji),
   service name in Playfair Display, description in Inter; hover: lift + gold glow

5. PORTFOLIO/WORK: id="work"; cinematic grid; each item: aspect-ratio 16/9, dark background (#0a0a14),
   gold border on hover, project title overlay; show portfolioItems or 4 placeholder items if none

6. CONTACT: id="contact"; centered, large "Let's Create" heading; email link styled as a big outlined button;
   social link if available; atmospheric — minimal, confident

7. FOOTER: company name, copyright ${new Date().getFullYear()}, nav links; all on one line

MOBILE RESPONSIVE: Stack to 1 column at 768px; hamburger nav; readable font sizes; hero text scales down.
SMOOTH SCROLL: html { scroll-behavior: smooth; }

Return ONLY the complete HTML file starting with <!DOCTYPE html>. No markdown fences, no explanations.`;

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 32000,
    system:
      "You are an expert frontend developer. Output ONLY the complete HTML file. Start directly with <!DOCTYPE html>. No markdown, no code fences, no explanations before or after.",
    messages: [{ role: "user", content: prompt }],
  });

  let html = response.content.find((b) => b.type === "text")?.text || "";

  // Strip markdown code fences if Claude added them anyway
  html = html.replace(/^```(?:html)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  // Strip any preamble text before the DOCTYPE
  const doctypeIdx = html.indexOf("<!DOCTYPE");
  if (doctypeIdx > 0) html = html.substring(doctypeIdx);

  if (!html.toLowerCase().startsWith("<!doctype") && !html.toLowerCase().startsWith("<html")) {
    throw new Error("Generated output does not appear to be valid HTML. Try regenerating.");
  }

  return html;
}

async function readBody(req, maxSize = 8 * 1024 * 1024) {
  let body = "";
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxSize) throw new Error("Request body too large (max 8MB)");
    body += chunk;
  }
  return body;
}

const server = http.createServer(async (req, res) => {
  if (req.url?.startsWith("/api/")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }
  }

  try {
    // --- POST /api/analyze-url ---
    if (req.method === "POST" && req.url === "/api/analyze-url") {
      const { url, html: pastedHtml } = JSON.parse(await readBody(req));

      let htmlContent;
      if (pastedHtml) {
        htmlContent = pastedHtml;
      } else if (url) {
        try {
          htmlContent = await fetchUrl(url);
        } catch (err) {
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({ error: `Could not fetch: ${err.message}`, fetchFailed: true })
          );
        }
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Provide a url or html field." }));
      }

      const analysis = await analyzeDesign(htmlContent);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ analysis }));
    }

    // --- POST /api/scrape-content ---
    if (req.method === "POST" && req.url === "/api/scrape-content") {
      const { url, html: pastedHtml } = JSON.parse(await readBody(req));

      let htmlContent;
      if (pastedHtml) {
        htmlContent = pastedHtml;
      } else if (url) {
        try {
          htmlContent = await fetchUrl(url);
        } catch (err) {
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({ error: `Could not fetch: ${err.message}`, fetchFailed: true })
          );
        }
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Provide a url or html field." }));
      }

      const content = await extractSiteContent(htmlContent);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(content));
    }

    // --- POST /api/generate-site ---
    if (req.method === "POST" && req.url === "/api/generate-site") {
      const { inspirations, content, additionalNotes } = JSON.parse(await readBody(req));

      if (!inspirations || inspirations.filter((i) => i.analysis).length === 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "At least one analyzed inspiration is required." }));
      }

      const html = await generateSite(inspirations, content, additionalNotes);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ html }));
    }

    // --- Static files ---
    const urlPath = req.url === "/" ? "/index.html" : req.url?.split("?")[0] ?? "/index.html";
    const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(PUBLIC_DIR, safePath);
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    const data = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
    });
    return res.end(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      res.writeHead(404);
      return res.end("Not found");
    }
    console.error(err);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: err.message || "Internal server error" }));
  }
});

server.listen(PORT, () => {
  console.log(`Website Builder running at http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("Warning: ANTHROPIC_API_KEY is not set — API calls will fail");
  }
});
