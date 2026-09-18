export default class InteractiveObject {
  constructor(data, action) {
    this.id = data.id;
    this.x = data.position.x;
    this.y = data.position.y;
    this.label = data.label || data.name || data.id;
    this.action = action;
  }
}