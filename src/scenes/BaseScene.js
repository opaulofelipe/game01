import { W, C } from "../config/constants.js";
import DialogueBox from "../ui/DialogueBox.js";
import GameData from "../systems/GameData.js";
import DialogueSystem from "../systems/DialogueSystem.js";
import ChoiceSystem from "../systems/ChoiceSystem.js";
import AudioSystem from "../systems/AudioSystem.js";
import ProgressSystem from "../systems/ProgressSystem.js";
import HouseStateSystem from "../systems/HouseStateSystem.js";
import { SETTINGS } from "../systems/SettingsSystem.js";
import { SAVE, saveGame, markInspected, setObjectDestination } from "../systems/SaveSystem.js";

const DESTINATION_LABELS = {
  keep: 'Guardar', donate: 'Doar', discard: 'Descartar', leave: 'Deixar',
  guardar: 'Guardar', doar: 'Doar', descartar: 'Descartar', deixar: 'Deixar'
};

export default class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.touch = window.touchState;
    this.stepFrame = 0;
  }

  createUI(objective = "") {
    document.getElementById("pause-btn")?.classList.remove("hidden");
    this.audio = new AudioSystem(this);
    this.audio.setupForScene();

    this.objectiveText = this.add.text(28, 24, SETTINGS.showObjectives ? objective : "", {
      fontFamily: "system-ui, sans-serif", fontSize: "13px", fontStyle: "bold", color: "#e8dfd1",
      backgroundColor: "rgba(23,21,19,0.72)", padding: { x: 12, y: 8 },
    }).setDepth(900).setScrollFactor(0).setVisible(Boolean(SETTINGS.showObjectives && objective));

    this.promptBg = this.add.rectangle(W / 2, 504, 300, 36, C.ink, 0.82)
      .setStrokeStyle(1, C.paper, 0.12).setDepth(900).setScrollFactor(0).setVisible(false);
    this.promptText = this.add.text(W / 2, 504, "", {
      fontFamily: "system-ui, sans-serif", fontSize: SETTINGS.visibleInteractions ? "15px" : "13px", color: "#e8dfd1",
    }).setOrigin(0.5).setDepth(901).setScrollFactor(0).setVisible(false);

    this.dialog = new DialogueBox(this);
    this.input.keyboard.on("keydown-E", () => this.handleAction());
    this.input.keyboard.on("keydown-SPACE", () => this.handleAction());
    this.input.keyboard.on("keydown-ENTER", () => this.handleAction());
    this.input.keyboard.on("keydown-LEFT", () => { if (this.dialog?.isOpen()) this.dialog.moveChoice(-1); });
    this.input.keyboard.on("keydown-RIGHT", () => { if (this.dialog?.isOpen()) this.dialog.moveChoice(1); });
    this.input.keyboard.on("keydown-ESC", () => window.ACasaUI?.togglePause(this));

    this.settingsHandler = () => {
      if (this.objectiveText) this.objectiveText.setVisible(Boolean(SETTINGS.showObjectives && this.objectiveText.text));
      if (this.promptText) this.promptText.setFontSize(SETTINGS.visibleInteractions ? 15 : 13);
      this.audio?.refreshVolumes();
    };
    window.addEventListener('acasa-settings-changed', this.settingsHandler);

    this.time.addEvent({ delay: 150, loop: true, callback: () => this.updatePlayerPresentation() });
    if (SETTINGS.navigationHelp && objective) {
      this.time.delayedCall(28000, () => {
        if (this.dialog?.isOpen() || this.scene.isPaused()) return;
        const hint = this.add.text(W/2, 68, 'DICA  •  explore os objetos marcados pelo brilho discreto', {
          fontFamily:'system-ui, sans-serif', fontSize:'11px', fontStyle:'bold', color:'#e8dfd1',
          backgroundColor:'rgba(23,21,19,.78)', padding:{x:10,y:7}
        }).setOrigin(.5).setDepth(950).setScrollFactor(0).setAlpha(0);
        this.tweens.add({targets:hint,alpha:1,duration:220,hold:4200,yoyo:true,onComplete:()=>hint.destroy()});
      });
    }
    this.applyProgressAtmosphere();

    this.events.once("shutdown", () => {
      window.removeEventListener('acasa-settings-changed', this.settingsHandler);
      this.audio?.destroy();
    });
  }

  setObjective(text) {
    if (!this.objectiveText) return;
    this.objectiveText.setText(text).setVisible(Boolean(SETTINGS.showObjectives && text));
  }

  showPrompt(text) {
    if (!this.promptBg || !this.promptText) return;
    const prefix = SETTINGS.visibleInteractions ? 'INTERAGIR  •  ' : '';
    this.promptBg.setFillStyle(SETTINGS.highContrast ? 0x000000 : C.ink, SETTINGS.highContrast ? 0.98 : 0.82);
    this.promptBg.setStrokeStyle(1, C.paper, SETTINGS.visibleInteractions ? 0.5 : 0.12);
    this.promptBg.setVisible(true);
    this.promptText.setText(prefix + text).setVisible(true);
    const w = Math.max(220, this.promptText.width + 42);
    this.promptBg.width = Math.min(700, w);
  }

  hidePrompt() { this.promptBg?.setVisible(false); this.promptText?.setVisible(false); }

  handleAction() { if (this.dialog?.isOpen()) this.dialog.advance(); }

  controlsVector() {
    if (this.dialog?.isOpen() || this.scene.isPaused()) return { x: 0, y: 0 };
    let x = 0, y = 0;
    if (this.cursors?.left.isDown || this.keys?.A.isDown || this.touch.left) x -= 1;
    if (this.cursors?.right.isDown || this.keys?.D.isDown || this.touch.right) x += 1;
    if (this.cursors?.up.isDown || this.keys?.W.isDown || this.touch.up) y -= 1;
    if (this.cursors?.down.isDown || this.keys?.S.isDown || this.touch.down) y += 1;
    const v = new Phaser.Math.Vector2(x, y);
    if (v.lengthSq() > 0) v.normalize();
    return v;
  }

  bindMovementKeys() { this.cursors = this.input.keyboard.createCursorKeys(); this.keys = this.input.keyboard.addKeys("W,A,S,D"); }

  fadeTo(sceneKey, data = {}) {
    saveGame();
    if (SETTINGS.reducedMotion) { this.scene.start(sceneKey, data); return; }
    this.cameras.main.fadeOut(420, 20, 18, 16);
    this.cameras.main.once("camerafadeoutcomplete", () => this.scene.start(sceneKey, data));
  }

  makeObstacle(x, y, width, height) {
    const z = this.add.zone(x, y, width, height); this.physics.add.existing(z, true); return z;
  }

  showDataDialogue(dialogueId, callback = null) {
    const data = DialogueSystem.resolve(dialogueId);
    if (!data) { console.warn(`[A Casa] Diálogo não encontrado: ${dialogueId}`); return; }
    this.dialog.showPages(data.kicker, data.pages, callback);
  }

  showDataChoice(choiceId, handlers = {}) {
    const data = ChoiceSystem.resolve(choiceId, handlers);
    if (!data) { console.warn(`[A Casa] Escolha não encontrada: ${choiceId}`); return; }
    this.dialog.showChoice(data.kicker, data.prompt, data.choices);
  }

  objectFromData(id, action = null, overrides = {}) {
    const data = GameData.object(id);
    if (!data) throw new Error(`[A Casa] Objeto não encontrado em objects.json: ${id}`);
    return {
      id, x: data.position.x, y: data.position.y, label: data.label || data.name || id,
      action: action || (() => data.type === 'sortable' ? this.sortDataObject(id) : this.inspectData(id)), ...overrides,
    };
  }

  inspectData(id) {
    const data = GameData.object(id); if (!data) return;
    markInspected(data.saveId || id);
    this.audio?.playSfx(data.sfx || 'object_pick', { volume: 0.32 }, data.soundCaption || null);
    if (data.dialogue) this.showDataDialogue(data.dialogue);
  }

  optionalObjects(roomId) {
    return Object.values(GameData.objects)
      .filter((data) => data.room === roomId && data.optional)
      .filter((data) => !SAVE.objectDestinations?.[data.id] || SAVE.objectDestinations[data.id] === 'leave')
      .map((data) => { this.drawOptionalVisual(data); return this.objectFromData(data.id); });
  }

  drawOptionalVisual(data) {
    const g = this.add.graphics().setDepth(9);
    const c = data.type === 'sortable' ? 0xb99c76 : 0x776b5d;
    if (/chave|lapis|mangueira|ferramenta/i.test(data.id)) { g.lineStyle(4,c,.9); g.lineBetween(data.position.x-8,data.position.y,data.position.x+8,data.position.y); }
    else if (/caneca|copo|vaso|perfume/i.test(data.id)) { g.fillStyle(c,.9); g.fillRoundedRect(data.position.x-7,data.position.y-8,14,16,3); }
    else { g.fillStyle(c,.82); g.fillRect(data.position.x-9,data.position.y-7,18,14); g.lineStyle(1,0xe8dfd1,.22); g.strokeRect(data.position.x-9,data.position.y-7,18,14); }
  }

  sortDataObject(id) {
    const data = GameData.object(id); if (!data) return;
    const previous = SAVE.objectDestinations?.[id];
    if (previous && previous !== 'leave') {
      this.dialog.showPages(data.name || '', [`Já foi separado para: ${DESTINATION_LABELS[previous] || previous}.`]);
      return;
    }
    markInspected(id);
    if (data.dialogue && !SAVE.inspected?.[`${id}:intro`]) {
      SAVE.inspected[`${id}:intro`] = true; saveGame();
      this.showDataDialogue(data.dialogue, () => this.openDestinationChoice(id, data));
    } else this.openDestinationChoice(id, data);
  }

  openDestinationChoice(id, data) {
    const destinations = data.destinations || ['keep','donate','discard','leave'];
    const choices = destinations.map((destination) => ({
      label: (DESTINATION_LABELS[destination] || destination).toUpperCase(),
      onSelect: () => {
        setObjectDestination(id, destination);
        this.audio?.playSfx('object_put', { volume: 0.35 }, 'objeto colocado');
        const item = this.interactables?.find((x) => x.id === id);
        if (item && destination !== 'leave') { item.x = -9999; item.y = -9999; item.spark?.setVisible(false); }
        if (destination === 'leave') this.dialog.showPages('', ['Você deixa onde estava.']);
      }
    }));
    this.dialog.showChoice((data.name || '').toUpperCase(), 'O que fazer com isso?', choices);
  }

  roomExit(roomId, exitId, data = {}) {
    const room = GameData.room(roomId); const exit = room?.exits?.[exitId];
    if (!exit) { console.warn(`[A Casa] Saída não encontrada: ${roomId}.${exitId}`); return; }
    for (const flag of exit.setFlags || []) SAVE[flag] = true;
    if (exit.setFlags?.length) saveGame();
    if (exit.stopRadio && this.radioSound) this.radioSound.stop();
    this.audio?.playSfx('door_open', { volume: 0.38 }, 'porta abrindo');
    this.fadeTo(exit.scene, { ...(exit.data || {}), ...data });
  }

  memoryScene(memoryId) { return GameData.memory(memoryId)?.scene || null; }
  returnFromMemory(memoryId) {
    const memory = GameData.memory(memoryId);
    if (!memory) { console.warn(`[A Casa] Memória não encontrada: ${memoryId}`); return; }
    this.scene.start(memory.returnScene, { ...(memory.returnData || {}) });
  }

  interactionRadius(base = 76) {
    return SETTINGS.visibleInteractions ? base + 18 : base;
  }

  surfaceForScene() {
    if (['KitchenScene','DinnerMemoryScene'].includes(this.scene.key)) return 'tile';
    if (['GarageScene','ExteriorScene','YardScene'].includes(this.scene.key)) return 'concrete';
    return 'wood';
  }

  updatePlayerPresentation() {
    const p = this.player;
    if (!p?.body) return;
    const moving = Math.abs(p.body.velocity.x) + Math.abs(p.body.velocity.y) > 8;
    if (moving && !this.dialog?.isOpen()) {
      this.audio?.footstep(this.surfaceForScene());
      this.stepFrame = (this.stepFrame + 1) % 2;
      const key = p.texture?.key || '';
      const base = key.startsWith('danielChild') ? 'danielChild' : key.startsWith('danielTeen') ? 'danielTeen' : key.startsWith('daniel') ? 'daniel' : null;
      if (base && this.textures.exists(`${base}_walk${this.stepFrame + 1}`)) p.setTexture(`${base}_walk${this.stepFrame + 1}`);
    } else {
      const key = p.texture?.key || '';
      if (key.startsWith('danielChild') && this.textures.exists('danielChild')) p.setTexture('danielChild');
      else if (key.startsWith('danielTeen') && this.textures.exists('danielTeen')) p.setTexture('danielTeen');
      else if (key.startsWith('daniel') && this.textures.exists('daniel')) p.setTexture('daniel');
    }
  }

  applyProgressAtmosphere() {
    if (SETTINGS.reducedEffects) return;
    const progress = ProgressSystem.storyProgress();
    const interiorScenes = ['RoomScene','KitchenScene','GarageScene','BedroomScene','DanielRoomScene'];
    if (interiorScenes.includes(this.scene.key) && progress > .12) {
      // A tarde esfria discretamente conforme a história avança.
      this.add.rectangle(W/2, 270, W, 540, 0x31415a, Math.min(.075, progress * .07)).setDepth(4).setScrollFactor(0);
    }
    if (progress < 0.22 || !interiorScenes.includes(this.scene.key)) return;
    const g = this.add.graphics().setDepth(5);
    const spots = {
      RoomScene: [[610,455],[665,455],[610,410]], KitchenScene:[[770,435],[825,435]], GarageScene:[[820,440],[865,440]],
      BedroomScene:[[780,445],[835,445]], DanielRoomScene:[[765,445],[820,445]]
    }[this.scene.key] || [];
    const count = Math.min(spots.length, Math.max(1, Math.floor(progress * (spots.length + 1))));
    for (let i=0;i<count;i++) {
      const [x,y]=spots[i]; g.fillStyle(0x8e724f,.88); g.fillRect(x,y,44,32); g.lineStyle(1,0x5f4a34,.6); g.strokeRect(x,y,44,32); g.lineBetween(x+22,y,x+22,y+32);
    }
    if (progress > .65) {
      g.lineStyle(2,0xe2d4c0,.1); g.strokeRect(110,82,74,46); g.strokeRect(690,110,64,42);
    }
    if (progress > .82) this.cameras.main.setBackgroundColor(0x25211d);

    if (this.scene.key === 'RoomScene' && HouseStateSystem.stage() > 0) {
      const c = HouseStateSystem.destinationCounts();
      const label = this.add.text(695, 468, `LEVAR ${c.keep}   DOAR ${c.donate}   DESCARTE ${c.discard}`, {
        fontFamily:'system-ui, sans-serif', fontSize:'9px', fontStyle:'bold', color:'#d2c3a9',
        backgroundColor:'rgba(23,21,19,.5)', padding:{x:7,y:5}
      }).setDepth(40).setAlpha(.72);
      if (SETTINGS.reducedEffects) label.setAlpha(.9);
    }
  }
}