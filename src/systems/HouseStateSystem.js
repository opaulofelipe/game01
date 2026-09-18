import { SAVE } from './SaveSystem.js';
import ProgressSystem from './ProgressSystem.js';

export default class HouseStateSystem {
  static stage() {
    const p = ProgressSystem.storyProgress();
    if (SAVE.closingStarted || p >= .9) return 3;
    if (p >= .6) return 2;
    if (p >= .25) return 1;
    return 0;
  }

  static destinationCounts() {
    const counts = { keep:0, donate:0, discard:0, leave:0 };
    for (const value of Object.values(SAVE.objectDestinations || {})) {
      if (value === 'guardar') counts.keep++;
      else if (value === 'doar') counts.donate++;
      else if (value === 'descartar') counts.discard++;
      else if (value === 'deixar') counts.leave++;
      else if (value in counts) counts[value]++;
    }
    if (SAVE.boxSorted) {
      if (SAVE.boxDecision === 'guardar') counts.keep++;
      if (SAVE.boxDecision === 'doar') counts.donate++;
      if (SAVE.boxDecision === 'descartar') counts.discard++;
      if (SAVE.boxDecision === 'deixar') counts.leave++;
    }
    return counts;
  }
}