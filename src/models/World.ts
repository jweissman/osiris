import { Color } from 'excalibur';
import { Structure } from './Structure';
import { sample } from '../Util';
import { Planet } from '../actors/Planet/Planet';


export class World {
    static nameCitizen(): string {
      return sample([
        'Parthas',
        'Athos',
        'Karzak',
        'Echo',
        'Jaen',
        'Xavier',
        'Mante',
        'Ern',
        'Leor',
        'Exiel',
        'Tomlien',
        'Amriel',
        'Sariel',
        'Arthax',
        'Avalon',
        'Kor',
        'Exelon',
        'Dominel',
        'Prinz',
        'Etsa',
        'Corinth',
        'Coade',
        'Exter',
        'Domnek',
        'Tahm',
        'Esk',
        'Ith',
        'Torl',
        'Klapaucius',
        'Antonidus',
        'Exeleron',
        'Moab',
        'Thim',
        'Pol',
        'Maigel',
      ])
    }
  static colors = [Color.Orange, Color.Red, Color.Blue, Color.Green] //, Color.Violet] //, Color.White]

  color: Color = sample(World.colors).
      clone().
      darken(0.1).
      desaturate(0.8);
  skyColor: Color = sample(
    //   [ Color.Blue ]
      [Color.Cyan, Color.Vermillion, Color.Violet, Color.Chartreuse, Color.Orange, Color.Rose]
  ).
        clone().
        lighten(0.15).
        desaturate(0.8) //65)

}