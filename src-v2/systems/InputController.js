export default class InputController {
  constructor(scene) {
    this.scene = scene;
    this.touch = { up: false, down: false, left: false, right: false };

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      up: "W",
      down: "S",
      left: "A",
      right: "D"
    });

    this.bindTouch();
  }

  bindTouch() {
    const buttons = document.querySelectorAll("[data-move]");

    buttons.forEach((button) => {
      const direction = button.dataset.move;

      const press = (event) => {
        event.preventDefault();
        this.touch[direction] = true;
        button.classList.add("is-pressed");
      };

      const release = (event) => {
        event.preventDefault();
        this.touch[direction] = false;
        button.classList.remove("is-pressed");
      };

      button.addEventListener("pointerdown", press);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("pointerleave", release);

      this.scene.events.once("shutdown", () => {
        button.removeEventListener("pointerdown", press);
        button.removeEventListener("pointerup", release);
        button.removeEventListener("pointercancel", release);
        button.removeEventListener("pointerleave", release);
      });
    });

    window.addEventListener("blur", this.releaseAll);
    this.scene.events.once("shutdown", () => {
      window.removeEventListener("blur", this.releaseAll);
    });
  }

  releaseAll = () => {
    for (const key of Object.keys(this.touch)) this.touch[key] = false;
    document.querySelectorAll("[data-move]").forEach((button) => button.classList.remove("is-pressed"));
  };

  vector() {
    let x = 0;
    let y = 0;

    if (this.cursors.left.isDown || this.keys.left.isDown || this.touch.left) x -= 1;
    if (this.cursors.right.isDown || this.keys.right.isDown || this.touch.right) x += 1;
    if (this.cursors.up.isDown || this.keys.up.isDown || this.touch.up) y -= 1;
    if (this.cursors.down.isDown || this.keys.down.isDown || this.touch.down) y += 1;

    const vector = new Phaser.Math.Vector2(x, y);
    if (vector.lengthSq() > 1) vector.normalize();

    return vector;
  }
}
