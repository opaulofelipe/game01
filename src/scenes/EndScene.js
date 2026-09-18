import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import AudioSystem from "../systems/AudioSystem.js";
import { SETTINGS } from "../systems/SettingsSystem.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class EndScene extends Phaser.Scene {
  constructor(){ super("EndScene"); this.canContinue=false; }

  create(){
    document.getElementById("pause-btn")?.classList.add("hidden");
    SAVE.houseClosed=true; SAVE.endingSeen=true; SAVE.closingStarted=false; saveGame();
    this.audio = new AudioSystem(this); this.audio.setupForScene();
    this.cameras.main.setBackgroundColor(0x151817);
    this.drawExteriorNight();
    this.daniel=this.add.sprite(480,245,"daniel").setDepth(5);
    if (!SETTINGS.reducedMotion) this.cameras.main.fadeIn(900,12,14,13);
    this.audio?.playSfx("door_close", { volume: .32 }, "porta se fecha");
    this.events.once("shutdown",()=>this.audio?.destroy());

    this.time.delayedCall(700,()=>{
      this.tweens.add({targets:this.daniel,y:390,duration:1800,ease:"Sine.easeInOut",onComplete:()=>{
        this.time.delayedCall(500,()=>{
          this.tweens.add({targets:this.daniel,x:690,y:430,duration:1500,ease:"Sine.easeInOut",onComplete:()=>{
            this.daniel.setVisible(false);
            this.time.delayedCall(1000,()=>this.showEndingText());
          }});
        });
      }});
    });
  }

  drawExteriorNight(){
    const g=this.add.graphics();
    g.fillStyle(0x18201c,1);g.fillRect(0,0,W,H);
    g.fillStyle(0x283027,1);g.fillRect(0,330,W,210);
    g.fillStyle(0x3d3933,1);g.fillRect(250,85,460,225);
    g.fillStyle(0x211f1c,1);g.fillTriangle(220,95,740,95,480,8);
    g.fillStyle(0x4a433a,1);g.fillRect(267,110,426,180);
    // janelas apagadas
    g.fillStyle(0x151b1b,1);g.fillRect(310,145,95,65);g.fillRect(555,145,95,65);
    g.lineStyle(2,0x756d61,0.5);g.strokeRect(310,145,95,65);g.strokeRect(555,145,95,65);
    // porta fechada
    g.fillStyle(0x3b2f27,1);g.fillRect(440,150,80,140);g.fillStyle(0x8f7858,1);g.fillCircle(503,220,4);
    // caminho e carro
    g.fillStyle(0x666156,1);g.fillRoundedRect(445,292,70,248,12);
    g.fillStyle(0x353a3a,1);g.fillRoundedRect(650,392,190,82,18);
    g.fillStyle(0x1f2222,1);g.fillRoundedRect(686,403,95,31,8);
    g.fillCircle(680,472,15);g.fillCircle(808,472,15);
    // árvores escuras
    for(const [x,y,r] of [[110,100,64],[95,230,78],[850,120,70],[870,260,82]]){g.fillStyle(0x17221b,1);g.fillCircle(x,y,r);}
  }

  showEndingText(){
    this.add.rectangle(480,270,960,540,0x101110,0.36).setDepth(8);
    const quote=this.add.text(480,245,"Algumas coisas a gente leva.",{fontFamily:"Georgia, serif",fontSize:"30px",fontStyle:"italic",color:"#e8dfd1"}).setOrigin(0.5).setAlpha(0).setDepth(9);
    this.tweens.add({targets:quote,alpha:1,duration:1200});
    this.time.delayedCall(1800,()=>{
      const credit=this.add.text(480,318,"A CASA\n\numa história sobre aquilo que ficou",{fontFamily:"system-ui, sans-serif",fontSize:"12px",fontStyle:"bold",color:"#8f877e",align:"center",lineSpacing:8}).setOrigin(0.5).setAlpha(0).setDepth(9);
      this.tweens.add({targets:credit,alpha:1,duration:900});
      this.time.delayedCall(1000,()=>{
        this.prompt=this.add.text(480,430,"E  •  epílogo",{fontFamily:"system-ui, sans-serif",fontSize:"13px",color:"#b9ad9e"}).setOrigin(0.5).setDepth(9);
        this.canContinue=true;
      });
    });
    this.input.keyboard.on("keydown-E",()=>this.continue());
    this.input.keyboard.on("keydown-SPACE",()=>this.continue());
    this.input.keyboard.on("keydown-ENTER",()=>this.continue());
    this.input.on("pointerup",()=>this.continue());
  }

  continue(){
    if(!this.canContinue)return;
    this.canContinue=false;
    this.cameras.main.fadeOut(650,12,14,13);
    this.cameras.main.once("camerafadeoutcomplete",()=>this.scene.start("EpilogueScene"));
  }
}