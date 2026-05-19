const TEXT = {
  nav: { home: "Home", tool: "Tool" },
  app: {
    brandTitle: "Task-B",
    brandSubtitle: "Instructional Tool",
    unfinishedToast: "This chapter is still being built. For now, start with Points of Sail.",
    feedbackToast: "Feedback form is not connected yet. Screenshot the issue and send it to Bart for this test round."
  },
  home: {
    eyebrow: "Public prototype",
    title: "Visual sailing lessons that work on your phone.",
    lead: "Task-B Sailing School is building a practical, interactive learning tool for students. The first test module is Points of Sail.",
    primaryCta: "Open Points of Sail",
    secondaryCta: "Browse planned chapters"
  },
  modules: [
    { id: "points", title: "Points of Sail", description: "Wind angle, no-go zone, reaches, dead run and basic sail trim.", status: "active" },
    { id: "trim", title: "Basic Sail Trim", description: "Sheeting in, easing out, luffing, tell-tales and first trim checks.", status: "soon" },
    { id: "tack", title: "Tacking & Gybing", description: "Changing direction through or away from the wind with clear crew communication.", status: "soon" },
    { id: "reef", title: "Reefing", description: "Reducing sail area, crew roles and safe timing decisions.", status: "soon" },
    { id: "harbour", title: "Harbour Manoeuvres", description: "Slow-speed control, windage, prop walk and berthing basics.", status: "soon" },
    { id: "anchor", title: "Anchoring Basics", description: "Depth, scope, holding, swing room and simple checks.", status: "soon" }
  ],
  points: {
    eyebrow: "Module 1",
    title: "Points of Sail",
    goal: "Drag the boat left or right. The wind stays fixed. Watch the point of sail, memory cues and sail trim change.",
    dragHint: "Tap/hold the boat and drag left or right to rotate it.",
    buttonsTitle: "Jump to a point of sail",
    feedbackButton: "Feedback",
    resetButton: "Reset into wind",
    factsTitle: "Facts",
    bridgeTitle: "Memory cues",
    trimTitle: "Precise sail trim",
    labels: { name: "Name", angle: "Wind angle", trim: "Basic trim" },
    list: {
      noGo: {
        key: "noGo", label: "Into wind / No-go zone", angle: "0–35°", trimShort: "No drive — sails luffing",
        facts: "The bow is too close to the wind. The sails cannot create useful drive and the boat may slow, stop or drift sideways.",
        bridge: "Wind on your nose or both cheeks. A small flag would stream straight back over the deck. If you keep trying to sail here, the boat feels weak and noisy.",
        trim: "Do not trim harder to fix this. Bear away first until the sails can fill. Then trim in again for close-hauled or close reach.",
        sailAngle: 6, jibAngle: 5, heading: 0, cls: "danger"
      },
      closeHauled: {
        key: "closeHauled", label: "Close-hauled", angle: "35–52°", trimShort: "Sails in tight",
        facts: "This is the closest practical course to the wind. You are sailing upwind, but not directly into it.",
        bridge: "Wind on the front cheek. Looking forward, the wind feels forward and slightly to one side. A flag points aft but still pulls strongly from ahead.",
        trim: "Mainsail and headsail are trimmed in tight. Keep the sail just full, not luffing. If the luff shakes, you may be too high or under-trimmed.",
        sailAngle: 14, jibAngle: 11, heading: 44, cls: "upwind"
      },
      closeReach: {
        key: "closeReach", label: "Close reach", angle: "52–80°", trimShort: "Eased slightly, still inside the boat’s bounds",
        facts: "The boat has turned away from close-hauled. The sails can be eased a little and the boat often feels faster and more comfortable.",
        bridge: "Wind still forward, but less on the nose. It feels more like the wind is crossing your forward shoulder than hitting your face directly.",
        trim: "Ease the sails slightly, but keep them within the visual bounds of the boat. Trim until the front edge just stops lifting.",
        sailAngle: 26, jibAngle: 22, heading: 65, cls: "upwind"
      },
      beamReach: {
        key: "beamReach", label: "Beam reach", angle: "80–110°", trimShort: "Sails roughly half out",
        facts: "The wind is coming from the side of the boat. This is often one of the easiest and clearest points of sail to feel.",
        bridge: "Wind on your ear or directly on the side of your face. A flag would stream sideways across the boat.",
        trim: "Sails are about halfway out. If the front of the sail luffs, sheet in a little. If it feels over-tight and stalled, ease a little.",
        sailAngle: 45, jibAngle: 38, heading: 90, cls: "reach"
      },
      broadReach: {
        key: "broadReach", label: "Broad reach", angle: "110–155°", trimShort: "Well eased — near spreader limit",
        facts: "The wind is coming from behind the side of the boat. The boat is moving downwind, but not dead downwind yet.",
        bridge: "Wind behind your ear or across the back corner of your neck. A flag streams forward and out to the opposite side.",
        trim: "Ease the mainsail until it approaches the spreader/shroud limit. Watch for a horizontal crease or ugly twist as the sail presses against rigging. Do not force it harder into the spreaders.",
        sailAngle: 68, jibAngle: 58, heading: 132, cls: "broad"
      },
      deadRun: {
        key: "deadRun", label: "Dead run", angle: "155–180°", trimShort: "Far eased — gybe risk high",
        facts: "The wind is almost directly behind the boat. It can feel calm on deck, but the boom can gybe violently if the wind crosses the stern.",
        bridge: "Wind behind your head. The boat may feel quieter because you move with the wind. A flag points forward over the bow.",
        trim: "Main is far out. Watch the boom, keep people clear, and avoid accidental gybes. Later modules will cover preventers, gybe angles and safer downwind courses.",
        sailAngle: 84, jibAngle: 76, heading: 180, cls: "downwind"
      }
    }
  }
};

