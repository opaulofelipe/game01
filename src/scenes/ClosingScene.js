import { W, H, C } from "../config/constants.js";
import BaseScene from "./BaseScene.js";
import GameData from "../systems/GameData.js";
import { SAVE, saveGame, resetSave, markInspected } from "../systems/SaveSystem.js";
import { dist, coreStoryComplete, storyProgress } from "../utils/helpers.js";

export default class ClosingScene extends BaseScene {
  constructor() {
    super("ClosingScene");
    this.nearest = null;
    this.switches = [];
    this.exitDoor = null;
    this.keepsakePoint = null;
  }

  create() {
    SAVE.closingStarted = true;
    SAVE.radioOn = false;
    if (!SAVE.closingLights || typeof SAVE.closingLights !== "object") SAVE.closingLights = {};
    saveGame();

    this.physics.world.setBounds(20, 20, W - 40, H - 40);
    this.cameras.main.setBackgroundColor(0x201e1b);
    this.drawClosingHouse();
    this.bindMovementKeys();
    this.createUI(this.allLightsOff() ? "OBJETIVO  •  Escolha o que levar." : "OBJETIVO  •  Apague as luzes.");

    this.player = this.physics.add.sprite(480, 455, "daniel");
    this.player.body.setSize(18, 22).setOffset(5, 12);
    this.player.setCollideWorldBounds(true);

    [
      [480, 18, 960, 36], [480, 522, 960, 36], [18,270,36,540], [942,270,36,540]
    ].forEach(o => this.physics.add.collider(this.player, this.makeObstacle(...o)));

    this.buildClosingInteractables();
    this.cameras.main.fadeIn(850, 20, 18, 16);

    if (!SAVE.inspected.closing_intro) {
      markInspected("closing_intro");
      this.time.delayedCall(650, () => {
        this.showDataDialogue("closing_a_casa_esta_mais_vazia_do_que_quand_01");
      });
    }
  }

  drawClosingHouse() {
    const g = this.add.graphics();
    g.fillStyle(0x25221f,1); g.fillRect(0,0,W,H);

    const rooms = [
      {key:"kitchen", x:45,y:55,w:245,h:175,label:"COZINHA"},
      {key:"bedroom", x:670,y:55,w:245,h:175,label:"QUARTO DE ANTÔNIO"},
      {key:"daniel", x:45,y:285,w:245,h:190,label:"SEU QUARTO"},
      {key:"garage", x:670,y:285,w:245,h:190,label:"OFICINA"},
      {key:"living", x:310,y:55,w:340,h:420,label:"SALA"},
    ];
    this.darkOverlays = {};
    this.lightPools = {};

    rooms.forEach((r,idx) => {
      g.fillStyle(idx===4 ? 0x8f7e69 : 0x887966, 1);
      g.fillRoundedRect(r.x,r.y,r.w,r.h,8);
      g.lineStyle(2,0x4c433a,0.7); g.strokeRoundedRect(r.x,r.y,r.w,r.h,8);
      this.add.text(r.x+12,r.y+12,r.label,{fontFamily:"system-ui, sans-serif",fontSize:"9px",fontStyle:"bold",color:"#4d453d"});

      const pool = this.add.circle(r.x+r.w/2,r.y+r.h/2,Math.min(r.w,r.h)*0.48,0xe4c989,0.075).setDepth(1);
      this.lightPools[r.key]=pool;
      const overlay=this.add.rectangle(r.x+r.w/2,r.y+r.h/2,r.w-4,r.h-4,0x111110,0.68).setDepth(5);
      overlay.setAlpha(SAVE.closingLights[r.key] ? 0.82 : 0);
      pool.setAlpha(SAVE.closingLights[r.key] ? 0 : 1);
      this.darkOverlays[r.key]=overlay;
    });

    // mobiliário reduzido a silhuetas e marcas: a casa já foi esvaziada.
    g.fillStyle(0x62584d,1);
    g.fillRoundedRect(390,220,180,58,10); // sofá
    g.fillRoundedRect(430,305,105,44,7);  // mesa
    g.fillRoundedRect(90,330,120,45,6);   // cama Daniel vazia
    g.fillRoundedRect(725,100,130,62,6);  // cama Antônio
    g.fillRoundedRect(725,345,130,42,5);  // bancada oficina
    g.fillRoundedRect(90,110,120,42,5);   // bancada cozinha

    // marcas na parede onde havia quadros
    g.lineStyle(2,0xd3c5b0,0.13);
    g.strokeRect(350,95,78,55); g.strokeRect(545,102,55,43); g.strokeRect(738,185,65,42);

    // caixas finais perto da porta
    for (const [x,y] of [[382,420],[435,420],[535,420],[588,420]]) {
      g.fillStyle(0x806747,1); g.fillRect(x,y,46,35);
      g.lineStyle(1,0x4e3e2d,0.6); g.strokeRect(x,y,46,35); g.lineBetween(x+23,y,x+23,y+35);
    }

    // porta de saída
    g.fillStyle(0x161513,1); g.fillRect(445,490,70,35);
    g.lineStyle(3,0x8d7355,0.8); g.lineBetween(445,490,445,458); g.lineBetween(515,490,515,458);
    this.add.text(480,475,"PORTA",{fontFamily:"system-ui, sans-serif",fontSize:"9px",fontStyle:"bold",color:"#7f756b"}).setOrigin(0.5);
  }

