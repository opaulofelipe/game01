import ProgressSystem from "../systems/ProgressSystem.js";

export function dist(a, b) {
  return Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
}

export function coreStoryComplete() {
  return ProgressSystem.coreStoryComplete();
}

export function storyProgress() {
  return ProgressSystem.storyProgress();
}