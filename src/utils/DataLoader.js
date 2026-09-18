export default class DataLoader {
  static queue(scene) {
    scene.load.json("objectsData", "./data/objects.json");
    scene.load.json("dialoguesData", "./data/dialogues.json");
    scene.load.json("memoriesData", "./data/memories.json");
    scene.load.json("roomsData", "./data/rooms.json");
    scene.load.json("choicesData", "./data/choices.json");
  }

  static fromCache(scene) {
    return {
      objects: scene.cache.json.get("objectsData"),
      dialogues: scene.cache.json.get("dialoguesData"),
      memories: scene.cache.json.get("memoriesData"),
      rooms: scene.cache.json.get("roomsData"),
      choices: scene.cache.json.get("choicesData"),
    };
  }
}