  buildClosingInteractables() {
    const defs = [
      {key:"kitchen", x:300,y:140,label:"luz da cozinha"},
      {key:"bedroom", x:660,y:140,label:"luz do quarto"},
      {key:"daniel", x:300,y:380,label:"luz do seu quarto"},
      {key:"garage", x:660,y:380,label:"luz da oficina"},
      {key:"living", x:480,y:190,label:"luz da sala"},
    ];

    this.switches = defs.map(def => ({
      ...def,
      id:`switch_${def.key}`,
      action:() => this.turnOff(def.key)
    }));

    this.keepsakePoint = { id:"keepsake_final", x:480,y:420,label:SAVE.finalKeepsake ? "objeto escolhido" : "escolher o que levar", action:()=>this.chooseKeepsake() };
    this.exitDoor = { id:"exit_final", x:480,y:476,label:"sair", action:()=>this.tryExit() };
    this.interactables = [...this.switches, this.keepsakePoint, this.exitDoor];

    this.interactables.forEach(item => {
      const sp=this.add.image(item.x,item.y-24,"spark").setAlpha(0).setDepth(30);
      item.spark=sp;
      this.tweens.add({targets:sp,y:sp.y-4,alpha:{from:0.16,to:0.62},yoyo:true,repeat:-1,duration:950+Phaser.Math.Between(0,220)});
    });
  }

  allLightsOff() {
    return ["kitchen","bedroom","daniel","garage","living"].every(k => SAVE.closingLights && SAVE.closingLights[k]);
  }

  turnOff(key) {
    if (SAVE.closingLights[key]) {
      this.showDataDialogue("closing_interruptor_02");
      return;
    }
    SAVE.closingLights[key]=true;
    saveGame();
    this.audio?.playSfx("light_switch", { volume: 0.42 }, "interruptor");
    this.tweens.add({targets:this.lightPools[key],alpha:0,duration:450});
    this.tweens.add({targets:this.darkOverlays[key],alpha:0.82,duration:600});
    const remaining = ["kitchen","bedroom","daniel","garage","living"].filter(k=>!SAVE.closingLights[k]).length;
    if (remaining===0) {
      this.showDataDialogue("closing_o_silencio_muda_quando_todas_as_luz_03", ()=>this.setObjective("OBJETIVO  •  Escolha o que levar."));
    } else {
      this.setObjective(`OBJETIVO  •  Apague as luzes. Faltam ${remaining}.`);
    }
  }

  chooseKeepsake() {
    if (!this.allLightsOff()) {
      this.showDataDialogue("closing_caixa_04");
      return;
    }
    if (SAVE.finalKeepsake) {
      const names={drawing:"o desenho",photo:"a fotografia",tool:"a chave de fenda",mug:"a caneca"};
      this.dialog.showPages("CAIXA", [`Você decidiu levar ${names[SAVE.finalKeepsake]}.`, "O resto pode ficar nas caixas."]);
      return;
    }

    this.showDataChoice("closing_ultima_caixa_01", { option_1: ()=>this.setKeepsake("drawing"), option_2: ()=>this.setKeepsake("photo"), option_3: ()=>this.setKeepsake("tool"), option_4: ()=>this.setKeepsake("mug") });
  }

  setKeepsake(item) {
    SAVE.finalKeepsake=item; saveGame();
    const lines={
      drawing:["Você alisa a dobra do papel antes de guardá-lo.","Ele guardou primeiro."],
      photo:["Você coloca a fotografia no bolso interno da mochila.","A borda do papel já está gasta de tanto tempo."],
      tool:["A chave de fenda cabe na palma da sua mão.","Pesada o bastante para parecer familiar."],
      mug:["Você envolve a caneca em um pano antes de colocá-la na mochila.","Por algum motivo, ela parece mais frágil agora."]
    };
    this.dialog.showPages("",lines[item],()=>this.setObjective("OBJETIVO  •  Feche a casa."));
  }

  tryExit() {
    if (!this.allLightsOff()) {
      this.showDataDialogue("closing_porta_05");
      return;
    }
    if (!SAVE.finalKeepsake) {
      this.showDataDialogue("closing_porta_06");
      return;
    }
    this.showDataChoice("closing_porta_02", { option_1: ()=>this.fadeTo("EndScene"), option_2: ()=>{} });
  }

  update() {
    if (!this.player) return;
    const v=this.controlsVector(); this.player.setVelocity(v.x*150,v.y*150);
    if (this.dialog.isOpen()) {this.hidePrompt();return;}
    let best=null,bestD=99999;
    for(const item of this.interactables){
      const d=dist(this.player,item); if(d<bestD){best=item;bestD=d;}
      let available=true;
      if(item.id.startsWith("switch_") && SAVE.closingLights[item.key]) available=false;
      if(item.id==="keepsake_final" && !this.allLightsOff()) available=false;
      if(item.id==="exit_final" && (!this.allLightsOff() || !SAVE.finalKeepsake)) available=false;
      item.spark.setAlpha(available && d<120 ? 0.65 : (available ? 0.10 : 0.02));
    }
    this.nearest=bestD<this.interactionRadius(78)?best:null;
    if(this.nearest) this.showPrompt(`E  •  ${this.nearest.label}`); else this.hidePrompt();
  }

  handleAction(){
    if(this.dialog?.isOpen()) return super.handleAction();
    if(this.nearest) this.nearest.action();
  }
}