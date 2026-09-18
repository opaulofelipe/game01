import { SETTINGS, setSetting, resetSettings, applySettingsToDocument } from "../systems/SettingsSystem.js";
import { SAVE, saveGame } from "../systems/SaveSystem.js";

class UIOverlay {
  constructor(game) {
    this.game = game;
    this.root = document.getElementById("ui-overlay");
    this.panel = document.getElementById("ui-panel");
    this.caption = document.getElementById("sound-caption");
    this.orientation = document.getElementById("orientation-hint");
    this.activeScene = null;
    this.sceneWasPaused = false;
    applySettingsToDocument();
    window.addEventListener("acasa-saved", () => this.showSaveIndicator());
    window.addEventListener("resize", () => this.updateOrientationHint());
    this.updateOrientationHint();
  }
  clear(title) {
    this.panel.replaceChildren();
    const head = document.createElement("div");
    head.className = "overlay-head";
    const label = document.createElement("span");
    label.textContent = title;
    const close = document.createElement("button");
    close.textContent = "×";
    close.ariaLabel = "Fechar";
    close.addEventListener("click", () => this.close());
    head.append(label, close);
    this.panel.append(head);
  }
  button(label, fn, primary = false) {
    const b = document.createElement("button");
    b.className = "menu-button" + (primary ? " primary" : "");
    b.textContent = label;
    b.addEventListener("click", fn);
    this.panel.append(b);
    return b;
  }
  pauseScene(scene) {
    if (scene && scene.scene.key !== "TitleScene" && !scene.scene.isPaused()) {
      scene.scene.pause();
      this.sceneWasPaused = true;
    }
  }
  resumeScene() {
    if (this.activeScene && this.sceneWasPaused && this.activeScene.scene.isPaused()) this.activeScene.scene.resume();
    this.sceneWasPaused = false;
  }
  togglePause(scene) {
    if (this.root.classList.contains("is-open")) this.close();
    else this.openPause(scene);
  }
  openPause(scene) {
    this.activeScene = scene;
    this.pauseScene(scene);
    this.clear("PAUSA");
    this.button("Continuar", () => this.close(), true);
    this.button("Configurações", () => this.openSettings(scene, false));
    this.button("Controles", () => this.openControls(scene, false));
    this.button("Histórico", () => this.openHistory(scene, false));
    this.button("Voltar ao menu", () => {
      saveGame();
      const current = this.activeScene;
      this.close(false);
      current?.scene.stop();
      current?.scene.start("TitleScene");
    });
    this.open();
  }
  openSettings(scene = null, pause = true) {
    this.activeScene = scene || this.activeScene;
    if (pause) this.pauseScene(this.activeScene);
    this.clear("CONFIGURAÇÕES");
    const settings = [
      ["masterVolume","Volume geral","range"],
      ["musicVolume","Música","range"],
      ["ambienceVolume","Ambiente","range"],
      ["sfxVolume","Efeitos","range"],
      ["highContrast","Contraste elevado","check"],
      ["readableFont","Fonte de alta legibilidade","check"],
      ["soundCaptions","Legendas de sons","check"],
      ["reducedMotion","Reduzir movimento","check"],
      ["visibleInteractions","Interações mais visíveis","check"]
    ];
    for (const [key,label,type] of settings) {
      const row = document.createElement("label");
      row.className = "setting-row";
      const txt = document.createElement("span");
      txt.textContent = label;
      const input = document.createElement("input");
      input.type = type === "range" ? "range" : "checkbox";
      if (type === "range") {
        input.min = "0"; input.max = "1"; input.step = "0.01"; input.value = SETTINGS[key];
        input.addEventListener("input", () => setSetting(key, Number(input.value)));
      } else {
        input.checked = Boolean(SETTINGS[key]);
        input.addEventListener("change", () => setSetting(key, input.checked));
      }
      row.append(txt,input);
      this.panel.append(row);
    }
    this.button("Restaurar padrão", () => { resetSettings(); this.openSettings(this.activeScene, false); });
    this.button("Voltar", () => this.activeScene?.scene?.key === "TitleScene" ? this.close() : this.openPause(this.activeScene), true);
    this.open();
  }
  openControls(scene = null, pause = true) {
    this.activeScene = scene || this.activeScene;
    if (pause) this.pauseScene(this.activeScene);
    this.clear("CONTROLES");
    const p = document.createElement("p");
    p.textContent = "WASD / setas: mover • E / Espaço / Enter: interagir • Esc: pausar • No celular, use o direcional e o botão E.";
    this.panel.append(p);
    this.button("Voltar", () => this.activeScene?.scene?.key === "TitleScene" ? this.close() : this.openPause(this.activeScene), true);
    this.open();
  }
  openHistory(scene = null, pause = true) {
    this.activeScene = scene || this.activeScene;
    if (pause) this.pauseScene(this.activeScene);
    this.clear("HISTÓRICO");
    const list = document.createElement("div");
    list.className = "history-list";
    const history = (SAVE.dialogueHistory || []).slice(-30).reverse();
    for (const item of history) {
      const box = document.createElement("div");
      box.className = "history-item";
      const who = document.createElement("b");
      who.textContent = item.kicker || "—";
      const text = document.createElement("span");
      text.textContent = item.text || "";
      box.append(who,text);
      list.append(box);
    }
    if (!history.length) list.textContent = "Ainda não há falas no histórico.";
    this.panel.append(list);
    this.button("Voltar", () => this.openPause(this.activeScene), true);
    this.open();
  }
  openCredits(scene = null, pause = false) {
    this.activeScene = scene || this.activeScene;
    if (pause) this.pauseScene(this.activeScene);
    this.clear("CRÉDITOS");
    const p = document.createElement("p");
    p.className = "credits-copy";
    p.textContent = "A CASA — jogo narrativo curto sobre luto, memória e despedida. JavaScript + Phaser. Pessoas comuns. Histórias reais.";
    this.panel.append(p);
    this.button("Voltar", () => this.close(), true);
    this.open();
  }
  open() {
    this.root.classList.add("is-open");
    this.root.setAttribute("aria-hidden","false");
  }
  close(resume = true) {
    this.root.classList.remove("is-open");
    this.root.setAttribute("aria-hidden","true");
    if (resume) this.resumeScene();
    this.activeScene = null;
  }
  captionSound(text) {
    if (!SETTINGS.soundCaptions || !text || !this.caption) return;
    this.caption.textContent = "[" + text + "]";
    this.caption.classList.add("show");
    clearTimeout(this.captionTimer);
    this.captionTimer = setTimeout(() => this.caption.classList.remove("show"), 1800);
  }
  showSaveIndicator() {
    const el = document.getElementById("save-indicator");
    if (!el) return;
    el.classList.add("show");
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => el.classList.remove("show"), 900);
  }
  updateOrientationHint() {
    if (!this.orientation) return;
    const show = matchMedia("(pointer: coarse)").matches && innerHeight > innerWidth && !sessionStorage.getItem("a-casa-orientation-hint");
    this.orientation.classList.toggle("show", show);
  }
  dismissOrientation() {
    sessionStorage.setItem("a-casa-orientation-hint","1");
    this.orientation?.classList.remove("show");
  }
}
export function initUIOverlay(game) {
  const ui = new UIOverlay(game);
  window.ACasaUI = ui;
  document.getElementById("orientation-continue")?.addEventListener("click", () => ui.dismissOrientation());
  return ui;
}