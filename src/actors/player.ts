import * as ex from 'excalibur';
import { CollisionType, Color } from 'excalibur';

export class Player extends ex.Actor {
  constructor() {
    super(5, 5, 15, 15, Color.White);
    this.collisionType = CollisionType.Passive

    // this.on('collisionstart', collision => {
    //   console.log("HOVERED ON", { other: collision.other })
    // })

    // this.on('pointermove', (e) => { this.pos = e.pos })
  }
}
