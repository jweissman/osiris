import { Label, UIActor, Color } from "excalibur";
import { Dome, Structure, AccessTunnel, CommonArea } from "../models/Structure";

export class Hud extends UIActor {
    label: Label
    constructor(message='welcome to osiris', protected onBuildingSelect=null) {
        super(0,0);
        this.label = new Label(message, 10, 32, 'Helvetica')
        this.label.fontSize = 32
        this.label.color = Color.White
        this.add(this.label)

        // create html fragment for building palette?
        //let menu = document.createElement('div')
        //let button = document.createElement('button')
        //button.textContent = 'dome'
        //menu.appendChild(button)
        //menu.style.position = 'absolute'
        //menu.style.top = `${this._engine.canvas.clientTop}`
        // this.add(menu.getRootNode())

        // this._makePalette()
    }
    protected _paletteElement: HTMLDivElement
    protected _paletteButton

    protected _makePalette() {
        this._paletteElement = document.createElement('div') 
        this._paletteElement.style.position = 'absolute'
        document.body.appendChild(this._paletteElement)

        // buttons
        let structures = [Dome, AccessTunnel, CommonArea];
        structures.forEach((structure: typeof Structure) => {
            let _paletteButton = document.createElement('button')
            _paletteButton.textContent = `create ${structure.name}`
            _paletteButton.style.display = 'block'
            this._paletteElement.appendChild(
                _paletteButton
            )

            _paletteButton.onclick = (e) => {
                console.log(`create ${structure.name}`)
                e.stopPropagation()
            }
        });
    }

    message(text: string) { this.label.text = text }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)

        if (this._paletteElement) {
            let canvasHeight = this._engine.canvasHeight / window.devicePixelRatio;
            let canvasWidth = this._engine.canvasWidth / window.devicePixelRatio;

            let left = ctx.canvas.offsetLeft;
            let top = ctx.canvas.offsetTop;
            // let buttonWidth = this._playButton.clientWidth;
            // let buttonHeight = this._playButton.clientHeight;
            this._paletteElement.style.left = `${left + 20}px`;
            this._paletteElement.style.top = `${top + 100}px`;

        }
    }
}