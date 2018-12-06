import { Color } from 'excalibur';
import { Structure } from './Structure';
import { sample } from '../Util';

export class Colony {
    // origin: Vector
    structures: Structure[] = []
    // build(structure) ...
}


export class World {
  static colors = [Color.Red, Color.Blue, Color.Viridian, Color.Magenta, Color.Chartreuse];

  color: Color = sample(World.colors).
      darken(0.25).
      desaturate(0.85);
  skyColor: Color = sample(World.colors).
        lighten(0.15).
        desaturate(0.65) // sample([Color.Blue, Color.Rose,Color.Blue]).lighten(0.1).desaturate(0.8)
  colony: Colony = new Colony()
}