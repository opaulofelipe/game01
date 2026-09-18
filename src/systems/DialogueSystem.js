import GameData from "./GameData.js";

export default class DialogueSystem {
  static resolve(dialogueId) {
    const data = GameData.dialogue(dialogueId);
    if (!data) return null;

    const pages = Array.isArray(data.pages)
      ? data.pages
      : (data.lines || []).map((line) => {
          if (typeof line === "string") return line;
          return line.speaker ? `${line.speaker}: ${line.text}` : line.text;
        });

    return {
      kicker: data.kicker || data.speaker || "",
      pages,
    };
  }
}