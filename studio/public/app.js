const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const SAMPLE = {
  name: "Nyla",
  genre: "late-night R&B / neo-soul",
  influences: "sparse, intimate — SZA × Sade × Steve Lacy",
  following: "12k IG, 4k monthly Spotify",
  platform: "Instagram + Spotify",
  audience: "18-28, late-night listeners, US + Europe",
  brand: "intimacy at 2am — quiet, confident, never hype",
  release: "single 'Slow Hours', out now",
  goal: "25k monthly listeners, first sync placement",
  notes: "I write everything at night. Berlin listeners just started showing up and I don't know why."
};

const BREW_MSGS = [
  "Your team is reviewing your week…",
  "Brand Manager is checking your voice…",
  "PR is scanning for opportunities your size…",
  "Content Creator is drafting this week's posts…",
  "Executive Assistant is planning the rollout…"
];

function show(id) {
  ["onboarding", "loading", "dashboard"].forEach((s) => $("#" + s).classList.toggle("hidden", s !== id));
  $("#resetBtn").classList.toggle("hidden", id === "onboarding");
}

// --- Onboarding ---
$("#fillSample").addEventListener("click", () => {
  const f = $("#profileForm");
  Object.entries(SAMPLE).forEach(([k, v]) => { if (f.elements[k]) f.elements[k].value = v; });
});

$("#resetBtn").addEventListener("click", () => { show("onboarding"); });

$("#profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  if (!data.name?.trim() || !data.genre?.trim()) return;

  show("loading");
  let i = 0;
  $("#brewMsg").textContent = BREW_MSGS[0];
  const cycle = setInterval(() => { i = (i + 1) % BREW_MSGS.length; $("#brewMsg").textContent = BREW_MSGS[i]; }, 1400);

  try {
    const res = await fetch("/api/briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: data })
    });
    const briefing = await res.json();
    clearInterval(cycle);
    if (!res.ok) throw new Error(briefing.error || "Something went wrong.");
    renderDashboard(briefing);
  } catch (err) {
    clearInterval(cycle);
    alert(err.message || "Could not reach your team. Try again.");
    show("onboarding");
  }
});

// --- Dashboard ---
function renderDashboard(b) {
  $("#demoBanner").classList.toggle("hidden", !b.demo);
  $("#todayDate").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  $("#greeting").textContent = b.greeting || "";
  $("#headline").textContent = b.headline || "";

  // Analytics
  $("#anMetric").textContent = b.analytics_insight?.metric || "";
  $("#anObservation").textContent = b.analytics_insight?.observation || "";
  $("#anAction").textContent = b.analytics_insight?.action || "";

  // Brand note
  $("#brandInsight").textContent = b.brand_note?.insight || "";
  $("#brandGuidance").textContent = b.brand_note?.guidance || "";

  // Tasks
  const tl = $("#taskList"); tl.innerHTML = "";
  (b.today_tasks || []).forEach((t) => {
    const li = el("li", "task-item");
    const chip = `<span class="agent-chip ${agentClass(t.agent)}">${esc(t.agent)}</span>`;
    li.innerHTML = `
      <div class="task-check" role="checkbox" aria-checked="false"></div>
      <div class="task-body">
        <div class="task-title">${esc(t.task)}</div>
        <div class="task-meta">${esc(t.why)} · ~${esc(t.est_minutes)} min · ${chip}</div>
      </div>`;
    const check = li.querySelector(".task-check");
    check.addEventListener("click", () => {
      const done = check.classList.toggle("done");
      li.classList.toggle("done", done);
      check.setAttribute("aria-checked", done);
    });
    tl.appendChild(li);
  });

  // Content calendar
  const cal = $("#calendar"); cal.innerHTML = "";
  (b.content_calendar || []).forEach((p) => cal.appendChild(renderPost(p)));

  // PR
  const pr = $("#prList"); pr.innerHTML = "";
  (b.pr_opportunities || []).forEach((o) => pr.appendChild(renderPR(o)));

  // Week plan
  const wp = $("#weekPlan"); wp.innerHTML = "";
  (b.week_plan || []).forEach((d) => {
    const col = el("div", "day-col");
    col.innerHTML = `<div class="day-name">${esc(d.day)}</div><div class="day-focus">${esc(d.focus)}</div>`;
    const ul = el("ul", "day-items");
    (d.items || []).forEach((it) => ul.appendChild(el("li", null, esc(it))));
    col.appendChild(ul);
    wp.appendChild(col);
  });

  updateApproveCount();
  show("dashboard");
  window.scrollTo(0, 0);
}

