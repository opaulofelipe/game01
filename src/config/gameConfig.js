import { W, H } from "./constants.js";
import BootScene from "../scenes/BootScene.js";
import TitleScene from "../scenes/TitleScene.js";
import ExteriorScene from "../scenes/ExteriorScene.js";
import RoomScene from "../scenes/RoomScene.js";
import MemoryScene from "../scenes/MemoryScene.js";
import KitchenScene from "../scenes/KitchenScene.js";
import DinnerMemoryScene from "../scenes/DinnerMemoryScene.js";
import GarageScene from "../scenes/GarageScene.js";
import WorkshopMemoryScene from "../scenes/WorkshopMemoryScene.js";
import BedroomScene from "../scenes/BedroomScene.js";
import DanielRoomScene from "../scenes/DanielRoomScene.js";
import DrawingMemoryScene from "../scenes/DrawingMemoryScene.js";
import ArgumentMemoryScene from "../scenes/ArgumentMemoryScene.js";
import YardScene from "../scenes/YardScene.js";
import ReinterpretationScene from "../scenes/ReinterpretationScene.js";
import ClosingScene from "../scenes/ClosingScene.js";
import EndScene from "../scenes/EndScene.js";
import EpilogueScene from "../scenes/EpilogueScene.js";

export const gameConfig = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: "game",
  backgroundColor: "#171513",
  pixelArt: true,
  antialias: false,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: W,
    height: H,
  },
  scene: [
    BootScene,
    TitleScene,
    ExteriorScene,
    RoomScene,
    MemoryScene,
    KitchenScene,
    DinnerMemoryScene,
    GarageScene,
    WorkshopMemoryScene,
    BedroomScene,
    DanielRoomScene,
    DrawingMemoryScene,
    ArgumentMemoryScene,
    YardScene,
    ReinterpretationScene,
    ClosingScene,
    EndScene,
    EpilogueScene
  ],
};