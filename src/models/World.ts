import { Color } from 'excalibur';
import { Structure } from './Structure';
import { sample } from '../Util';

export class Colony {
    // origin: Vector
    structures: Structure[] = []
    // build(structure) ...
}


export class World {
  static colors = [Color.Red, Color.Blue, Color.Green] // Color.Viridian, Color.Magenta, Color.Chartreuse];

  color: Color = sample(World.colors).
      darken(0.1).
      desaturate(0.8);
  skyColor: Color = sample([ Color.Cyan, Color.Vermillion ] ). // Color.Rose //World.colors).
        lighten(0.15).
        desaturate(0.65) // sample([Color.Blue, Color.Rose,Color.Blue]).lighten(0.1).desaturate(0.8)
  colony: Colony = new Colony()
}