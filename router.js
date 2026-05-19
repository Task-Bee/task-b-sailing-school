const DEFAULT_ROUTE = "/landing";

export function initRouter(context) {
  const router = {
    context,
    start() {
      window.addEventListener("hashchange", () => this.render());
      this.render();
    },
    getRoute() {
      const rawHash = window.location.hash.replace("#", "").trim();
      return rawHash || DEFAULT_ROUTE;
    },
    setRoute(route) {
      window.location.hash = `#${route}`;
    },
    render() {
      const route = this.getRoute();

      switch (route) {
        case "/":
        case "/landing":
          this.renderPage(renderLanding(this.context), "landing");
          break;

        case "/tool":
          this.renderPage(renderToolHome(this.context), "tool");
          attachToolHomeHandlers(this.context);
          break;

        case "/modules":
          this.renderPage(renderModuleLibrary(this.context), "modules");
          attachModuleHandlers(this.context);
          break;

        case "/points-of-sail": {
          const screen = this.context.renderPointsOfSail({
            content: this.context.content,
            modules: this.context.modules,
            onComingSoon: this.context.redirectToPoints,
            showToast: this.context.showToast
          });

          this.renderPage(screen.html, "points-of-sail");
          screen.afterRender(this.context.root);
          break;
        }

        case "/coming-soon":
          this.renderPage(renderComingSoon(this.context), "modules");
          window.setTimeout(() => {
            this.setRoute("/points-of-sail");
          }, 1200);
          break;

        case "/about":
          this.renderPage(renderAbout(this.context), "about");
          break;

        default:
          this.renderPage(renderNotFound(this.context), "landing");
          break;
      }
    },
    renderPage(pageHtml, activeKey) {
      this.context.root.innerHTML = renderLayout(this.context, pageHtml, activeKey);
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  router.start();
}

function renderLayout(context, pageHtml, activeKey) {
  const nav = context.content.navigation;

  return `
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="#/landing" aria-label="${escapeHtml(nav.brandAria)}">
          <span class="brand-mark">B</span>
          <span class="brand-text">
            <span class="brand-title">${escapeHtml(nav.brandTitle)}</span>
            <span class="brand-subtitle">${escapeHtml(nav.brandSubtitle)}</span>
          </span>
        </a>

        <nav class="top-nav" aria-label="Main navigation">
          ${renderNavLink("/landing", nav.links.landing, activeKey === "landing")}
          ${renderNavLink("/tool", nav.links.tool, activeKey === "tool")}
          ${renderNavLink("/modules", nav.links.modules, activeKey === "modules" || activeKey === "points-of-sail")}
          ${renderNavLink("/about", nav.links.about, activeKey === "about")}
        </nav>

        <nav class="mobile-nav" aria-label="Compact navigation">
          <a href="#/tool" aria-label="${escapeHtml(nav.links.tool)}">↗</a>
          <a href="#/modules" aria-label="${escapeHtml(nav.links.modules)}">☰</a>
        </nav>
      </div>
    </header>

    ${pageHtml}

    <footer class="page-shell footer-note">
      ${escapeHtml(context.content.footer.note)}
    </footer>
  `;
}

function renderNavLink(route, label, isActive) {
  return `
    <a href="#${route}" class="${isActive ? "active" : ""}">
      ${escapeHtml(label)}
    </a>
  `;
}

function renderLanding(context) {
  const landing = context.content.pages.landing;

  return `
    <main class="page-shell">
      <section class="hero">
        <div class="hero-card">
          <span class="eyebrow">${escapeHtml(landing.eyebrow)}</span>
          <h1>${escapeHtml(landing.title)}</h1>
          <p class="lead">${escapeHtml(landing.lead)}</p>

          <div class="hero-actions">
            <a class="button button-primary" href="#/tool">
              ${escapeHtml(landing.primaryCta)}
            </a>
            <a class="button button-secondary" href="#/about">
              ${escapeHtml(landing.secondaryCta)}
            </a>
          </div>
        </div>

        <div class="card-grid">
          ${landing.featureCards.map(card => `
            <article class="card">
              <h3>${escapeHtml(card.title)}</h3>
              <p>${escapeHtml(card.text)}</p>
            </article>
          `).join("")}
        </div>
      </section>
    </main>
  `;
}

function renderToolHome(context) {
  const page = context.content.pages.toolHome;
  const activeModule = context.modules.modules.find(module => module.status === "active");

  return `
    <main class="page-shell">
      <section class="page-section">
        <span class="eyebrow">${escapeHtml(page.eyebrow)}</span>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="lead">${escapeHtml(page.lead)}</p>

        <div class="tool-home-grid">
          <article class="continue-card">
            <h2>${escapeHtml(page.continueTitle)}</h2>
            <p>${escapeHtml(page.continueText)}</p>
            <div class="action-row">
              <a class="button button-orange" href="#${activeModule.route}">
                ${escapeHtml(page.continueCta)}
              </a>
            </div>
          </article>

          <article class="card">
            <h2>${escapeHtml(page.libraryTitle)}</h2>
            <p>${escapeHtml(page.libraryText)}</p>
            <div class="action-row">
              <a class="button button-secondary" href="#/modules">
                ${escapeHtml(page.libraryCta)}
              </a>
            </div>
          </article>
        </div>
      </section>
    </main>
  `;
}

function renderModuleLibrary(context) {
  const page = context.content.pages.modules;
  const modules = context.modules.modules;

  return `
    <main class="page-shell">
      <section class="page-section">
        <span class="eyebrow">${escapeHtml(page.eyebrow)}</span>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="lead">${escapeHtml(page.lead)}</p>

        <div class="card-grid">
          ${modules.map(module => renderModuleCard(module, context.content)).join("")}
        </div>
      </section>
    </main>
  `;
}

function renderModuleCard(module, content) {
  const isActive = module.status === "active";
  const statusClass = isActive ? "" : "soon";
  const cardClass = isActive ? "active-module" : "coming-soon";
  const statusText = isActive
    ? content.modules.status.active
    : content.modules.status.comingSoon;

  return `
    <button
      class="module-card ${cardClass}"
      type="button"
      data-module-route="${escapeHtml(module.route)}"
      data-module-status="${escapeHtml(module.status)}"
    >
      <span class="module-status ${statusClass}">
        ${escapeHtml(statusText)}
      </span>
      <h3>${escapeHtml(module.title)}</h3>
      <p>${escapeHtml(module.description)}</p>
    </button>
  `;
}

function renderComingSoon(context) {
  const page = context.content.pages.comingSoon;

  return `
    <main class="page-shell">
      <section class="page-section">
        <div class="card">
          <span class="eyebrow">${escapeHtml(page.eyebrow)}</span>
          <h1>${escapeHtml(page.title)}</h1>
          <p class="lead">${escapeHtml(page.text)}</p>
          <div class="action-row">
            <a class="button button-primary" href="#/points-of-sail">
              ${escapeHtml(page.cta)}
            </a>
          </div>
        </div>
      </section>
    </main>
  `;
}

function renderAbout(context) {
  const page = context.content.pages.about;

  return `
    <main class="page-shell">
      <section class="page-section">
        <span class="eyebrow">${escapeHtml(page.eyebrow)}</span>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="lead">${escapeHtml(page.lead)}</p>

        <div class="card-grid">
          ${page.cards.map(card => `
            <article class="card ${card.type === "disclaimer" ? "disclaimer-box" : ""}">
              <h2>${escapeHtml(card.title)}</h2>
              <p>${escapeHtml(card.text)}</p>
            </article>
          `).join("")}
        </div>
      </section>
    </main>
  `;
}

function renderNotFound(context) {
  const page = context.content.pages.notFound;

  return `
    <main class="page-shell">
      <section class="page-section">
        <div class="card">
          <h1>${escapeHtml(page.title)}</h1>
          <p>${escapeHtml(page.text)}</p>
          <a class="button button-primary" href="#/points-of-sail">
            ${escapeHtml(page.cta)}
          </a>
        </div>
      </section>
    </main>
  `;
}

function attachToolHomeHandlers() {
  // Reserved for v0.2 home interactions.
}

function attachModuleHandlers(context) {
  const moduleCards = document.querySelectorAll("[data-module-route]");

  moduleCards.forEach(card => {
    card.addEventListener("click", () => {
      const route = card.getAttribute("data-module-route");
      const status = card.getAttribute("data-module-status");

      if (status === "active") {
        window.location.hash = `#${route}`;
        return;
      }

      context.redirectToPoints(context.content.toast.unfinishedModule);
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
