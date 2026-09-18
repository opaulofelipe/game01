export default class Player {
  constructor(scene, x, y, texture = "daniel") {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, texture);
    this.sprite.body.setSize(18, 22).setOffset(5, 12);
    this.sprite.setCollideWorldBounds(true);
  }

  setVelocity(x, y) { this.sprite.setVelocity(x, y); }
  stop() { this.sprite.setVelocity(0, 0); }
  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
}