import { Color } from 'excalibur';
import { Structure } from './Structure';
import { sample } from '../Util';
import { Planet } from '../actors/Planet/Planet';


export class World {
  static colors = [Color.Orange, Color.Red, Color.Blue, Color.Green] //, Color.Violet] //, Color.White]

  color: Color = sample(World.colors).
      darken(0.1).
      desaturate(0.8);
  skyColor: Color = sample([ Color.Cyan, Color.Vermillion, Color.Violet, Color.Chartreuse ] ).
        lighten(0.15).
        desaturate(0.65)

}