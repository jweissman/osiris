import { Label, UIActor, Color } from "excalibur";
import { Dome, Structure, AccessTunnel, CommonArea, LivingQuarters, SurfaceRoad, Mine, Laboratory, Kitchen, Mess, PowerPlant } from "../models/Structure";

export class Hud extends UIActor {
    label: Label
    protected _paletteElement: HTMLDivElement
    static structuresForPalette = [
        Dome, AccessTunnel, CommonArea,
        LivingQuarters, SurfaceRoad,
        Laboratory, Mine,
        Kitchen, Mess,
        PowerPlant
    ];
    constructor(message = 'welcome to osiris', protected onBuildingSelect = null) {
        super(0, 0);
        this.label = new Label(message, 10, 32, 'Helvetica')
        this.label.fontSize = 32
        this.label.color = Color.White
        this.add(this.label)

        this._makePalette(onBuildingSelect)
    }


    message(text: string) { this.label.text = text }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)

        if (this._paletteElement) {
            let left = ctx.canvas.offsetLeft;
            let top = ctx.canvas.offsetTop;
            this._paletteElement.style.left = `${left + 20}px`;
            this._paletteElement.style.top = `${top + 100}px`;
        }
    }

    protected _makePalette(fn: (Structure) => any) {
        this._paletteElement = document.createElement('div') 
        this._paletteElement.style.position = 'absolute'
        document.body.appendChild(this._paletteElement)

        Hud.structuresForPalette.forEach((structure: typeof Structure) => {
            let s = new structure()
            let _paletteButton = this.buttonFactory(s);
            this._paletteElement.appendChild(
                _paletteButton
            )

            _paletteButton.onclick = (e) => {
                fn(s)
                // e.stopPropagation()
            }
        });
    }

    private buttonFactory(s: Structure) {
        let paletteButton = document.createElement('button');
        paletteButton.textContent = `${s.name}`;
        paletteButton.style.display = 'block';
        paletteButton.style.fontSize = '13pt';
        paletteButton.style.fontFamily = 'Helvetica';
        paletteButton.style.padding = '8px';
        paletteButton.style.width = '100px';
        paletteButton.style.background = Color.White.darken(0.08).toRGBA();
        paletteButton.style.color = Color.Black.lighten(0.16).toRGBA();
        return paletteButton;
    }
}