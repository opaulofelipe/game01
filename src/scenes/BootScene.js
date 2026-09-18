import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";
import DataLoader from "../utils/DataLoader.js";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // Áudio é gerado proceduralmente pelo Web Audio API; nenhum arquivo binário é necessário.
    DataLoader.queue(this);
  }

  create() {
    GameData.initialize(DataLoader.fromCache(this));

    this.makeTextures();
    this.scene.start("TitleScene");
  }

  makeTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    const person = (key, palette, step = 0, scale = 1) => {
      g.clear();
      const ox = 2;
      // sombra mínima desenhada no próprio sprite
      g.fillStyle(0x000000, 0.16); g.fillEllipse(16, 43, 18, 5);
      // pernas alternadas
      g.fillStyle(palette.pants, 1);
      if (step === 1) { g.fillRect(10, 31, 6, 10); g.fillRect(18, 32, 6, 8); }
      else if (step === 2) { g.fillRect(10, 32, 6, 8); g.fillRect(18, 31, 6, 10); }
      else { g.fillRect(10, 31, 6, 9); g.fillRect(18, 31, 6, 9); }
      // sapatos
      g.fillStyle(palette.shoes, 1); g.fillRect(9, 39, 7, 3); g.fillRect(18, 39, 7, 3);
      // tronco/camisa
      g.fillStyle(palette.shirt, 1); g.fillRect(8, 17, 18, 16); g.fillRect(6, 20, 4, 11); g.fillRect(26, 20, 4, 11);
      g.fillStyle(palette.shirtDark, 1); g.fillRect(9, 31, 16, 2);
      // mãos
      g.fillStyle(palette.skin, 1); g.fillRect(6, 29, 4, 4); g.fillRect(26, 29, 4, 4);
      // cabeça
      g.fillStyle(palette.skin, 1); g.fillRect(10, 6, 15, 12); g.fillRect(12, 4, 11, 2);
      // cabelo
      g.fillStyle(palette.hair, 1); g.fillRect(10, 4, 15, 4); g.fillRect(9, 7, 3, 6);
      if (palette.gray) { g.fillStyle(palette.gray, 1); g.fillRect(18, 4, 7, 3); g.fillRect(22, 7, 3, 3); }
      // olhos pixelados
      g.fillStyle(0x2b2724, 1); g.fillRect(13, 11, 2, 2); g.fillRect(20, 11, 2, 2);
      // detalhe de roupa
      g.fillStyle(palette.detail || palette.shirtDark, .8); g.fillRect(16, 19, 2, 11);
      g.generateTexture(key, 36, 46);
    };

    const adult = { skin:0xc69f7f, hair:0x2d2926, shirt:0x536776, shirtDark:0x35434c, pants:0x3c3a38, shoes:0x242321, detail:0x8192a0 };
    const child = { skin:0xcaa180, hair:0x2d2926, shirt:0x7a8e9a, shirtDark:0x536774, pants:0x5a574f, shoes:0x342e29, detail:0xa8b3ba };
    const teen = { skin:0xc79e7d, hair:0x292725, shirt:0x5f7482, shirtDark:0x3d4e59, pants:0x3f4245, shoes:0x252525, detail:0x8da0ab };
    const antonio = { skin:0xb98e70, hair:0x5b554f, gray:0xb8b1a7, shirt:0x71665a, shirtDark:0x554b43, pants:0x47423e, shoes:0x2b2927, detail:0x9d8d7c };

    person('daniel', adult, 0); person('daniel_walk1', adult, 1); person('daniel_walk2', adult, 2);
    person('danielChild', child, 0); person('danielChild_walk1', child, 1); person('danielChild_walk2', child, 2);
    person('danielTeen', teen, 0); person('danielTeen_walk1', teen, 1); person('danielTeen_walk2', teen, 2);
    person('antonio', antonio, 0);

    // indicador discreto de interação
    g.clear(); g.fillStyle(C.paper, 0.95); g.fillRect(4,0,2,10); g.fillRect(0,4,10,2); g.fillStyle(C.warm,1); g.fillRect(3,3,4,4); g.generateTexture('spark',10,10);

    // pequenos ícones usados pelo HUD/menus internos
    g.clear(); g.fillStyle(C.warm,1); g.fillRect(2,2,12,10); g.lineStyle(1,C.paper,.5); g.strokeRect(2,2,12,10); g.generateTexture('boxIcon',16,14);
    g.destroy();
  }
}