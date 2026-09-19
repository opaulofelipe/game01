const PALETTE = {
  outline: 0x241f1b,
  hair: 0x322820,
  skin: 0xc99c76,
  skinShadow: 0xa87958,
  shirt: 0x66766f,
  shirtShadow: 0x4f5d57,
  pants: 0x3f4a52,
  pantsShadow: 0x323940,
  shoes: 0x2a2826
};

const FRAME_W = 32;
const FRAME_H = 48;

function rect(g, color, x, y, w, h, alpha = 1) {
  g.fillStyle(color, alpha);
  g.fillRect(x, y, w, h);
}

function drawHead(g, direction, bob) {
  rect(g, PALETTE.outline, 9, 4 + bob, 14, 15);
  rect(g, PALETTE.skin, 10, 7 + bob, 12, 11);

  if (direction === "down") {
    rect(g, PALETTE.hair, 9, 4 + bob, 14, 6);
    rect(g, PALETTE.hair, 9, 8 + bob, 3, 6);
    rect(g, PALETTE.hair, 20, 8 + bob, 3, 6);
    rect(g, 0x3a3029, 13, 12 + bob, 2, 2);
    rect(g, 0x3a3029, 18, 12 + bob, 2, 2);
  }

  if (direction === "up") {
    rect(g, PALETTE.hair, 9, 4 + bob, 14, 11);
    rect(g, PALETTE.hair, 10, 13 + bob, 12, 5);
  }

  if (direction === "left") {
    rect(g, PALETTE.hair, 9, 4 + bob, 14, 7);
    rect(g, PALETTE.hair, 9, 9 + bob, 4, 7);
    rect(g, PALETTE.skinShadow, 10, 14 + bob, 3, 2);
  }

  if (direction === "right") {
    rect(g, PALETTE.hair, 9, 4 + bob, 14, 7);
    rect(g, PALETTE.hair, 19, 9 + bob, 4, 7);
    rect(g, PALETTE.skinShadow, 19, 14 + bob, 3, 2);
  }
}

function drawBody(g, direction, step, bob) {
  rect(g, PALETTE.outline, 8, 18 + bob, 16, 18);
  rect(g, PALETTE.shirt, 9, 19 + bob, 14, 15);

  if (direction === "left") rect(g, PALETTE.shirtShadow, 9, 20 + bob, 4, 13);
  if (direction === "right") rect(g, PALETTE.shirtShadow, 19, 20 + bob, 4, 13);
  if (direction === "up") rect(g, PALETTE.shirtShadow, 9, 28 + bob, 14, 6);

  const armSwing = step === 1 ? 2 : step === 2 ? -2 : 0;
  rect(g, PALETTE.skin, 5, 21 + bob + armSwing, 4, 10);
  rect(g, PALETTE.skin, 23, 21 + bob - armSwing, 4, 10);
}

function drawLegs(g, step, bob) {
  const leftShift = step === 1 ? -2 : step === 2 ? 2 : 0;
  const rightShift = -leftShift;

  rect(g, PALETTE.pants, 10 + leftShift, 34 + bob, 5, 9);
  rect(g, PALETTE.pants, 17 + rightShift, 34 + bob, 5, 9);
  rect(g, PALETTE.shoes, 9 + leftShift, 42 + bob, 7, 3);
  rect(g, PALETTE.shoes, 16 + rightShift, 42 + bob, 7, 3);
}

function drawFrame(scene, key, direction, step) {
  const g = scene.add.graphics();
  const bob = step === 0 ? 0 : step === 1 ? 1 : 0;

  drawHead(g, direction, bob);
  drawBody(g, direction, step, bob);
  drawLegs(g, step, bob);

  g.generateTexture(key, FRAME_W, FRAME_H);
  g.destroy();
}

export function createDanielTextures(scene) {
  const directions = ["down", "up", "left", "right"];

  for (const direction of directions) {
    for (let step = 0; step < 3; step += 1) {
      const key = `daniel-v2-${direction}-${step}`;
      if (!scene.textures.exists(key)) drawFrame(scene, key, direction, step);
    }
  }
}
