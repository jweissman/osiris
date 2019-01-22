import { Engine, DisplayMode, Loader, Timer, Color } from 'excalibur';
import { World } from './models/World';
import { Resources } from './Resources';

export class Game extends Engine {
  static citizenSpeed: number = 100
  static debugPath: boolean = false
  static startHour: number = 8

  static minuteTickMillis: number = 1000

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
    loader.backgroundColor = '#0a0e0c'
    // loader.logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAABACAYAAAD1Xam+AAACwklEQVR4nO3dQXKbMBQAULvTbXYe1u30fln0IF3kfp1mzXjnA7grMoRxDBISSOi9VSYBPsrw/xdg8OkEAAAAAAAAAAAAAAAAAAAAABTjvPcOHEXfX+/P/t51l6z/61zx+/56n647Fys27qNYIeum2o+WfN97B2o2Puj+/Pq5eNlUB2PINlPHX7qNIW6OBNxz/EehAETq++t9LunHxsuu6XSx2xgvmyJ+aNzUMWsZf+kUgEBDJwlJ/qnX7hLdGVN01K67nHN25mcxUxS+YXtr92Xtdo5AAQgQ2vWfee0uH9sMmU6nOmBzdea5mGvP82sef4m+7b0DtUiZ/D9eXj5+Hs8G5uLnOFDH3bBkrY8/FwWATbWecKVRABZI2f0fmZsF5J6mlp6UrY8/JwVgRu7kH3xVBLY6Ry01CVoff24KADRMAYCGKQBP5Jr+v99uD38/PQ3Y+hbVFtPgvW57LtHiaYACAA1TAPgkZ8et4UM3pe9fagrAxr6a/h9dDcnfIh8F3lBM8u9xTpr6oZ0126x9/KVTADYSk/x7HIhLE27pcmsf2oldN1ZrFwEVgA0ccdq/5Pn7ljpprVwDyGxN8tfcjVLcUqt5/LVQAJ7ousv5999/Ueu+327Byf/WXz911q3vS5fWtVsf/xYUgAyOOOWP0eIHa2rjGkAikv6xVG8CIg8FYMZwAA9v8MllOv2fxt/ircIlJmnr48/NKcACXXc5v/XXbNv/KvnH8XNOpUt/3r728ZdMAWATrgeUSQFYKNcsYK77j+PnSKBaul/r48/FNYAA44Nw7TWBoZiEvts+1eus93gt9trz+drHXyIFIND4ddKxRWBp15+LX8LrtUOlKAKnU73jL40CEGk6JZ0rBuPTh1RfzdXyV2O1Pv5UFIAVpl83tXTZo8SPlerWXq3jBwAAAAAAAAAAAAAAAAAAAAB46D+AUA+q0Ax9RQAAAABJRU5ErkJggg=='
    loader.logo = 'data:image/png;base64,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'
    loader.logoWidth = 3 * 256
    loader.logoHeight = 3 * 64

    // loader.playButtonText = 'make planetfall'
    loader.startButtonFactory = () => {
      let myButton = document.createElement('button');
      myButton.textContent = 'Make Planetfall';
      myButton.style.border = 'none'
      myButton.style.display = 'block'
      myButton.style.padding = '14px'
      myButton.style.fontFamily = 'Helvetica'
      myButton.style.color = 'white'
      myButton.style.fontSize = '20pt'
      myButton.style.fontWeight = '300'

      myButton.style.backgroundColor = '#9a5e5c'
      return myButton;
    };

    return super.start(loader).then(() => {
      console.log("Osiris running.")
    });
  }
}