import { SAVE_KEY } from "../config/constants.js";

export const DEFAULT_SAVE = {
  radioOn: false,
  photoSeen: false,
  boxSorted: false,
  boxDecision: null,
  inspected: {},
  hasEnteredHouse: false,
  kitchenVisited: false,
  coffeeMade: false,
  dinnerMemorySeen: false,
  garageVisited: false,
  workshopMemorySeen: false,
  repairStage: 0,
  lampRepaired: false,
  bedroomVisited: false,
  argumentMemorySeen: false,
  argumentTone: null,
  danielRoomVisited: false,
  keepsakeBoxOpened: false,
  drawingMemorySeen: false,
  backyardVisited: false,
  treeWatered: false,
  reinterpretationSeen: false,
  closingStarted: false,
  closingLights: {},
  finalKeepsake: null,
  houseClosed: false,
  endingSeen: false,
  objectDestinations: {},
  dialogueHistory: [],
  saveVersion: 2,
};

function readSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      inspected: { ...(parsed.inspected || {}) },
      closingLights: { ...(parsed.closingLights || {}) },
      objectDestinations: { ...(parsed.objectDestinations || {}) },
      dialogueHistory: Array.isArray(parsed.dialogueHistory) ? parsed.dialogueHistory.slice(-60) : [],
    };
  } catch {
    return { ...DEFAULT_SAVE, inspected: {}, closingLights: {} };
  }
}

export const SAVE = readSave();

export function saveGame(silent = false) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE));
    if (!silent) window.dispatchEvent(new CustomEvent("acasa-saved"));
  } catch {}
}

export function resetSave() {
  for (const key of Object.keys(SAVE)) delete SAVE[key];
  Object.assign(SAVE, {
    ...DEFAULT_SAVE,
    inspected: {},
    closingLights: {},
    objectDestinations: {},
    dialogueHistory: [],
  });
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {}
}

export function markInspected(id) {
  SAVE.inspected[id] = true;
  saveGame();
}

export function setSaveFlag(key, value = true) {
  SAVE[key] = value;
  saveGame();
}

export function addDialogueHistory(kicker, text) {
  SAVE.dialogueHistory ||= [];
  SAVE.dialogueHistory.push({ kicker: kicker || "", text: String(text || ""), at: Date.now() });
  if (SAVE.dialogueHistory.length > 60) SAVE.dialogueHistory.splice(0, SAVE.dialogueHistory.length - 60);
  saveGame(true);
}

export function setObjectDestination(id, destination) {
  SAVE.objectDestinations ||= {};
  SAVE.objectDestinations[id] = destination;
  saveGame();
}