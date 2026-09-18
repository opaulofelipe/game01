import GameData from "./GameData.js";

export default class ChoiceSystem {
  static resolve(choiceId, handlers = {}) {
    const data = GameData.choice(choiceId);
    if (!data) return null;

    return {
      kicker: data.kicker || "",
      prompt: data.prompt || "",
      choices: (data.options || []).map((option) => ({
        id: option.id,
        label: option.label,
        onSelect: handlers[option.id] || (() => {}),
      })),
    };
  }
}