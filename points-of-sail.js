export function renderPointsOfSail({ content, onComingSoon, showToast }) {
  const lesson = content.pointsOfSail;

  return {
    html: `
      <main class="page-shell">
        <section class="page-section points-header">
          <span class="eyebrow">${escapeHtml(lesson.eyebrow)}</span>
          <h1>${escapeHtml(lesson.title)}</h1>
          <p class="lead">${escapeHtml(lesson.learningGoal)}</p>
        </section>

        <section class="points-layout" aria-label="${escapeHtml(lesson.title)} lesson">
          ${renderToc(lesson)}
          ${renderLessonContent(lesson)}
          ${renderInteractivePanel(lesson)}
        </section>
      </main>
    `,
    afterRender(root) {
      initialisePointsOfSail(root, lesson, onComingSoon, showToast, content);
    }
  };
}

function renderToc(lesson) {
  return `
    <aside class="lesson-toc">
      <nav class="toc-card" aria-label="Lesson contents">
        <h2>${escapeHtml(lesson.tocTitle)}</h2>
        <ul class="toc-list">
          ${lesson.sections.map(section => `
            <li><a href="#${escapeHtml(section.id)}">${escapeHtml(section.title)}</a></li>
          `).join("")}
          <li><a href="#key-terms">${escapeHtml(lesson.keyTermsTitle)}</a></li>
          <li><a href="#common-mistakes">${escapeHtml(lesson.commonMistakesTitle)}</a></li>
          <li><a href="#quick-check">${escapeHtml(lesson.quickCheckTitle)}</a></li>
        </ul>
      </nav>
    </aside>
  `;
}

