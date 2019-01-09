import { Engine, DisplayMode, Loader } from 'excalibur';
import { World } from './models/World';
import { Resources } from './Resources';

export class Game extends Engine {

  static citizenSpeed: number = 130
    static debugPath: boolean = false

  constructor(public world: World) {
    super({
      width: 800,
      height: 600,
      displayMode: DisplayMode.FullScreen,
      backgroundColor: world.skyColor
    });
  }
  public start() {
    let loader = new Loader();
    for (let key in Resources) {
      loader.addResource(Resources[key]);
    }
    return super.start(loader);
  }
}