const state = { route: "home", heading: 44, dragging: false, startX: 0, startHeading: 44 };
const app = document.getElementById("app");
const toast = document.getElementById("toast");

function icon(type) {
  if (type === "home") return `<svg class="rail-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 19.5v-9Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
  return `<svg class="rail-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 4h8l1 3h2v14H5V7h2l1-3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 11h6M9 15h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
}

function layout(inner) {
  return `
    <aside id="sideRail" class="side-rail" aria-label="Main navigation">
      <div class="rail-brand">
        <div class="brand-mark">B</div>
        <div class="brand-copy"><span class="brand-title">${TEXT.app.brandTitle}</span><span class="brand-subtitle">${TEXT.app.brandSubtitle}</span></div>
        <button id="railToggle" class="rail-toggle" type="button" aria-label="Open menu">☰</button>
      </div>
      <nav class="rail-nav">
        <button class="rail-link ${state.route === "home" ? "active" : ""}" data-route="home">${icon("home")}<span class="rail-label">${TEXT.nav.home}</span></button>
        <button class="rail-link ${state.route === "tool" ? "active" : ""}" data-route="tool">${icon("tool")}<span class="rail-label">${TEXT.nav.tool}</span></button>
      </nav>
    </aside>
    <main class="app-shell">${inner}</main>`;
}

function renderHome() {
  return layout(`
    <section class="page hero">
      <div>
        <span class="eyebrow">${TEXT.home.eyebrow}</span>
        <h1>${TEXT.home.title}</h1>
        <p class="lead">${TEXT.home.lead}</p>
        <div class="actions">
          <button class="btn btn-primary" data-route="tool">${TEXT.home.primaryCta}</button>
          <button class="btn btn-secondary" data-route="modules">${TEXT.home.secondaryCta}</button>
        </div>
      </div>
      ${pointsVisual()}
    </section>`);
}

function renderTool() {
  return layout(`
    <section class="page">
      <span class="eyebrow">${TEXT.points.eyebrow}</span>
      <h1>${TEXT.points.title}</h1>
      <p class="lead">${TEXT.points.goal}</p>
      <div class="actions">
        <button class="btn btn-secondary" id="resetBtn">${TEXT.points.resetButton}</button>
        <button class="btn btn-orange" id="feedbackBtn">${TEXT.points.feedbackButton}</button>
      </div>
      <div style="height:1rem"></div>
      ${pointsVisual()}
      ${pointButtons()}
      <section class="card about-card">
        <h2>Prototype note</h2>
        <p>This tool supports practical sailing instruction. It does not replace onboard safety briefings, local rules, boat-specific procedures, instructor judgement or weather decisions.</p>
      </section>
    </section>`);
}

function renderModules() {
  return layout(`
    <section class="page">
      <span class="eyebrow">Planned chapters</span>
      <h1>Learning structure</h1>
      <p class="lead">Only Points of Sail is active in this test version. Other chapters return you to the working module.</p>
      <div class="module-grid">
        ${TEXT.modules.map(m => `
          <button class="module-card ${m.status === "soon" ? "soon" : ""}" data-module="${m.id}">
            <span class="status ${m.status === "soon" ? "soon" : ""}">${m.status === "active" ? "Ready" : "Coming soon"}</span>
            <h3>${m.title}</h3>
            <p>${m.description}</p>
          </button>`).join("")}
      </div>
    </section>`);
}

