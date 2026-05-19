import { initRouter } from "./router.js";
import { renderPointsOfSail } from "./points-of-sail.js";

const appRoot = document.querySelector("#app");
const toastElement = document.querySelector("#toast");

const APP_CONFIG = {
  contentPath: "en.json",
  modulesPath: "modules.json",
  unfinishedModuleDelayMs: 950
};

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Could not load ${path}. Status: ${response.status}`);
  }

  return response.json();
}

function showToast(message) {
  toastElement.textContent = message;
  toastElement.classList.add("visible");

  window.clearTimeout(showToast.hideTimer);
  showToast.hideTimer = window.setTimeout(() => {
    toastElement.classList.remove("visible");
  }, 3400);
}

function redirectToPoints(message) {
  if (message) {
    showToast(message);
  }

  window.setTimeout(() => {
    window.location.hash = "#/points-of-sail";
  }, APP_CONFIG.unfinishedModuleDelayMs);
}

function renderFatalError(error) {
  console.error(error);

  appRoot.innerHTML = `
    <main class="page-shell">
      <section class="page-section">
        <div class="card disclaimer-box">
          <h1>App could not load</h1>
          <p>
            The prototype files are present, but the browser could not load the data files.
          </p>
          <p>
            For local testing, open this folder through a simple local web server instead of opening
            <code>index.html</code> directly from the file system.
          </p>
          <p>
            Example: run <code>python -m http.server</code> inside the project folder and open
            <code>http://localhost:8000</code>.
          </p>
        </div>
      </section>
    </main>
  `;
}

async function bootApp() {
  try {
    const [content, modules] = await Promise.all([
      loadJson(APP_CONFIG.contentPath),
      loadJson(APP_CONFIG.modulesPath)
    ]);

    initRouter({
      root: appRoot,
      content,
      modules,
      renderPointsOfSail,
      showToast,
      redirectToPoints
    });
  } catch (error) {
    renderFatalError(error);
  }
}

bootApp();
