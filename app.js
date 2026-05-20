const ZONES = [
  {
    key: "noGo",
    label: "Into wind / No-go",
    angle: "0–30°",
    min: 0,
    max: 30,
    target: 0,
    color: "#D9383A",
    trim: "No useful drive yet",
    memory: "Wind on your nose. This is not a normal sailing angle.",
    futureTrim: "Do not fix this by pulling harder. Bear away until the arrow leaves the red sector."
  },
  {
    key: "closeHauled",
    label: "Close-hauled",
    angle: "30–45°",
    min: 30,
    max: 45,
    target: 38,
    color: "#FF8A35",
    trim: "Sails tight",
    memory: "Wind forward on your cheek. You are climbing upwind, not aiming straight into it.",
    futureTrim: "Sails as tight as possible. Genoa stays within the bounds of the boat."
  },
  {
    key: "closeReach",
    label: "Close reach",
    angle: "45–70°",
    min: 45,
    max: 70,
    target: 58,
    color: "#F2C94C",
    trim: "Main centred, genoa by telltales",
    memory: "Wind still forward, but less aggressive. Think forward shoulder rather than nose.",
    futureTrim: "Main stays in the middle. Genoa is trimmed by telltales."
  },
  {
    key: "beamReach",
    label: "Beam reach",
    angle: "70–110°",
    min: 70,
    max: 110,
    target: 90,
    color: "#2EB872",
    trim: "Boom tip at hull side",
    memory: "Wind on your ear or shoulder. A clear, balanced point of sail.",
    futureTrim: "Boom tip on the side of the hull. Genoa trim by telltales."
  },
  {
    key: "broadReach",
    label: "Broad reach",
    angle: "110–150°",
    min: 110,
    max: 150,
    target: 130,
    color: "#2F80ED",
    trim: "Well eased",
    memory: "Wind from behind your ear. Comfortable, but the boom becomes more important.",
    futureTrim: "Ease mainsail until the spreader creates a horizontal crease. Genoa loose, but not overtaking the imaginary line in front of the boat."
  },
  {
    key: "deadRun",
    label: "Dead run",
    angle: "150–180°",
    min: 150,
    max: 180,
    target: 180,
    color: "#8E44AD",
    trim: "Broad-reach trim on both sides",
    memory: "Wind behind your head. Quiet feeling, but accidental gybe risk increases.",
    futureTrim: "Both sails trimmed as broad reach but on both sides of the mast: Butterfly / Milkmaid / Wings."
  }
];

const CENTER = { x: 500, y: 420 };
const RADIUS = 260;
let heading = 38;
let dragging = false;

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cache();
  drawTicks();
  drawSectors();
  bind();
  update(38);
});

function cache() {
  els.diagram = document.querySelector("#diagram");
  els.simulator = document.querySelector("#simulator");
  els.sectorLayer = document.querySelector("#sectorLayer");
  els.headingArrowGroup = document.querySelector("#headingArrowGroup");
  els.svgPointName = document.querySelector("#svgPointName");
  els.factPoint = document.querySelector("#factPoint");
  els.factAngle = document.querySelector("#factAngle");
  els.factTack = document.querySelector("#factTack");
  els.memoryText = document.querySelector("#memoryText");
  els.trimText = document.querySelector("#trimText");
  els.buttons = [...document.querySelectorAll(".point-button[data-target]")];
  els.toast = document.querySelector("#toast");
  els.hamburgerButton = document.querySelector("#hamburgerButton");
  els.mobileMenu = document.querySelector("#mobileMenu");
  els.feedbacks = [
    document.querySelector("#feedbackButton"),
    document.querySelector("#railFeedback"),
    document.querySelector("#mobileFeedback"),
    document.querySelector("#menuFeedback")
  ].filter(Boolean);
}

