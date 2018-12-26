import { Label, UIActor, Color } from "excalibur";
import { Dome, Structure, AccessTunnel, CommonArea, SurfaceRoad, Mine, Laboratory, Kitchen, PowerPlant, Study, Refinery, CloneMatrix, Arcology } from "../../models/Structure";
import { Game } from "../../Game";
import { ResourceBlock } from "../../models/Economy";
import { ResourcesList } from "./ResourcesList";

export class Hud extends UIActor {
    label: Label
    resources: ResourcesList
    protected _paletteElement: HTMLDivElement
    static structuresForPalette = [
        AccessTunnel, CommonArea,
        SurfaceRoad,

        // LivingQuarters, 
        Dome, Kitchen,
        // Mess,

        Study, Laboratory,
        Mine, Refinery,
        PowerPlant,

        CloneMatrix,
        Arcology,
    ];
    constructor(game: Game, message = 'hello', protected onBuildingSelect = null) {
        super(0, 0, game.canvasWidth, game.canvasHeight);

        this.label = new Label(message, 20, game.canvasHeight - 64, 'Verdana')
        this.label.fontSize = 24
        this.label.color = Color.White
        this.add(this.label)

        this._makePalette(onBuildingSelect)

        this.resources = new ResourcesList(50, 40)
        this.add(this.resources)
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

    resourceGathered(resource: ResourceBlock) {
        this.resources.increment(resource)
    }


    protected _makePalette(fn: (Structure) => any) {
        this._paletteElement = document.createElement('div') 
        this._paletteElement.style.position = 'absolute'
        this._paletteElement.style.border = '1px solid white'
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
        let bg = Color.DarkGray.darken(0.8) //.desaturate(0.25) //.toRGBA()
        bg.a = 0.6
        let fg = Color.Blue.lighten(0.8).desaturate(0.55) //.toRGBA()
        let paletteButton = document.createElement('button');
        paletteButton.textContent = `${s.name}`;
        paletteButton.style.display = 'block';
        paletteButton.style.fontSize = '10pt';

        paletteButton.style.fontFamily = 'Helvetica';
        paletteButton.style.fontWeight = '600';
        paletteButton.style.padding = '8px';
        paletteButton.style.width = '130px';
        paletteButton.style.textTransform = 'uppercase'
        paletteButton.style.border = 'none' //0.1px solid blue'
        paletteButton.style.background = bg.toRGBA(); //Color.Blue.darken(0.08).toRGBA();
        paletteButton.style.color = fg.toRGBA() //Color.Blue.lighten(0.16).toRGBA();
        paletteButton.onmouseover = () => {
            paletteButton.style.background = bg.lighten(0.4).toRGBA()
            paletteButton.style.color = fg.lighten(0.9).toRGBA() //Color.Blue.lighten(0.16).toRGBA();
        }
        paletteButton.onmouseleave = () => {
            //paletteButton.style.background = bg.toRGBA()
            paletteButton.style.background = bg.toRGBA(); //Color.Blue.darken(0.08).toRGBA();
            paletteButton.style.color = fg.toRGBA() //Color.Blue.lighten(0.16).toRGBA();
        } // Color.Blue.toRGBA() }

        return paletteButton;
    }
}