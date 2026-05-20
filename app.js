const ZONES = [
  {
    key: "noGo",
    label: "Into wind / No-go",
    angle: "0–30°",
    min: 0,
    max: 30,
    target: 0,
    color: "#D9383A",
    memory: "Wind on your nose. This is not a normal sailing angle.",
    futureTrim: "Do not fix this by pulling harder. Bear away until the bow leaves the red sector.",
    main: 4,
    genoa: 3
  },
  {
    key: "closeHauled",
    label: "Close-hauled",
    angle: "30–45°",
    min: 30,
    max: 45,
    target: 38,
    color: "#FF8A35",
    memory: "Wind forward on your cheek. You are climbing upwind, not aiming straight into it.",
    futureTrim: "Sails as tight as possible. Genoa stays within the bounds of the boat.",
    main: 12,
    genoa: 9
  },
  {
    key: "closeReach",
    label: "Close reach",
    angle: "45–70°",
    min: 45,
    max: 70,
    target: 58,
    color: "#F2C94C",
    memory: "Wind still forward, but less aggressive. Think forward shoulder rather than nose.",
    futureTrim: "Main stays in the middle. Genoa is trimmed by telltales.",
    main: 20,
    genoa: 22
  },
  {
    key: "beamReach",
    label: "Beam reach",
    angle: "70–110°",
    min: 70,
    max: 110,
    target: 90,
    color: "#2EB872",
    memory: "Wind on your ear or shoulder. A clear, balanced point of sail.",
    futureTrim: "Boom tip on the side of the hull. Genoa trim by telltales.",
    main: 44,
    genoa: 42
  },
  {
    key: "broadReach",
    label: "Broad reach",
    angle: "110–150°",
    min: 110,
    max: 150,
    target: 130,
    color: "#2F80ED",
    memory: "Wind from behind your ear. Comfortable, but the boom becomes more important.",
    futureTrim: "Ease mainsail until the spreader creates a horizontal crease. Genoa loose, but not overtaking the imaginary line in front of the boat.",
    main: 70,
    genoa: 62
  },
  {
    key: "deadRun",
    label: "Dead run",
    angle: "150–180°",
    min: 150,
    max: 180,
    target: 180,
    color: "#8E44AD",
    memory: "Wind behind your head. Quiet feeling, but accidental gybe risk increases.",
    futureTrim: "Both sails trimmed as broad reach but on both sides of the mast: Butterfly / Milkmaid / Wings.",
    main: 86,
    genoa: 76
  }
];

