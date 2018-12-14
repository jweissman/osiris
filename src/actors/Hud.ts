import { Label, UIActor, Color } from "excalibur";
import { Dome, Structure, AccessTunnel, CommonArea, LivingQuarters, SurfaceRoad } from "../models/Structure";

export class Hud extends UIActor {
    label: Label
    constructor(message='welcome to osiris', protected onBuildingSelect=null) {
        super(0,0);
        this.label = new Label(message, 10, 32, 'Helvetica')
        this.label.fontSize = 32
        this.label.color = Color.White
        this.add(this.label)

        this._makePalette(onBuildingSelect)
    }
    protected _paletteElement: HTMLDivElement
    protected _paletteButton

    protected _makePalette(fn: (Structure) => any) {
        this._paletteElement = document.createElement('div') 
        this._paletteElement.style.position = 'absolute'
        document.body.appendChild(this._paletteElement)

        // buttons
        let structures = [
            Dome, AccessTunnel, CommonArea,
            LivingQuarters, SurfaceRoad,
        ];
        structures.forEach((structure: typeof Structure) => {
            let s = new structure()
            let _paletteButton = this.buttonFactory(s);
            this._paletteElement.appendChild(
                _paletteButton
            )


            _paletteButton.onclick = (e) => {
                // console.log(`${structure.name}`)
                fn(s) //new structure())
                e.stopPropagation()
            }
        });
    }

    private buttonFactory(s: Structure) {
        let _paletteButton = document.createElement('button');
        _paletteButton.textContent = `${s.name}`;
        _paletteButton.style.display = 'block';
        _paletteButton.style.fontSize = '13pt';
        _paletteButton.style.fontFamily = 'Helvetica';
        _paletteButton.style.padding = '8px';
        _paletteButton.style.width = '100px';
        _paletteButton.style.background = Color.White.darken(0.08).toRGBA();
        _paletteButton.style.color = Color.Black.lighten(0.16).toRGBA();
        return _paletteButton;
    }

    message(text: string) { this.label.text = text }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)

        if (this._paletteElement) {
            // let canvasHeight = this._engine.canvasHeight / window.devicePixelRatio;
            // let canvasWidth = this._engine.canvasWidth / window.devicePixelRatio;

            let left = ctx.canvas.offsetLeft;
            let top = ctx.canvas.offsetTop;
            // let buttonWidth = this._playButton.clientWidth;
            // let buttonHeight = this._playButton.clientHeight;
            this._paletteElement.style.left = `${left + 20}px`;
            this._paletteElement.style.top = `${top + 100}px`;

        }
    }

}