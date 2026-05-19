(function () {
  function initMenuButton() {
    const button = document.getElementById("menuButton");
    if (!button) return;

    button.addEventListener("click", () => {
      window.location.hash = "#/lessons";
    });
  }

  function init() {
    initMenuButton();
    window.addEventListener("hashchange", window.TaskBRouter.renderRoute);

    if (!window.location.hash) {
      window.location.hash = "#/points-of-sail";
      return;
    }

    window.TaskBRouter.renderRoute();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
