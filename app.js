const appRoot = document.querySelector('#app');
const toastElement = document.querySelector('#toast');

let content = null;
let navOpen = false;
let heading = 44;
let activePointKey = 'closeHauled';
let isDragging = false;
let lastPointerX = 0;
let currentSide = 1;

const POINT_ORDER = ['noGo', 'closeHauled', 'closeReach', 'beamReach', 'broadReach', 'deadRun'];

boot();

async function boot() {
  try {
    const response = await fetch('en.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load en.json: ${response.status}`);
    content = await response.json();
    window.addEventListener('hashchange', renderRoute);
    renderRoute();
  } catch (error) {
    console.error(error);
    appRoot.innerHTML = `
      <main class="page">
        <section class="card" style="margin-top:2rem">
          <h1>App could not load</h1>
          <p>The browser could not load <code>en.json</code>. Check that <code>index.html</code>, <code>app.js</code>, <code>styles.css</code> and <code>en.json</code> are all uploaded at the repository root.</p>
        </section>
      </main>
    `;
  }
}

function getRoute() {
  return (window.location.hash || '#/home').replace('#', '');
}

function setRoute(route) {
  window.location.hash = route;
}

function renderRoute() {
  const route = getRoute();
  let pageHtml = '';
  let active = 'home';

  if (route === '/' || route === '/home') {
    pageHtml = renderHome();
    active = 'home';
  } else if (route === '/tool') {
    pageHtml = renderTool();
    active = 'tool';
  } else if (route === '/points-of-sail') {
    pageHtml = renderPointsOfSail();
    active = 'tool';
  } else if (route === '/about') {
    pageHtml = renderAbout();
    active = 'home';
  } else {
    showToast(content.app.unfinishedToast);
    window.setTimeout(() => setRoute('/points-of-sail'), 700);
    pageHtml = renderTool();
    active = 'tool';
  }

  appRoot.innerHTML = `
    <div class="app-shell">
      ${renderSideNav(active)}
      <div class="main-area">${pageHtml}</div>
    </div>
  `;

  attachGlobalHandlers();
  if (route === '/tool') attachToolHandlers();
  if (route === '/points-of-sail') attachPointsHandlers();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function renderSideNav(active) {
  return `
    <aside class="side-nav ${navOpen ? 'nav-open' : ''}" id="sideNav" aria-label="Main navigation">
      <div class="nav-inner">
        <button class="nav-brand" id="navToggle" type="button" aria-label="Open navigation">
          <span class="brand-mark">B</span>
          <span class="brand-copy">
            <span class="brand-title">${escapeHtml(content.app.brandTitle)}</span>
            <span class="brand-subtitle">${escapeHtml(content.app.brandSubtitle)}</span>
          </span>
        </button>

        <nav class="nav-links">
          <a class="nav-link ${active === 'home' ? 'active' : ''}" href="#/home">
            <span class="nav-icon" aria-hidden="true">${homeIcon()}</span>
            <span class="nav-label">${escapeHtml(content.nav.home)}</span>
          </a>
          <a class="nav-link ${active === 'tool' ? 'active' : ''}" href="#/tool">
            <span class="nav-icon" aria-hidden="true">${clipboardIcon()}</span>
            <span class="nav-label">${escapeHtml(content.nav.tool)}</span>
          </a>
        </nav>

        <div class="nav-footer nav-label">${escapeHtml(content.app.footer)}</div>
      </div>
    </aside>
  `;
}

function renderHome() {
  const page = content.home;
  return `
    <main class="page">
      <section class="hero">
        <div class="hero-panel">
          <div class="hero-content">
            <span class="eyebrow">${escapeHtml(page.eyebrow)}</span>
            <h1>${escapeHtml(page.title)}</h1>
            <p class="lead">${escapeHtml(page.lead)}</p>
            <div class="action-row">
              <a class="button button-primary" href="#/tool">${escapeHtml(page.primaryCta)}</a>
              <a class="button button-secondary" href="#/points-of-sail">${escapeHtml(page.secondaryCta)}</a>
            </div>
          </div>
        </div>
        <div class="card-grid">
          ${page.cards.map(card => `
            <article class="card">
              <h3>${escapeHtml(card.title)}</h3>
              <p>${escapeHtml(card.text)}</p>
            </article>
          `).join('')}
        </div>
      </section>
    </main>
  `;
}

function renderTool() {
  const page = content.tool;
  return `
    <main class="page tool-page">
      <header class="tool-header">
        <span class="eyebrow">${escapeHtml(page.eyebrow)}</span>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="lead">${escapeHtml(page.lead)}</p>
      </header>
      <section class="card-grid" aria-label="Learning chapters">
        ${page.modules.map(module => renderModuleCard(module)).join('')}
      </section>
    </main>
  `;
}

function renderModuleCard(module) {
  const active = module.status === 'active';
  return `
    <button class="module-card ${active ? 'active' : 'coming-soon'}" type="button" data-module="${escapeHtml(module.id)}" data-status="${escapeHtml(module.status)}">
      <span class="status-pill ${active ? '' : 'soon'}">${active ? 'Ready' : escapeHtml(content.tool.comingSoon)}</span>
      <h2>${escapeHtml(module.title)}</h2>
      <p>${escapeHtml(module.description)}</p>
      ${active ? `<span class="button button-primary" style="margin-top:.5rem">${escapeHtml(content.tool.activeButton)}</span>` : ''}
    </button>
  `;
}

function renderAbout() {
  const page = content.about;
  return `
    <main class="page tool-page">
      <section class="card">
        <span class="eyebrow">About</span>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="lead">${escapeHtml(page.text)}</p>
        <div class="action-row">
          <a class="button button-primary" href="#/points-of-sail">Open Points of Sail</a>
        </div>
      </section>
    </main>
  `;
}

function renderPointsOfSail() {
  const lesson = content.pointsOfSail;
  const points = lesson.points;
  return `
    <main class="page lesson-page">
      <section class="lesson-shell">
        <header class="lesson-titlebar">
          <div>
            <span class="eyebrow">${escapeHtml(lesson.eyebrow)}</span>
            <h1>${escapeHtml(lesson.title)}</h1>
            <p class="lead">${escapeHtml(lesson.learningGoal)}</p>
          </div>
          <a class="button button-secondary" href="#/tool">Back to chapters</a>
        </header>

        <section class="sail-lab" id="sailLab" aria-label="Interactive points of sail lesson">
          <div class="scene" id="scene">
            <div class="no-go-wedge" aria-hidden="true"></div>
            <div class="no-go-caption">${escapeHtml(lesson.zoneLabel)}</div>
            <div class="angle-label top">0°</div>
            <div class="angle-label right">90°</div>
            <div class="angle-label bottom">180°</div>
            <div class="angle-label left">90°</div>
            <div class="wind-axis" aria-hidden="true">
              <span>${escapeHtml(lesson.windLabel)}</span>
              <span class="wind-arrow"></span>
            </div>

            <button class="boat-control" id="boatControl" type="button" aria-label="Drag left or right to rotate the boat">
              ${boatSvg()}
            </button>
          </div>

          <article class="cloud-card cloud-facts" id="factsCard">
            <h2>${escapeHtml(lesson.factsTitle)} <span class="cloud-pill" id="pointPill">—</span></h2>
            <div class="facts-grid">
              <div class="fact-line"><span class="fact-label">Name</span><span class="fact-value point-name" id="pointName">—</span></div>
              <div class="fact-line"><span class="fact-label">Relative wind</span><span class="fact-value" id="pointAngle">—</span></div>
              <div class="fact-line"><span class="fact-label">Basic trim</span><span class="fact-value" id="pointTrimShort">—</span></div>
            </div>
            <p id="factsText">—</p>
          </article>

          <article class="cloud-card cloud-bridges">
            <h2>${escapeHtml(lesson.bridgesTitle)} <span class="cloud-pill">Feel</span></h2>
            <p id="bridgeText">—</p>
          </article>

          <article class="cloud-card cloud-trim">
            <h2>${escapeHtml(lesson.trimTitle)} <span class="cloud-pill">Boat</span></h2>
            <p id="trimText">—</p>
          </article>

          <div class="controls-dock">
            <div class="controls-title-row">
              <span>${escapeHtml(lesson.dragHint)}</span>
              <span id="headingOutput">44°</span>
            </div>
            <div class="point-buttons" role="group" aria-label="Jump to a point of sail">
              ${POINT_ORDER.map(key => `
                <button class="point-button" type="button" data-point-key="${key}">${escapeHtml(points[key].label)}</button>
              `).join('')}
            </div>
            <div class="utility-actions">
              <button class="button button-secondary" id="resetButton" type="button">${escapeHtml(lesson.resetButton)}</button>
              <button class="button button-primary" id="feedbackButton" type="button">${escapeHtml(lesson.feedbackButton)}</button>
            </div>
          </div>
        </section>
      </section>
    </main>
  `;
}

function attachGlobalHandlers() {
  const toggle = document.querySelector('#navToggle');
  const sideNav = document.querySelector('#sideNav');
  if (!toggle || !sideNav) return;

  toggle.addEventListener('click', () => {
    navOpen = !navOpen;
    sideNav.classList.toggle('nav-open', navOpen);
  });
}

function attachToolHandlers() {
  document.querySelectorAll('[data-module]').forEach(button => {
    button.addEventListener('click', () => {
      if (button.dataset.status === 'active') {
        setRoute('/points-of-sail');
      } else {
        showToast(content.app.unfinishedToast);
        window.setTimeout(() => setRoute('/points-of-sail'), 750);
      }
    });
  });
}

function attachPointsHandlers() {
  const scene = document.querySelector('#scene');
  const boatControl = document.querySelector('#boatControl');
  const feedbackButton = document.querySelector('#feedbackButton');
  const resetButton = document.querySelector('#resetButton');

  const startDrag = event => {
    isDragging = true;
    lastPointerX = event.clientX;
    boatControl.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = event => {
    if (!isDragging) return;
    const deltaX = event.clientX - lastPointerX;
    lastPointerX = event.clientX;
    setHeading(heading + deltaX * 0.72);
  };

  const endDrag = () => {
    isDragging = false;
  };

  boatControl.addEventListener('pointerdown', startDrag);
  boatControl.addEventListener('pointermove', moveDrag);
  boatControl.addEventListener('pointerup', endDrag);
  boatControl.addEventListener('pointercancel', endDrag);

  scene.addEventListener('pointerdown', event => {
    if (event.target.closest('#boatControl')) return;
    isDragging = true;
    lastPointerX = event.clientX;
    scene.setPointerCapture?.(event.pointerId);
  });
  scene.addEventListener('pointermove', moveDrag);
  scene.addEventListener('pointerup', endDrag);
  scene.addEventListener('pointercancel', endDrag);

  document.querySelectorAll('[data-point-key]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.pointKey;
      const point = content.pointsOfSail.points[key];
      const sign = currentSide || 1;
      setHeading(point.heading * sign);
    });
  });

  resetButton.addEventListener('click', () => setHeading(0));
  feedbackButton.addEventListener('click', () => showToast(content.app.feedbackToast));
  setHeading(heading);
}