function pointsVisual() {
  const point = getPoint(state.heading);
  const signed = signedAngle(state.heading);
  const sailSide = signed >= 0 ? 1 : -1;
  const mainAngle = point.sailAngle;
  const jibAngle = point.jibAngle;
  return `
    <section class="visual-stage" aria-label="Interactive points of sail diagram">
      <div class="stage-horizon"></div>
      <div class="no-go-wedge"></div>
      <div class="wind-column"><span>Wind</span><span class="wind-arrow">↓</span></div>
      <div class="no-go-text">No-go zone</div>
      <div class="degree-label deg-0">0°</div><div class="degree-label deg-90-l">90°</div><div class="degree-label deg-90-r">90°</div><div class="degree-label deg-180">180°</div>
      <div id="boatZone" class="boat-zone" aria-label="Drag area for rotating the boat">
        <div id="boat" class="boat ${point.cls}" style="--heading:${state.heading}deg; --sail-side:${sailSide}; --main-angle:${mainAngle}deg; --jib-angle:${jibAngle}deg;">
          <div class="main-sail"></div><div class="jib-sail"></div><div class="sail-crease"></div><div class="mast"></div><div class="hull"><div class="cockpit"></div></div>
        </div>
      </div>
      <div class="info-clouds">
        <article class="info-cloud cloud-facts"><h3>${TEXT.points.factsTitle}</h3><div class="fact-list"><div class="fact-row"><span>${TEXT.points.labels.name}</span><span>${point.label}</span></div><div class="fact-row"><span>${TEXT.points.labels.angle}</span><span>${point.angle}</span></div><div class="fact-row"><span>${TEXT.points.labels.trim}</span><span>${point.trimShort}</span></div></div><p style="margin-top:.7rem">${point.facts}</p></article>
        <article class="info-cloud cloud-bridge"><h3>${TEXT.points.bridgeTitle}</h3><p>${point.bridge}</p></article>
        <article class="info-cloud cloud-trim"><h3>${TEXT.points.trimTitle}</h3><p>${point.trim}</p></article>
      </div>
    </section>`;
}

function pointButtons() {
  const points = Object.values(TEXT.points.list);
  return `<section class="card" style="margin-top:1rem"><h2>${TEXT.points.buttonsTitle}</h2><div class="point-buttons">${points.map(p => `<button class="point-button ${getPoint(state.heading).key === p.key ? "active" : ""}" data-heading="${p.heading}">${p.label}</button>`).join("")}</div></section>`;
}

function signedAngle(angle) {
  let n = ((angle % 360) + 360) % 360;
  if (n > 180) n -= 360;
  return n;
}
function getPoint(heading) {
  const a = Math.abs(signedAngle(heading));
  const p = TEXT.points.list;
  if (a < 35) return p.noGo;
  if (a < 52) return p.closeHauled;
  if (a < 80) return p.closeReach;
  if (a < 110) return p.beamReach;
  if (a < 155) return p.broadReach;
  return p.deadRun;
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("visible"), 3000);
}
function route(to) {
  state.route = to === "modules" ? "modules" : to === "tool" ? "tool" : "home";
  render();
}
function attachEvents() {
  document.querySelectorAll("[data-route]").forEach(btn => btn.addEventListener("click", () => route(btn.dataset.route)));
  const toggle = document.getElementById("railToggle");
  const rail = document.getElementById("sideRail");
  if (toggle && rail) toggle.addEventListener("click", () => rail.classList.toggle("is-open"));
  document.querySelectorAll("[data-module]").forEach(btn => btn.addEventListener("click", () => {
    if (btn.dataset.module === "points") route("tool");
    else { showToast(TEXT.app.unfinishedToast); setTimeout(() => route("tool"), 650); }
  }));
  document.querySelectorAll("[data-heading]").forEach(btn => btn.addEventListener("click", () => { state.heading = Number(btn.dataset.heading); render(); }));
  const reset = document.getElementById("resetBtn");
  if (reset) reset.addEventListener("click", () => { state.heading = 0; render(); });
  const feedback = document.getElementById("feedbackBtn");
  if (feedback) feedback.addEventListener("click", () => showToast(TEXT.app.feedbackToast));
  const zone = document.getElementById("boatZone");
  if (zone) {
    zone.addEventListener("pointerdown", e => {
      state.dragging = true; state.startX = e.clientX; state.startHeading = state.heading;
      zone.classList.add("dragging"); zone.setPointerCapture(e.pointerId);
    });
    zone.addEventListener("pointermove", e => {
      if (!state.dragging) return;
      const delta = e.clientX - state.startX;
      state.heading = Math.round((((state.startHeading + delta * 0.7) % 360) + 360) % 360);
      updateVisualOnly();
    });
    zone.addEventListener("pointerup", e => { state.dragging = false; zone.classList.remove("dragging"); zone.releasePointerCapture(e.pointerId); render(); });
    zone.addEventListener("pointercancel", () => { state.dragging = false; zone.classList.remove("dragging"); render(); });
  }
}
function updateVisualOnly() {
  const boat = document.getElementById("boat");
  if (!boat) return;
  const point = getPoint(state.heading);
  const signed = signedAngle(state.heading);
  const sailSide = signed >= 0 ? 1 : -1;
  boat.className = `boat ${point.cls}`;
  boat.style.setProperty("--heading", `${state.heading}deg`);
  boat.style.setProperty("--sail-side", sailSide);
  boat.style.setProperty("--main-angle", `${point.sailAngle}deg`);
  boat.style.setProperty("--jib-angle", `${point.jibAngle}deg`);
}
function render() {
  if (state.route === "tool") app.innerHTML = renderTool();
  else if (state.route === "modules") app.innerHTML = renderModules();
  else app.innerHTML = renderHome();
  attachEvents();
}
render();
