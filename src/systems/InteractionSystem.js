import { dist } from "../utils/helpers.js";

export default class InteractionSystem {
  static nearest(player, objects, radius = 74) {
    let nearest = null;
    let nearestDistance = Infinity;

    for (const object of objects) {
      const currentDistance = dist(player, object);
      if (currentDistance < nearestDistance) {
        nearest = object;
        nearestDistance = currentDistance;
      }
    }

    return nearestDistance <= radius ? nearest : null;
  }
}