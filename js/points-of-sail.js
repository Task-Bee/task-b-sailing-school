(function () {
  const content = window.TASKB_CONTENT;
  let selectedCourseId = content.courses[0].id;
  let detailOpen = false;

  function polar(cx, cy, r, navDeg) {
    const rad = (Math.PI / 180) * navDeg;
    return {
      x: cx + r * Math.sin(rad),
      y: cy - r * Math.cos(rad)
    };
  }

  function wedgePath(cx, cy, r, startNavDeg, endNavDeg) {
    const start = polar(cx, cy, r, startNavDeg);
    const end = polar(cx, cy, r, endNavDeg);
    const largeArc = Math.abs(endNavDeg - startNavDeg) > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)} Z`;
  }

  function arcPath(cx, cy, r, navDeg, spread = 24) {
    const start = polar(cx, cy, r, navDeg - spread / 2);
    const end = polar(cx, cy, r, navDeg + spread / 2);
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  }

  function rosePolygon(points) {
    return points.map(([nav, r]) => {
      const p = polar(200, 200, r, nav);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ");
  }

  function makeCompassSvg(selected) {
    const noGo = wedgePath(200, 200, 142, -45, 45);
    const courseArc = selected.id === "no-go-zone" ? "" : arcPath(200, 200, 167, selected.angle, 28);

    const majorTicks = [0,45,90,135,180,225,270,315].map((a) => {
      const p1 = polar(200, 200, 148, a);
      const p2 = polar(200, 200, 158, a);
      return `<line class="tick" x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" />`;
    }).join("");

    const dots = Array.from({ length: 16 }, (_, i) => i * 22.5).map((a) => {
      const p = polar(200, 200, 169, a);
      return `<circle class="dot" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="1.6" />`;
    }).join("");

    return `
      <svg class="compass" viewBox="0 0 400 400" aria-label="Points of Sail compass diagram" role="img">
        <defs>
          <filter id="paperLift" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2d1d0d" flood-opacity="0.14" />
          </filter>
        </defs>

        <path class="no-go-zone" d="${noGo}" />
        <circle class="ring" cx="200" cy="200" r="160" />
        <circle class="ring" cx="200" cy="200" r="146" />
        <circle class="ring-soft" cx="200" cy="200" r="95" />

        <polygon class="rose-dark" points="${rosePolygon([[0,154],[10,32],[0,74],[-10,32]])}" />
        <polygon class="rose-dark" points="${rosePolygon([[180,154],[170,32],[180,74],[190,32]])}" />
        <polygon class="rose-dark" points="${rosePolygon([[90,154],[80,32],[90,74],[100,32]])}" />
        <polygon class="rose-dark" points="${rosePolygon([[270,154],[260,32],[270,74],[280,32]])}" />
        <polygon class="rose-mid" points="${rosePolygon([[45,138],[55,28],[45,64],[35,28]])}" />
        <polygon class="rose-mid" points="${rosePolygon([[135,138],[145,28],[135,64],[125,28]])}" />
        <polygon class="rose-mid" points="${rosePolygon([[225,138],[235,28],[225,64],[215,28]])}" />
        <polygon class="rose-mid" points="${rosePolygon([[315,138],[325,28],[315,64],[305,28]])}" />
        <polygon class="rose-pale" points="${rosePolygon([[22.5,115],[27.5,22],[22.5,48],[17.5,22]])}" />
        <polygon class="rose-pale" points="${rosePolygon([[67.5,115],[72.5,22],[67.5,48],[62.5,22]])}" />
        <polygon class="rose-pale" points="${rosePolygon([[112.5,115],[117.5,22],[112.5,48],[107.5,22]])}" />
        <polygon class="rose-pale" points="${rosePolygon([[157.5,115],[162.5,22],[157.5,48],[152.5,22]])}" />
        <polygon class="rose-pale" points="${rosePolygon([[202.5,115],[207.5,22],[202.5,48],[197.5,22]])}" />
        <polygon class="rose-pale" points="${rosePolygon([[247.5,115],[252.5,22],[247.5,48],[242.5,22]])}" />
        <polygon class="rose-pale" points="${rosePolygon([[292.5,115],[297.5,22],[292.5,48],[287.5,22]])}" />
        <polygon class="rose-pale" points="${rosePolygon([[337.5,115],[342.5,22],[337.5,48],[332.5,22]])}" />

        ${majorTicks}
        ${dots}
        <path class="course-arc is-active" d="${courseArc}" />

        <text x="200" y="24" text-anchor="middle">N</text>
        <text x="200" y="386" text-anchor="middle">S</text>
        <text x="382" y="207" text-anchor="middle">E</text>
        <text x="18" y="207" text-anchor="middle">W</text>

        <g filter="url(#paperLift)">
          <path class="boat-hull" d="M200 58 C219 82 229 119 230 177 L230 274 C230 306 219 333 200 344 C181 333 170 306 170 274 L170 177 C171 119 181 82 200 58 Z" />
          <path class="boat-deck" d="M200 82 C213 105 219 134 220 181 L220 286 C219 306 212 322 200 329 C188 322 181 306 180 286 L180 181 C181 134 187 105 200 82 Z" />
          <path class="boat-cockpit" d="M200 164 C211 183 216 210 216 251 L184 251 C184 210 189 183 200 164 Z" />
          <rect class="boat-deck" x="192" y="265" width="16" height="18" rx="8" />
          <line class="boat-centerline" x1="200" y1="76" x2="200" y2="329" />
        </g>
      </svg>`;
  }

  function makeWindArrow() {
    return `
      <div class="wind-arrow" aria-hidden="true">
        <span>WIND</span>
        <svg viewBox="0 0 96 56">
          <path d="M2 27 69 2l-9 19h34v12H60l9 21L2 27Z" />
        </svg>
      </div>`;
  }

  function makeSailIcon(course) {
    if (course.id === "no-go-zone") {
      return `
        <svg class="sail-icon" viewBox="0 0 64 52" aria-hidden="true">
          <path class="flag-fill" d="M25 9 C42 7 48 15 46 30 C38 28 31 28 25 31 Z" />
          <path class="flag" d="M25 9 C42 7 48 15 46 30 C38 28 31 28 25 31" />
          <path class="flag" d="M25 9v31" />
        </svg>`;
    }

    const jibScale = {
      tight: "M35 5 C45 12 51 24 52 39 L37 39 C38 25 37 14 35 5Z",
      middle: "M35 5 C49 12 56 24 58 39 L38 39 C40 25 39 14 35 5Z",
      open: "M35 5 C52 11 61 23 62 39 L39 39 C42 25 40 14 35 5Z",
      wide: "M35 5 C56 10 63 23 62 39 L38 39 C41 25 39 14 35 5Z"
    }[course.sail] || "M35 5 C49 12 56 24 58 39 L38 39 C40 25 39 14 35 5Z";

    return `
      <svg class="sail-icon" viewBox="0 0 64 52" aria-hidden="true">
        <path class="main" d="M29 3 13 39h19Z" />
        <path class="jib" d="${jibScale}" />
        <path class="wave" d="M10 45c5 3 10 3 15 0 5-3 10-3 15 0 5 3 10 3 15 0" />
      </svg>`;
  }

  function courseCard(course, selected) {
    const active = selected.id === course.id ? " is-active" : "";
    return `
      <button class="course-card${active}" type="button" data-course-id="${course.id}" aria-pressed="${selected.id === course.id}">
        ${makeSailIcon(course)}
        <span class="course-card__label">${course.label.replace("\n", "<br>")}</span>
      </button>`;
  }

  function lessonDetail(selected) {
    if (!detailOpen) {
      return `
        <section class="info-card" aria-label="Selected point of sail summary">
          <h2>${selected.shortLabel}</h2>
          <p>${selected.summary}</p>
        </section>`;
    }

    return `
      <section class="info-card lesson-detail" aria-label="Lesson detail">
        <div class="lesson-detail__title">
          <h2>${selected.shortLabel}</h2>
          <span class="lesson-pill">Lesson 1</span>
        </div>
        <p>${selected.summary}</p>
        <ul>${selected.learn.map(item => `<li>${item}</li>`).join("")}</ul>
        <div class="lesson-controls">
          <button class="secondary-action" type="button" data-action="previous">Previous</button>
          <button class="secondary-action" type="button" data-action="next">Next</button>
        </div>
      </section>`;
  }

  function render(root) {
    const selected = content.courses.find(course => course.id === selectedCourseId) || content.courses[0];

    root.innerHTML = `
      <section class="hero-title" aria-labelledby="moduleTitle">
        <p class="eyebrow">${content.module.eyebrow}</p>
        <h1 id="moduleTitle">${content.module.title}</h1>
        <div class="title-divider"><span class="compass-star" aria-hidden="true"></span></div>
      </section>

      <section class="lesson-panel" aria-label="Points of Sail module">
        <div class="diagram-wrap">
          ${makeWindArrow()}
          ${makeCompassSvg(selected)}
        </div>

        <div class="course-grid" aria-label="Choose a point of sail">
          ${content.courses.map(course => courseCard(course, selected)).join("")}
        </div>

        <button class="primary-action" type="button" data-action="start">
          <span>${content.module.startCta}</span>
          <svg viewBox="0 0 44 24" aria-hidden="true"><path d="M2 12h36M27 3l12 9-12 9" /></svg>
        </button>

        ${lessonDetail(selected)}
      </section>`;

    root.querySelectorAll("[data-course-id]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedCourseId = button.getAttribute("data-course-id");
        detailOpen = false;
        render(root);
      });
    });

    root.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.getAttribute("data-action");
        const currentIndex = content.courses.findIndex(course => course.id === selectedCourseId);

        if (action === "start") {
          detailOpen = true;
        }

        if (action === "next") {
          selectedCourseId = content.courses[(currentIndex + 1) % content.courses.length].id;
          detailOpen = true;
        }

        if (action === "previous") {
          selectedCourseId = content.courses[(currentIndex - 1 + content.courses.length) % content.courses.length].id;
          detailOpen = true;
        }

        render(root);
      });
    });
  }

  window.TaskBPointsOfSail = { render };
})();
