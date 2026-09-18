import { SAVE } from "./SaveSystem.js";

export default class ProgressSystem {
  static coreStoryComplete() {
    return Boolean(
      SAVE.photoSeen &&
      SAVE.boxSorted &&
      SAVE.coffeeMade &&
      SAVE.dinnerMemorySeen &&
      SAVE.lampRepaired &&
      SAVE.argumentMemorySeen &&
      SAVE.drawingMemorySeen &&
      SAVE.treeWatered &&
      SAVE.reinterpretationSeen
    );
  }

  static storyProgress() {
    const flags = [
      SAVE.photoSeen,
      SAVE.boxSorted,
      SAVE.coffeeMade,
      SAVE.dinnerMemorySeen,
      SAVE.lampRepaired,
      SAVE.argumentMemorySeen,
      SAVE.drawingMemorySeen,
      SAVE.treeWatered,
      SAVE.reinterpretationSeen,
    ];
    return flags.filter(Boolean).length / flags.length;
  }
}