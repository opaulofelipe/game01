import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class ReinterpretationScene extends BaseScene {
  constructor() {
    super("ReinterpretationScene");
    this.started = false;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x151413);
    this.createUI("");
    this.drawPhone();
    this.cameras.main.fadeIn(700, 20, 18, 16);
    this.time.delayedCall(550, () => this.playConversation());
  }

  drawPhone() {
    this.add.rectangle(480, 270, 960, 540, 0x151413, 1);
    this.add.text(480, 72, "CONVERSA • SEIS MESES ANTES", {
      fontFamily: "system-ui, sans-serif", fontSize: "12px", fontStyle: "bold", color: "#786f66", letterSpacing: 1.5
    }).setOrigin(0.5);

    const phone = this.add.rectangle(480, 275, 360, 390, 0x262422, 1).setStrokeStyle(2, 0x756b61, 0.35);
    this.add.rectangle(480, 106, 58, 6, 0x514c46, 1);
    this.add.circle(480, 450, 14, 0x3b3733, 1);

    this.chatGroup = this.add.container(0,0);
  }

  bubble(y, text, outgoing=false) {
    const x = outgoing ? 558 : 402;
    const width = 235;
    const bg = this.add.rectangle(x, y, width, 54, outgoing ? 0x4c5d55 : 0x3a3733, 1)
      .setStrokeStyle(1, 0xe8dfd1, 0.08);
    const tx = this.add.text(x - width/2 + 14, y, text, {
      fontFamily: "system-ui, sans-serif", fontSize: "14px", color: "#e7ded2", wordWrap: { width: width - 28 }
    }).setOrigin(0,0.5);
    bg.setAlpha(0); tx.setAlpha(0);
    this.chatGroup.add([bg,tx]);
    this.tweens.add({ targets:[bg,tx], alpha:1, duration:350 });
  }

  playConversation() {
    if (this.started) return;
    this.started = true;
    this.showDataDialogue("reinterpretation_voce_nao_sabe_o_que_ele_pensou_depo_01", () => {
      this.bubble(160, "Seu carro ainda tá fazendo aquele barulho?", false);
      this.time.delayedCall(650, () => {
        this.bubble(218, "Tá.", true);
        this.time.delayedCall(600, () => {
          this.bubble(278, "Leva no Jorge. Ele olha.", false);
          this.time.delayedCall(650, () => {
            this.bubble(338, "Vou levar.", true);
            this.time.delayedCall(600, () => {
              this.bubble(398, "Não esquece.", false);
              this.time.delayedCall(1000, () => {
                this.dialog.showPages("", ["Eu não levei."], () => {
                  SAVE.reinterpretationSeen = true;
                  saveGame();
                  const memory = GameData.memory("reinterpretation");
                  this.fadeTo(memory.returnScene, memory.returnData || {});
                });
              });
            });
          });
        });
      });
    });
  }

  handleAction() {
    if (this.dialog?.isOpen()) return super.handleAction();
  }
}