const CENTER = { x: 500, y: 505 };
const SECTOR_RADIUS = 390;
let continuousHeading = 38;
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
  els.boatGroup = document.querySelector("#boatGroup");
  els.mainSail = document.querySelector("#mainSail");
  els.genoaSail = document.querySelector("#genoaSail");
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
    button.addEventListener("click", () => {
      const target = Number(button.dataset.target);
      const signed = normalizeSigned(continuousHeading);
      const side = signed < 0 ? -1 : 1;
      const correctedTarget = target === 0 || target === 180 ? target : target * side;
      update(correctedTarget);
    });
  });

  els.simulator.addEventListener("pointerdown", event => {
    dragging = true;
    els.simulator.classList.add("dragging");
    els.simulator.setPointerCapture?.(event.pointerId);
    updateFromPointer(event);
  });

  els.simulator.addEventListener("pointermove", event => {
    if (!dragging) return;
    updateFromPointer(event);
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach(name => {
    els.simulator.addEventListener(name, () => {
      dragging = false;
      els.simulator.classList.remove("dragging");
    });
  });

  els.hamburgerButton?.addEventListener("click", () => {
    els.mobileMenu.hidden = !els.mobileMenu.hidden;
  });

  els.feedbacks.forEach(button => {
    button.addEventListener("click", () => {
      showToast("Feedback form comes later. For this sprint, send a screenshot and short note.");
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

  const previous = normalize360(continuousHeading);
  let delta = raw - previous;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;

  update(continuousHeading + delta);
}

function update(value) {
  continuousHeading = value;
  const visualHeading = normalize360(continuousHeading);
  const signed = normalizeSigned(continuousHeading);
  const relative = Math.abs(signed);
  const side = getSide(signed, relative);
  const zone = getZone(relative);

  els.boatGroup.setAttribute("transform", `translate(500 505) rotate(${visualHeading}) scale(1.20)`);

  updateSails(zone, signed, relative);
  updateText(zone, relative, signed);
  updateActiveSectors(zone, side);
  updateButtons(zone);
}

function getSide(signed, relative) {
  if (relative < 0.5 || relative > 179.5) return "center";
  return signed >= 0 ? "positive" : "negative";
}

function updateSails(zone, signed, relative) {
  let side = signed >= 0 ? 1 : -1;
  if (relative < 2) side = 1;

  let mainSide = side;
  let genoaSide = side;

  if (zone.key === "deadRun") {
    mainSide = side;
    genoaSide = -side;
  }

  els.mainSail.setAttribute("d", createMainSail(mainSide * zone.main));
  els.genoaSail.setAttribute("d", createGenoa(genoaSide * zone.genoa));
}

function createMainSail(angle) {
  const mastTop = { x: 0, y: -46 };
  const tack = { x: 0, y: 12 };
  const boomLength = 126;

  const rad = (90 - angle) * Math.PI / 180;
  const clew = {
    x: tack.x + Math.cos(rad) * boomLength,
    y: tack.y + Math.sin(rad) * boomLength
  };

  return `M ${mastTop.x} ${mastTop.y} L ${tack.x} ${tack.y} L ${clew.x.toFixed(1)} ${clew.y.toFixed(1)} Z`;
}

function createGenoa(angle) {
  const head = { x: 0, y: -122 };
  const tack = { x: 0, y: -46 };
  const sheetLength = 138;

  const rad = (90 - angle) * Math.PI / 180;
  const clew = {
    x: tack.x + Math.cos(rad) * sheetLength,
    y: -72 + Math.sin(rad) * sheetLength
  };

  return `M ${head.x} ${head.y} L ${tack.x} ${tack.y} L ${clew.x.toFixed(1)} ${clew.y.toFixed(1)} Z`;
}

function updateText(zone, relative, signed) {
  els.svgPointName.textContent = zone.label;
  els.factPoint.textContent = zone.label;
  els.factAngle.textContent = zone.angle;

  if (relative < 30) {
    els.factTack.textContent = "No tack / into wind";
  } else if (relative > 170) {
    els.factTack.textContent = "Dead downwind";
  } else {
    els.factTack.textContent = signed >= 0 ? "Port tack" : "Starboard tack";
  }

  els.memoryText.textContent = zone.memory;
  els.trimText.textContent = zone.futureTrim;
}

function updateActiveSectors(zone, side) {
  document.querySelectorAll(".sector").forEach(sector => {
    const sameZone = sector.dataset.zone === zone.key;
    const zoneLightsBothSides = zone.key === "noGo" || zone.key === "deadRun";
    const sameSide = zoneLightsBothSides || sector.dataset.side === side || side === "center";
    sector.classList.toggle("active", sameZone && sameSide);
  });
}

function updateButtons(zone) {
  els.buttons.forEach(button => {
    const buttonZone = getZone(Number(button.dataset.target));
    button.classList.toggle("active", buttonZone.key === zone.key);
    button.style.background = buttonZone.key === zone.key ? zone.color : "";
  });
}

function getZone(relative) {
  return ZONES.find(zone => relative >= zone.min && relative <= zone.max) || ZONES[ZONES.length - 1];
}

function drawSectors() {
  const ranges = [
    { key: "noGo", color: "#D9383A", ranges: [[-30, 0, "negative"], [0, 30, "positive"]], noGo: true },
    { key: "closeHauled", color: "#FF8A35", ranges: [[30, 45, "positive"], [-45, -30, "negative"]] },
    { key: "closeReach", color: "#F2C94C", ranges: [[45, 70, "positive"], [-70, -45, "negative"]] },
    { key: "beamReach", color: "#2EB872", ranges: [[70, 110, "positive"], [-110, -70, "negative"]] },
    { key: "broadReach", color: "#2F80ED", ranges: [[110, 150, "positive"], [-150, -110, "negative"]] },
    { key: "deadRun", color: "#8E44AD", ranges: [[150, 180, "positive"], [-180, -150, "negative"]] }
  ];

  ranges.forEach(item => {
    item.ranges.forEach(range => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", `sector ${item.noGo ? "no-go" : ""}`);
      path.setAttribute("data-zone", item.key);
      path.setAttribute("data-side", range[2]);
      path.setAttribute("fill", item.color);
      path.setAttribute("d", sectorPath(range[0], range[1], SECTOR_RADIUS));
      els.sectorLayer.appendChild(path);
    });
  });
}

function sectorPath(startAngle, endAngle, radius) {
  const p1 = polar(startAngle, radius);
  const p2 = polar(endAngle, radius);
  const diff = Math.abs(endAngle - startAngle);
  const largeArc = diff > 180 ? 1 : 0;
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
  for (let angle = -180; angle <= 180; angle += 10) {
    const major = angle % 30 === 0;
    const inner = major ? 292 : 312;
    const outer = 332;
    const p1 = polar(angle, inner);
    const p2 = polar(angle, outer);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", p1.x);
    line.setAttribute("y1", p1.y);
    line.setAttribute("x2", p2.x);
    line.setAttribute("y2", p2.y);
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

function normalize360(value) {
  return ((value % 360) + 360) % 360;
}

function normalizeSigned(value) {
  const normal = normalize360(value);
  return normal > 180 ? normal - 360 : normal;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("visible"), 3500);
}