function bind() {
  els.buttons.forEach(button => {
    button.addEventListener("click", () => update(Number(button.dataset.target)));
  });

  els.simulator.addEventListener("pointerdown", event => {
    dragging = true;
    els.simulator.setPointerCapture?.(event.pointerId);
    updateFromPointer(event);
  });

  els.simulator.addEventListener("pointermove", event => {
    if (!dragging) return;
    updateFromPointer(event);
  });

  els.simulator.addEventListener("pointerup", () => dragging = false);
  els.simulator.addEventListener("pointercancel", () => dragging = false);

  els.hamburgerButton?.addEventListener("click", () => {
    els.mobileMenu.hidden = !els.mobileMenu.hidden;
  });

  els.feedbacks.forEach(button => {
    button.addEventListener("click", () => {
      showToast("Feedback form comes next. For this sprint, screenshot problems and describe what feels wrong.");
      if (els.mobileMenu) els.mobileMenu.hidden = true;
    });
  });
}

function updateFromPointer(event) {
  const point = svgPoint(event.clientX, event.clientY);
  const dx = point.x - CENTER.x;
  const dy = point.y - CENTER.y;

  let raw = Math.atan2(dx, -dy) * 180 / Math.PI;
  raw = ((raw % 360) + 360) % 360;

  // Keep the teaching model in 0-180 for now. Port/starboard is shown by side, later.
  if (raw > 180) raw = 360 - raw;

  update(raw);
}

function update(value) {
  heading = clamp(value, 0, 180);
  const zone = getZone(heading);

  els.headingArrowGroup.setAttribute("transform", `translate(500 420) rotate(${heading})`);
  els.svgPointName.textContent = zone.label;
  els.factPoint.textContent = zone.label;
  els.factAngle.textContent = zone.angle;
  els.factTack.textContent = heading === 0 ? "No tack / into wind" : "Starboard side view first";
  els.memoryText.textContent = zone.memory;
  els.trimText.textContent = zone.futureTrim;

  document.querySelectorAll(".sector").forEach(sector => {
    sector.classList.toggle("active", sector.dataset.zone === zone.key);
  });

  els.buttons.forEach(button => {
    const buttonZone = getZone(Number(button.dataset.target));
    button.classList.toggle("active", buttonZone.key === zone.key);
    if (buttonZone.key === zone.key) {
      button.style.background = zone.color;
    } else {
      button.style.background = "";
    }
  });
}

function getZone(angle) {
  return ZONES.find(zone => angle >= zone.min && angle <= zone.max) || ZONES[ZONES.length - 1];
}

function drawSectors() {
  ZONES.forEach(zone => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", `sector ${zone.key === "noGo" ? "no-go" : ""}`);
    path.setAttribute("data-zone", zone.key);
    path.setAttribute("fill", zone.color);
    path.setAttribute("d", sectorPath(zone.min, zone.max, RADIUS + 42));
    els.sectorLayer.appendChild(path);
  });
}

function sectorPath(min, max, radius) {
  const p1 = polar(min, radius);
  const p2 = polar(max, radius);
  const largeArc = max - min > 180 ? 1 : 0;
  return `M 0 0 L ${p1.x} ${p1.y} A ${radius} ${radius} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`;
}

function polar(angleDeg, radius) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return {
    x: (Math.cos(rad) * radius).toFixed(2),
    y: (Math.sin(rad) * radius).toFixed(2)
  };
}

function drawTicks() {
  const ticks = document.querySelector("#ticks");
  for (let angle = 0; angle <= 180; angle += 10) {
    const major = angle % 30 === 0;
    const inner = major ? 228 : 240;
    const outer = 258;
    const a = (angle - 90) * Math.PI / 180;
    const x1 = Math.cos(a) * inner;
    const y1 = Math.sin(a) * inner;
    const x2 = Math.cos(a) * outer;
    const y2 = Math.sin(a) * outer;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1.toFixed(2));
    line.setAttribute("y1", y1.toFixed(2));
    line.setAttribute("x2", x2.toFixed(2));
    line.setAttribute("y2", y2.toFixed(2));
    line.setAttribute("stroke", "rgba(10,37,64,.38)");
    line.setAttribute("stroke-width", major ? "4" : "2");
    line.setAttribute("stroke-linecap", "round");
    ticks.appendChild(line);
  }
}

function svgPoint(clientX, clientY) {
  const pt = els.diagram.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(els.diagram.getScreenCTM().inverse());
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("visible"), 3500);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
