const SETTINGS_KEY = 'a-casa-settings-v1';

export const DEFAULT_SETTINGS = {
  masterVolume: 0.85,
  musicVolume: 0.18,
  ambienceVolume: 0.22,
  sfxVolume: 0.38,
  textSize: 'medium',
  textSpeed: 'normal',
  readableFont: false,
  highContrast: false,
  soundCaptions: false,
  reducedMotion: false,
  reducedEffects: false,
  visibleInteractions: false,
  showObjectives: true,
  navigationHelp: false,
  touchSide: 'right',
  touchOpacity: 0.62,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export const SETTINGS = loadSettings();

export function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS)); } catch {}
  applySettingsToDocument();
  window.dispatchEvent(new CustomEvent('acasa-settings-changed', { detail: { ...SETTINGS } }));
}

export function setSetting(key, value) {
  SETTINGS[key] = value;
  saveSettings();
}

export function resetSettings() {
  Object.keys(SETTINGS).forEach((key) => delete SETTINGS[key]);
  Object.assign(SETTINGS, DEFAULT_SETTINGS);
  saveSettings();
}

export function textSizePx() {
  if (SETTINGS.textSize === 'large') return 25;
  if (SETTINGS.textSize === 'xlarge') return 29;
  return 22;
}

export function applySettingsToDocument() {
  const root = document.documentElement;
  root.style.setProperty('--touch-opacity', String(SETTINGS.touchOpacity));
  root.classList.toggle('high-contrast', SETTINGS.highContrast);
  root.classList.toggle('readable-font', SETTINGS.readableFont);
  root.classList.toggle('reduced-motion', SETTINGS.reducedMotion || SETTINGS.reducedEffects);
  root.classList.toggle('controls-left', SETTINGS.touchSide === 'left');
}

applySettingsToDocument();