const SPEED = 132;

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.direction = "down";
    this.walkAnimation = null;

    this.shadow = scene.add.ellipse(x, y + 19, 18, 8, 0x000000, 0.22)
      .setDepth(y - 1);

    this.sprite = scene.physics.add.sprite(x, y, "daniel-v2-down-0");
    this.sprite.setCollideWorldBounds(true);

    // A colisão fica somente nos pés.
    this.sprite.body.setSize(14, 9);
    this.sprite.body.setOffset(9, 36);

    this.createAnimations();
  }

  createAnimations() {
    for (const direction of ["down", "up", "left", "right"]) {
      const key = `daniel-v2-walk-${direction}`;

      if (!this.scene.anims.exists(key)) {
        this.scene.anims.create({
          key,
          frames: [
            { key: `daniel-v2-${direction}-1` },
            { key: `daniel-v2-${direction}-0` },
            { key: `daniel-v2-${direction}-2` },
            { key: `daniel-v2-${direction}-0` }
          ],
          frameRate: 8,
          repeat: -1
        });
      }
    }
  }

  resolveDirection(vector) {
    if (vector.x === 0 && vector.y === 0) return this.direction;

    if (Math.abs(vector.x) > Math.abs(vector.y)) {
      return vector.x < 0 ? "left" : "right";
    }

    return vector.y < 0 ? "up" : "down";
  }

  update(vector) {
    const moving = vector.lengthSq() > 0.001;

    if (moving) {
      this.direction = this.resolveDirection(vector);
      this.sprite.setVelocity(vector.x * SPEED, vector.y * SPEED);

      const animation = `daniel-v2-walk-${this.direction}`;
      if (this.sprite.anims.currentAnim?.key !== animation || !this.sprite.anims.isPlaying) {
        this.sprite.play(animation, true);
      }
    } else {
      this.sprite.setVelocity(0, 0);
      this.sprite.anims.stop();
      this.sprite.setTexture(`daniel-v2-${this.direction}-0`);
    }

    this.shadow.setPosition(this.sprite.x, this.sprite.y + 19);
    this.shadow.setDepth(this.sprite.y - 1);
    this.sprite.setDepth(this.sprite.y);
  }

  get speed() {
    return Math.round(this.sprite.body.velocity.length());
  }

  get footBounds() {
    return {
      x: this.sprite.body.x,
      y: this.sprite.body.y,
      width: this.sprite.body.width,
      height: this.sprite.body.height
    };
  }
}