function renderLessonContent(lesson) {
  return `
    <article class="lesson-content">
      ${lesson.sections.map(section => `
        <section id="${escapeHtml(section.id)}" class="lesson-card">
          <h2>${escapeHtml(section.title)}</h2>
          ${section.paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </section>
      `).join("")}

      <section id="key-terms" class="lesson-card">
        <h2>${escapeHtml(lesson.keyTermsTitle)}</h2>
        <div class="term-grid">
          ${lesson.keyTerms.map(term => `
            <div class="term">
              <strong>${escapeHtml(term.term)}</strong>
              <span>${escapeHtml(term.definition)}</span>
            </div>
          `).join("")}
        </div>
      </section>

      <section id="common-mistakes" class="lesson-card">
        <h2>${escapeHtml(lesson.commonMistakesTitle)}</h2>
        <ul>
          ${lesson.commonMistakes.map(mistake => `<li>${escapeHtml(mistake)}</li>`).join("")}
        </ul>
      </section>

      <section id="quick-check" class="quiz-card">
        <h2>${escapeHtml(lesson.quickCheckTitle)}</h2>
        <p>${escapeHtml(lesson.quickCheckIntro)}</p>

        ${lesson.quickCheck.map((question, questionIndex) => `
          <div class="lesson-card quiz-question" data-question-index="${questionIndex}">
            <h3>${escapeHtml(question.question)}</h3>
            <div class="quiz-options">
              ${question.options.map((option, optionIndex) => `
                <button
                  type="button"
                  class="quiz-option"
                  data-question-index="${questionIndex}"
                  data-option-index="${optionIndex}"
                  data-correct="${optionIndex === question.correctIndex ? "true" : "false"}"
                >
                  ${escapeHtml(option)}
                </button>
              `).join("")}
            </div>
            <div class="quiz-feedback" aria-live="polite"></div>
          </div>
        `).join("")}
      </section>

      <nav class="lesson-nav" aria-label="Lesson navigation">
        <button class="button button-secondary button-disabled" type="button" disabled>
          ${escapeHtml(lesson.navigation.previous)}
        </button>
        <button id="nextLessonButton" class="button button-primary" type="button">
          ${escapeHtml(lesson.navigation.next)}
        </button>
        <button id="feedbackButton" class="button button-secondary" type="button">
          ${escapeHtml(lesson.navigation.feedback)}
        </button>
      </nav>
    </article>
  `;
}

function renderInteractivePanel(lesson) {
  return `
    <aside class="interactive-panel">
      <div class="visual-card">
        <div class="visual-card-header">
          <div>
            <h2>${escapeHtml(lesson.interactive.title)}</h2>
            <p>${escapeHtml(lesson.interactive.helpText)}</p>
          </div>
        </div>

        <div class="sail-diagram" aria-label="${escapeHtml(lesson.interactive.diagramAria)}">
          <div class="wind-indicator" aria-hidden="true">
            <span>${escapeHtml(lesson.interactive.windLabel)}</span>
            <span class="wind-arrow">↓</span>
          </div>

          <div class="no-go-label">${escapeHtml(lesson.interactive.noGoZoneLabel)}</div>
          <div class="diagram-ring" aria-hidden="true"></div>

          <div id="boatVisual" class="boat" aria-hidden="true">
            <div class="main-sail"></div>
            <div class="jib-sail"></div>
            <div class="mast"></div>
            <div class="hull"></div>
          </div>
        </div>

        <div class="diagram-readout">
          <div class="readout-main">
            <span class="readout-label">${escapeHtml(lesson.interactive.pointOfSailLabel)}</span>
            <span id="pointOfSailReadout" class="readout-value">—</span>
          </div>

          <div class="readout-main">
            <span class="readout-label">${escapeHtml(lesson.interactive.sailTrimLabel)}</span>
            <span id="sailTrimReadout" class="readout-value">—</span>
          </div>

          <div class="readout-main">
            <span class="readout-label">${escapeHtml(lesson.interactive.angleLabel)}</span>
            <span id="angleReadout" class="readout-value">—</span>
          </div>

          <div id="noGoWarning" class="no-go-warning">
            ${escapeHtml(lesson.interactive.noGoWarning)}
          </div>
        </div>

        <div class="control-panel">
          <label class="slider-label" for="headingSlider">
            <span>${escapeHtml(lesson.interactive.sliderLabel)}</span>
            <span id="headingReadout">0°</span>
          </label>

          <input
            id="headingSlider"
            type="range"
            min="0"
            max="360"
            step="1"
            value="45"
            aria-label="${escapeHtml(lesson.interactive.sliderAria)}"
          />

          <p class="range-help">${escapeHtml(lesson.interactive.sliderHelp)}</p>
        </div>

        <div class="viewer-placeholder" aria-label="${escapeHtml(lesson.viewer.aria)}">
          <div>
            <div aria-hidden="true">▧</div>
            <p>${escapeHtml(lesson.viewer.title)}</p>
          </div>
        </div>
      </div>
    </aside>
  `;
}

function initialisePointsOfSail(root, lesson, onComingSoon, showToast, content) {
  const slider = root.querySelector("#headingSlider");
  const headingReadout = root.querySelector("#headingReadout");
  const angleReadout = root.querySelector("#angleReadout");
  const pointReadout = root.querySelector("#pointOfSailReadout");
  const sailTrimReadout = root.querySelector("#sailTrimReadout");
  const noGoWarning = root.querySelector("#noGoWarning");
  const boatVisual = root.querySelector("#boatVisual");
  const nextLessonButton = root.querySelector("#nextLessonButton");
  const feedbackButton = root.querySelector("#feedbackButton");

  function updateDiagram() {
    const heading = Number(slider.value);
    const signedAngle = normaliseSignedAngle(heading);
    const relativeAngle = Math.abs(signedAngle);
    const point = getPointOfSail(relativeAngle, lesson.interactive.points);

    const sailSide = signedAngle >= 0 ? -1 : 1;
    const mainSailAngle = point.sailAngle * sailSide;
    const jibSailAngle = point.jibAngle * sailSide;

    boatVisual.style.setProperty("--boat-rotation", `${heading}deg`);
    boatVisual.style.setProperty("--main-sail-angle", `${mainSailAngle}deg`);
    boatVisual.style.setProperty("--jib-sail-angle", `${jibSailAngle}deg`);

    headingReadout.textContent = `${heading}°`;
    angleReadout.textContent = `${Math.round(relativeAngle)}°`;
    pointReadout.textContent = point.label;
    sailTrimReadout.textContent = point.trim;

    noGoWarning.classList.toggle("visible", point.key === "noGo");
  }

  slider.addEventListener("input", updateDiagram);
  updateDiagram();

  root.querySelectorAll(".quiz-option").forEach(button => {
    button.addEventListener("click", () => {
      handleQuizAnswer(button, lesson);
    });
  });

  nextLessonButton.addEventListener("click", () => {
    onComingSoon(content.toast.unfinishedModule);
  });

  feedbackButton.addEventListener("click", () => {
    showToast(content.toast.feedbackPlaceholder);
  });
}

function handleQuizAnswer(selectedButton, lesson) {
  const questionIndex = Number(selectedButton.getAttribute("data-question-index"));
  const isCorrect = selectedButton.getAttribute("data-correct") === "true";
  const questionBlock = selectedButton.closest(".quiz-question");
  const feedback = questionBlock.querySelector(".quiz-feedback");
  const options = questionBlock.querySelectorAll(".quiz-option");
  const question = lesson.quickCheck[questionIndex];

  options.forEach(option => {
    option.classList.remove("correct", "incorrect");

    if (option.getAttribute("data-correct") === "true") {
      option.classList.add("correct");
    }
  });

  if (!isCorrect) {
    selectedButton.classList.add("incorrect");
  }

  feedback.textContent = isCorrect
    ? question.feedbackCorrect
    : question.feedbackIncorrect;
}

function getPointOfSail(relativeAngle, points) {
  if (relativeAngle < 35) {
    return points.noGo;
  }

  if (relativeAngle < 52) {
    return points.closeHauled;
  }

  if (relativeAngle < 80) {
    return points.closeReach;
  }

  if (relativeAngle < 110) {
    return points.beamReach;
  }

  if (relativeAngle < 150) {
    return points.broadReach;
  }

  return points.run;
}

function normaliseSignedAngle(angle) {
  let normalised = ((angle % 360) + 360) % 360;

  if (normalised > 180) {
    normalised -= 360;
  }

  return normalised;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
