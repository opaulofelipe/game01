class GameDataStore {
  constructor() {
    this.objects = {};
    this.dialogues = {};
    this.memories = {};
    this.rooms = {};
    this.choices = {};
  }

  initialize({ objects, dialogues, memories, rooms, choices }) {
    this.objects = objects || {};
    this.dialogues = dialogues || {};
    this.memories = memories || {};
    this.rooms = rooms || {};
    this.choices = choices || {};
    this.validate();
  }

  object(id) { return this.objects[id] || null; }
  dialogue(id) { return this.dialogues[id] || null; }
  memory(id) { return this.memories[id] || null; }
  room(id) { return this.rooms[id] || null; }
  choice(id) { return this.choices[id] || null; }

  validate() {
    const warnings = [];

    for (const [id, object] of Object.entries(this.objects)) {
      if (!object.room) warnings.push(`Objeto "${id}" sem room.`);
      if (!object.position || !Number.isFinite(object.position.x) || !Number.isFinite(object.position.y)) {
        warnings.push(`Objeto "${id}" sem posição válida.`);
      }
      if (object.dialogue && !this.dialogues[object.dialogue]) {
        warnings.push(`Objeto "${id}" aponta para diálogo inexistente "${object.dialogue}".`);
      }
    }

    for (const [id, memory] of Object.entries(this.memories)) {
      if (!memory.scene) warnings.push(`Memória "${id}" sem scene.`);
      if (memory.trigger && !this.objects[memory.trigger]) {
        warnings.push(`Memória "${id}" aponta para objeto inexistente "${memory.trigger}".`);
      }
    }

    for (const [roomId, room] of Object.entries(this.rooms)) {
      for (const [exitId, exit] of Object.entries(room.exits || {})) {
        if (!exit.scene) warnings.push(`Saída "${roomId}.${exitId}" sem scene.`);
      }
    }

    if (warnings.length) {
      console.groupCollapsed(`[A Casa] ${warnings.length} aviso(s) de dados`);
      warnings.forEach((message) => console.warn(message));
      console.groupEnd();
    }
  }
}

const GameData = new GameDataStore();
export default GameData;