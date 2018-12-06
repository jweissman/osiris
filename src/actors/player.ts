import * as ex from 'excalibur';

export class Player extends ex.Actor {
  constructor() {
    super();
    this.setWidth(5);
    this.setHeight(5);
    this.x = 5;
    this.y = 5;
    this.color = new ex.Color(255, 255, 255);
  }
}
