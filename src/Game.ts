import { Engine, DisplayMode, Loader, Timer, Color } from 'excalibur';
import { World } from './models/World';
import { Resources } from './Resources';

export class Game extends Engine {
  static citizenSpeed: number = 270
  static debugPath: boolean = false
  static startHour: number = 8

  static minuteTickMillis: number = 800

  constructor(public world: World) {
    super({
      width: 800,
      height: 600,
      displayMode: DisplayMode.FullScreen,
      backgroundColor: Color.Black //world.skyColor
    });
  }

  public start() {
    let loader = new Loader();
    for (let key in Resources) {
      loader.addResource(Resources[key]);
    }

    return super.start(loader).then(() => {
      console.log("Osiris running.")
    });
  }
}