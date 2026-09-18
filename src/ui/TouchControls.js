window.touchState = { up: false, down: false, left: false, right: false };

export function bindTouchControls(game) {
  document.querySelectorAll("[data-dir]").forEach(btn => {
    const dir = btn.dataset.dir;

    const down = (ev) => {
      ev.preventDefault();
      const scene = game.scene.getScenes(true).at(-1);
      if (scene?.dialog?.isOpen() && (dir === "left" || dir === "right")) {
        scene.dialog.moveChoice(dir === "left" ? -1 : 1);
        return;
      }
      window.touchState[dir] = true;
      btn.classList.add("is-active");
    };

    const up = (ev) => {
      ev.preventDefault();
      window.touchState[dir] = false;
      btn.classList.remove("is-active");
    };

    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("pointerleave", up);
  });

  const action = document.getElementById("action-btn");
  const act = (ev) => {
    ev.preventDefault();
    action.classList.add("is-active");
    const scene = game.scene.getScenes(true).at(-1);
    if (scene?.handleAction) scene.handleAction();
  };
  const release = (ev) => {
    ev.preventDefault();
    action.classList.remove("is-active");
  };

  action.addEventListener("pointerdown", act);
  action.addEventListener("pointerup", release);
  action.addEventListener("pointercancel", release);
  action.addEventListener("pointerleave", release);

  window.addEventListener("blur", () => {
    Object.keys(window.touchState).forEach(k => window.touchState[k] = false);
    document.querySelectorAll(".touch-btn").forEach(b => b.classList.remove("is-active"));
  });
}