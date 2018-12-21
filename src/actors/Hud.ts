import { Label, UIActor, Color, Actor } from "excalibur";
import { Dome, Structure, AccessTunnel, CommonArea, LivingQuarters, SurfaceRoad, Mine, Laboratory, Kitchen, Mess, PowerPlant } from "../models/Structure";
import { Game } from "../Game";
import { ResourceBlock, blockColor } from "../models/Economy";

class ResourceListEntry extends Actor {
    icon: Actor
    count: Label
    constructor(x: number, y: number, resourceBlock: ResourceBlock, protected value: number) {
        super(x,y,10,10) // 10,10,blockColor(resourceBlock))
        let icon = new Actor(x, y, 10, 10, blockColor(resourceBlock)) //ResourceBlock.Meal))
        this.add(icon)
        this.count = new Label(`x${value}`, x + 10, y + 8, 'Helvetica')
        this.count.fontSize = 12
        this.count.color = Color.White
        this.add(this.count)
    }

    credit(amt: number) {
        this.value += amt
        this.count.text = `x${this.value}`
    }
}

class ResourcesList extends Actor {
    entries: { [block in ResourceBlock]: ResourceListEntry } = {
        [ResourceBlock.Meal]: null,
        [ResourceBlock.Food]: null,
        [ResourceBlock.Ore]: null,
        [ResourceBlock.Data]: null,
    }
    constructor(x: number, y: number) {
        super(x, y, 60, 60, Color.DarkGray.darken(0.8))
        let rx0 = -8, ry0 = -10
        let resources = [ResourceBlock.Meal, ResourceBlock.Data, ResourceBlock.Ore]
        resources.forEach((resource, index) => {
            let rx = rx0, ry = ry0 + index * 10
            let entry = new ResourceListEntry(rx,ry,resource,0)
            this.add(entry)
            this.entries[resource] = entry
        })
    }

    increment(resource: ResourceBlock) {
        this.entries[resource].credit(1)
    }
}

export class Hud extends UIActor {
    label: Label
    resources: ResourcesList
    protected _paletteElement: HTMLDivElement
    static structuresForPalette = [
        Dome, AccessTunnel, CommonArea,
        LivingQuarters, SurfaceRoad,
        Laboratory, Mine,
        Kitchen, Mess,
        PowerPlant
    ];
    constructor(game: Game, message = 'welcome to osiris', protected onBuildingSelect = null) {
        super(0, 0);
        this.label = new Label(message, 20, game.canvasHeight - 64, 'Helvetica')
        this.label.fontSize = 32
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
        let fg = Color.Blue.lighten(0.8).desaturate(0.55) //.toRGBA()
        let paletteButton = document.createElement('button');
        paletteButton.textContent = `${s.name}`;
        paletteButton.style.display = 'block';
        paletteButton.style.fontSize = '12pt';

        paletteButton.style.fontFamily = 'Helvetica';
        paletteButton.style.fontWeight = '700';
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