function setHeading(value) {
  heading = normalise360(value);
  const signed = normaliseSigned(heading);
  currentSide = signed < 0 ? -1 : 1;
  const relative = Math.abs(signed);
  const key = getPointKey(relative);
  activePointKey = key;
  const point = content.pointsOfSail.points[key];
  const side = signed < 0 ? -1 : 1;

  const boat = document.querySelector('#boatControl');
  const headingOutput = document.querySelector('#headingOutput');
  const mainSail = document.querySelector('#mainSail');
  const jibSail = document.querySelector('#jibSail');
  const boom = document.querySelector('#boom');
  const crease = document.querySelector('#sailCrease');
  const luffLines = document.querySelectorAll('.luff-lines');
  const factsCard = document.querySelector('#factsCard');

  if (!boat) return;

  const sailAngle = side * point.sailAngle;
  const jibAngle = side * point.jibAngle;
  boat.style.setProperty('--boat-heading', `${heading}deg`);
  mainSail?.setAttribute('transform', `rotate(${sailAngle} 0 0)`);
  jibSail?.setAttribute('transform', `rotate(${jibAngle} 0 -38)`);
  boom?.setAttribute('transform', `rotate(${sailAngle} 0 0)`);

  const showCrease = key === 'broadReach' || key === 'deadRun';
  crease?.classList.toggle('visible', showCrease);
  luffLines.forEach(line => line.classList.toggle('visible', key === 'noGo'));

  headingOutput.textContent = `${Math.round(heading)}° boat heading`;
  setText('#pointName', point.label);
  setText('#pointPill', point.angle);
  setText('#pointAngle', `${Math.round(relative)}° (${point.angle})`);
  setText('#pointTrimShort', point.trimShort);
  setText('#factsText', point.facts);
  setText('#bridgeText', point.bridge);
  setText('#trimText', point.trim);

  factsCard?.classList.toggle('warning-state', key === 'noGo');
  document.querySelectorAll('[data-point-key]').forEach(button => {
    button.classList.toggle('active', button.dataset.pointKey === key);
  });
}