function agentClass(a) {
  return { "Brand Manager": "brand", "PR": "pr", "Content Creator": "content", "Executive Assistant": "ea" }[a] || "ea";
}

function renderPost(p) {
  const card = el("div", "post");
  card.dataset.state = "pending";
  const tags = (p.hashtags || []).map((h) => `<span class="tag-pill">#${esc(h)}</span>`).join("");
  card.innerHTML = `
    <div class="post-top">
      <span class="pill day">${esc(p.day)}</span>
      <span class="pill">${esc(p.platform)}</span>
      <span class="pill">${esc(p.type)}</span>
      <span class="status-tag"></span>
    </div>
    <p class="post-hook">${esc(p.hook)}</p>
    <textarea class="post-caption" rows="3">${esc(p.caption)}</textarea>
    <p class="post-visual"><strong>Shoot:</strong> ${esc(p.visual_direction)}</p>
    <div class="tags">${tags}</div>
    <div class="post-actions">
      <button class="mini-btn approve">✓ Approve &amp; schedule</button>
      <button class="mini-btn skip">Skip this week</button>
    </div>`;
  const status = card.querySelector(".status-tag");
  card.querySelector(".approve").addEventListener("click", (e) => {
    const on = card.dataset.state !== "approved";
    card.dataset.state = on ? "approved" : "pending";
    card.classList.toggle("approved", on); card.classList.remove("skipped");
    e.target.classList.toggle("active", on);
    status.textContent = on ? "Scheduled ✓" : ""; status.className = "status-tag ok";
    updateApproveCount();
  });
  card.querySelector(".skip").addEventListener("click", () => {
    card.dataset.state = "skipped";
    card.classList.add("skipped"); card.classList.remove("approved");
    card.querySelector(".approve").classList.remove("active");
    status.textContent = "Skipped"; status.className = "status-tag no";
    updateApproveCount();
  });
  return card;
}

function renderPR(o) {
  const card = el("div", "pr-item");
  card.dataset.state = "pending";
  card.innerHTML = `
    <div class="post-top">
      <span class="pill">${esc(o.type)}</span>
      <span class="status-tag"></span>
    </div>
    <div class="pr-target">${esc(o.target)}</div>
    <p class="pr-why">${esc(o.why_fit)}</p>
    <textarea class="pr-pitch" rows="4">${esc(o.draft_pitch)}</textarea>
    <div class="post-actions">
      <button class="mini-btn approve">✓ Approve &amp; send</button>
      <button class="mini-btn skip">Not now</button>
    </div>`;
  const status = card.querySelector(".status-tag");
  card.querySelector(".approve").addEventListener("click", (e) => {
    const on = card.dataset.state !== "approved";
    card.dataset.state = on ? "approved" : "pending";
    card.classList.toggle("approved", on); card.classList.remove("skipped");
    e.target.classList.toggle("active", on);
    status.textContent = on ? "Queued to send ✓" : ""; status.className = "status-tag ok";
    updateApproveCount();
  });
  card.querySelector(".skip").addEventListener("click", () => {
    card.dataset.state = "skipped";
    card.classList.add("skipped"); card.classList.remove("approved");
    card.querySelector(".approve").classList.remove("active");
    status.textContent = "Skipped"; status.className = "status-tag no";
    updateApproveCount();
  });
  return card;
}

function updateApproveCount() {
  const posts = document.querySelectorAll('#calendar .post[data-state="approved"]').length;
  const pr = document.querySelectorAll('#prList .pr-item[data-state="approved"]').length;
  $("#approveCount").textContent = `${posts} post${posts === 1 ? "" : "s"} scheduled · ${pr} pitch${pr === 1 ? "" : "es"} queued`;
}

$("#approveAll").addEventListener("click", () => {
  document.querySelectorAll('#calendar .post[data-state="pending"] .approve, #prList .pr-item[data-state="pending"] .approve')
    .forEach((btn) => btn.click());
  $("#approveAll").textContent = "Week locked in ✓";
  setTimeout(() => { $("#approveAll").textContent = "Looks good — lock in the week"; }, 1800);
});
