import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import AudioSystem from "../systems/AudioSystem.js";
import { SETTINGS } from "../systems/SettingsSystem.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class EpilogueScene extends Phaser.Scene {
  constructor(){ super("EpilogueScene"); }

  create(){
    document.getElementById("pause-btn")?.classList.add("hidden");
    this.audio = new AudioSystem(this); this.audio.setupForScene();
    this.cameras.main.setBackgroundColor(0x24211e);
    this.drawApartment();
    if (!SETTINGS.reducedMotion) this.cameras.main.fadeIn(800,20,18,16);
    this.events.once("shutdown",()=>this.audio?.destroy());
    this.input.keyboard.on("keydown-E",()=>this.scene.start("TitleScene"));
    this.input.keyboard.on("keydown-SPACE",()=>this.scene.start("TitleScene"));
    this.input.keyboard.on("keydown-ENTER",()=>this.scene.start("TitleScene"));
    this.input.on("pointerup",()=>this.scene.start("TitleScene"));
  }

  drawApartment(){
    const g=this.add.graphics();
    g.fillStyle(0x302b27,1);g.fillRect(0,0,W,H);
    g.fillStyle(0x8f806e,1);g.fillRect(0,360,W,180);
    for(let y=360;y<540;y+=30){g.lineStyle(1,0x786b5d,0.4);g.lineBetween(0,y,W,y);}
    // parede, janela e estante
    g.fillStyle(0x4d453e,1);g.fillRect(0,0,W,360);
    g.fillStyle(0x283841,1);g.fillRect(115,75,210,155);g.lineStyle(4,0xa69a89,0.6);g.strokeRect(115,75,210,155);g.lineBetween(220,75,220,230);
    g.fillStyle(0x59493c,1);g.fillRoundedRect(595,175,235,30,5);g.fillRect(610,205,10,110);g.fillRect(805,205,10,110);
    g.fillStyle(0x6b5948,1);g.fillRoundedRect(105,380,260,90,12);
    this.add.text(70,45,"ALGUM TEMPO DEPOIS",{fontFamily:"system-ui, sans-serif",fontSize:"11px",fontStyle:"bold",color:"#8f857b",letterSpacing:1.4});

    const item=SAVE.finalKeepsake || "drawing";
    if(item==="drawing"){
      g.fillStyle(0x8a7356,1);g.fillRect(660,112,96,72);g.fillStyle(0xe0d2b6,1);g.fillRect(668,120,80,56);
      this.add.text(708,148,"⌂  ☀",{fontFamily:"Georgia, serif",fontSize:"22px",color:"#8b694b"}).setOrigin(0.5);
    } else if(item==="photo"){
      g.fillStyle(0x856d50,1);g.fillRect(674,116,72,68);g.fillStyle(0xc8bcaa,1);g.fillRect(681,123,58,53);g.fillStyle(0x6d6256,1);g.fillCircle(699,142,7);g.fillCircle(720,142,7);
    } else if(item==="tool"){
      g.lineStyle(8,0x555a5b,1);g.lineBetween(668,153,735,153);g.fillStyle(0x7b6046,1);g.fillRoundedRect(730,142,45,22,8);
    } else if(item==="mug"){
      g.fillStyle(0xd4c7b4,1);g.fillRoundedRect(686,132,48,50,8);g.lineStyle(5,0xd4c7b4,1);g.strokeCircle(738,157,14);
    }

    this.add.text(480,410,"FIM",{fontFamily:"Georgia, serif",fontSize:"34px",color:"#e8dfd1",letterSpacing:5}).setOrigin(0.5);
    this.add.text(480,462,"E  •  voltar ao início",{fontFamily:"system-ui, sans-serif",fontSize:"12px",color:"#8f857b"}).setOrigin(0.5);
  }
}