function getPointKey(relative) {
  if (relative < 35) return 'noGo';
  if (relative < 52) return 'closeHauled';
  if (relative < 80) return 'closeReach';
  if (relative < 110) return 'beamReach';
  if (relative < 155) return 'broadReach';
  return 'deadRun';
}

function normalise360(value) {
  return ((value % 360) + 360) % 360;
}

function normaliseSigned(value) {
  const normal = normalise360(value);
  return normal > 180 ? normal - 360 : normal;
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function showToast(message) {
  toastElement.textContent = message;
  toastElement.classList.add('visible');
  window.clearTimeout(showToast.hideTimer);
  showToast.hideTimer = window.setTimeout(() => toastElement.classList.remove('visible'), 3200);
}

function homeIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10.5V20h13v-9.5"></path><path d="M9.5 20v-6h5v6"></path></svg>`;
}

function clipboardIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6l1 2h3v15H5V6h3l1-2Z"></path><path d="M9 10h6"></path><path d="M9 14h6"></path><path d="M9 18h4"></path></svg>`;
}

function boatSvg() {
  return `
    <svg viewBox="-115 -145 230 290" aria-hidden="true">
      <g id="jibSail" transform="rotate(11 0 -38)">
        <path class="jib-sail-shape" d="M 0 -98 C 28 -82 48 -48 53 -4 C 27 -18 9 -30 0 -38 Z"></path>
      </g>
      <g id="mainSail" transform="rotate(14 0 0)">
        <path class="main-sail-shape" d="M 0 -72 C 39 -43 67 14 70 80 C 38 52 16 22 0 0 Z"></path>
        <path id="sailCrease" class="sail-crease" d="M 19 16 C 36 27 50 43 61 63"></path>
        <path class="luff-lines" d="M 7 -44 C 18 -29 24 -12 25 2"></path>
      </g>
      <path class="hull-shape" d="M 0 -116 C 46 -72 52 70 0 126 C -52 70 -46 -72 0 -116 Z"></path>
      <path class="deck-shape" d="M 0 -54 C 22 -25 23 45 0 76 C -23 45 -22 -25 0 -54 Z"></path>
      <path class="spreaders" d="M -42 -16 H 42"></path>
      <path class="mast-line" d="M 0 -104 V 94"></path>
      <g id="boom" transform="rotate(14 0 0)">
        <path class="boom-line" d="M 0 0 L 76 76"></path>
      </g>
      <path class="luff-lines" d="M -20 -96 C -26 -69 -26 -40 -19 -10"></path>
    </svg>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
