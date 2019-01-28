import { Engine, DisplayMode, Loader, Timer, Color } from 'excalibur';
import { World } from './models/World';
import { Resources } from './Resources';

export class Game extends Engine {
  // static showTutorial: boolean = true
  static citizenSpeed: number = 130
  static debugPath: boolean = false
  static startHour: number = 9

  // 10000 = 1 min / 10 sec
  // 1000 = 1 min / second
  // 100 = 10 min / second
  static minuteTickMillis: number = 1e3

  static font = 'Helvetica'
  static title: string = 'ASTRA';

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
    // loader.logo = 'data:image/png;base64,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'
    // loader.logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAACACAYAAAB9V9ELAAAHOElEQVR4nO3dvYodRxoG4G+WTZ0tzgRrjDZXNjB34AXpThzoQhzMndgg3cHAZM4lhBaUCWW+AG3iZuYUp7v6p/qnup4nnBl1V59CwftWVZ8IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIiIuNl7ALTl69dvV3/+5fExIiJe3N5+X3L9L4+PN39f5+rvf/zxX0suv1jf8z+z6Pkj83+61PM/e45uvDfXrn/l70q7+rxzn3Psc811lvnnHP6x9wAAgO39c+8B0IYu+Xx4/y4iIv7zy38vkk6X2H/7+adF93n76fPVBPXh/bub5+PYOgldSX59SW9pKzd43b2ePx1HQenzHuU5L5h/jkgDAAANsgeAVaSJJ13jX5r0p3r76XNERHx8eLiJiHh5d3fx+9KJaGCt92Jtuc/U8UxYWy6yZr5gD0CRNfWpn+/Y+5Ua79nnn3PQAABAgzQAFJVb6986+Xf+99dfERFxnySlP//4/SYi4tXrNxGxSjK9ukbdWTt5rTWevRuAgfFcvV8nd9+l421l/jkHDQAANMgpAIroS/57Jf4+vyYJ5/7rt+8RT03A3F3SYxNoZ6uk1d3n2fjS8VyMs9Zd4gPPOWrNfSnzT400AADQIA0ARR01+f/7hx8i4mkvQKdrBLomIMqdwz7U2urA2vymSXltVxLvhQ0SrvmnGhoAAGiQBoBFuiTx7Jz/nsNZ7OPDQ0SMT4q589d7J78+B0jKW1k14Zp/aqYBAIAGaQCYpZZd/2OlewFypwKm7vquwNWkXGsSzCXcpcw/Z6ABAIAGaQBYpPbkn5pxKuCQu77H2vv8/AmYf6qlAQCABmkAoKBakl9q7TXzVph/aqIBAIAGaQCY5Szn/nPS9wK0qrbd4Bvu/odqaQAAoEEaAGZ5cXtb1e7/9DsAckacBjj7Lumz7AZfa/y1fy45Z5l/BmgAAKBBGgAooJa18Zzad4Pv9W5+80+NNAAA0CANADCkirXfE76b/yh8fiemAQCABmkAOLWpu//nsma6rYHPe5d385t/aqQBAIAGaQA4pa2SfzwlzrMruhZcMDGnn//W38pn/qmWBgAAGqQB4FQ2TP6tJKLSCbf09a7OwwbJ3/xTPQ0AADRIA8ApbJj8rzrLm+A6K+5qX5qcd9nln7P3/UtzqqENGgAAaJAGgKrtmPwvkmiXmGpPglslv6mf07NxHeVb6sw/1dMAAECDNADM8uXx8SYi4u2nz98jIn77+adN7rtV4r//Owl9fHi4iYh4eXeX/slRkuhaDvVcuW+p2yGBm3+qpwEAgAZpAJjlxe3tpvfba62/S/5psmxtrfSAa9tXE/jaTUCuiYCaaAAAoEEaAA5l7/P8S9W6G7yWRHslgR9qLd78UxMNAAA0SAPAIh/ev7s4DfBrZckn1e3+//OP328iIl69fpP7J7usRZdyJfkdIknnHOhUgPmnWhoAAGiQBoBZ0gTWnZe///qtyiYgPfffJf++BHf0tegZDvmO/Qk2TeLmnzPQAABAgzQALHK2c9F95/77HGgtepLcfB1tvH32TuLmn5ppAACgQRoAiup2z9eyF2DGrv+cwbXoztYJayDx1bpmfeFASdz8Uw0NAAA0SANAEWkCS5uAzt6NwH2ShNLkPzeZjViLvvj5Vol04Jz3xXg6J1r7PdqpgIufm3+OQAMAAA2y7sMq0uTx8eEhIiJe3t3tsjcgPeff7fbvlE4+S9dcp45nxCmMwfsuuN/FdQe+NXHw70rLveGu7/6lxnv2+eccNAAA0CANAJt4tjcgIiJevX6TrkVGxPJmIF3j75Ra659rxFpsZ+n/yVHXXfr8R28AcvfvbDXes80/56ABAIAGOQXAJgZ2SUfE0x6B9NTAVH1r/Hsl/07u+Z9Z9PwD170YR4N2fVe/+eeINAAA0CANAJsasft6UTKb+i7/ra39/Ln7rGDseHfZbzQheadWGe8J55+KaQAAAAAAAOCUvAeAIka8iWxXuW+LK32fzlr3m/o8Wz3/WqxpQ3n2AABAgzQAFHHlDWqpvm9HS3+fXqfv57l/1/f7qddPrzP4+4GkvXTcufPr6e+n/n2pn099zvTvfFsdbEQDAAAN8h4A1tKXPHMJdWySnfv7qdfvM7Y9WzuJ594cN/bvx34uY9+kV+rz3eXNfdACDQAANEgDwCwDu8m3Sm5zk3XOrDX0sWvTBXbj55qMpX8/9f5zzZq/Wk8x1M7ei3PSAABAgzQAzJXb7b20CcglzKV7BEpdPyKekmkuKRVMsHObjZyxyb5UkzD2+qWaB+axB+OENAAA0CANAHOt9X3m6fXnXi/XPPRdf+z9xr5vIHe+fez5+Qsrvglw6zX+9L45kigUogEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoBH/B3e/aYAJzy67AAAAAElFTkSuQmCC'
    loader.logoWidth = 3 * 256
    loader.logoHeight = 3 * 64

    // loader.playButtonText = 'make planetfall'
    loader.startButtonFactory = () => {
      let myButton = document.createElement('button');
      myButton.textContent = 'Make Planetfall';
      myButton.style.border = 'none'
      myButton.style.display = 'block'
      myButton.style.padding = '24px'
      myButton.style.fontFamily = Game.font //'Helvetica'
      myButton.style.color = 'white'
      myButton.style.fontSize = '20pt'
      myButton.style.fontWeight = '300'

      myButton.style.backgroundColor = '#9a5e5c'


      myButton.onmouseenter = () => {
        myButton.style.backgroundColor = Color.Red.darken(0.5).toRGBA()
      }
      myButton.onmouseleave = () => { myButton.style.backgroundColor = '#9a5e5c' }
      return myButton;
    };

    return super.start(loader).then(() => {
      console.log("Osiris running.")
    });
  }
}