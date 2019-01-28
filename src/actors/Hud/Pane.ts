import { Color } from "excalibur";
import { Game } from "../../Game";

export class Pane {
    protected _element: HTMLDivElement;
    title: HTMLDivElement
    dragging: boolean = false
    xOff: number = 0
    yOff: number = 0
    initialX: number
    initialY: number


    constructor(protected name: string, private x: number, private y: number) {
        this.makeRootElement()

    }

    protected makeRootElement() {
        if (this._element) {
            this._element.parentElement.removeChild(this._element);
        }
        // if (!(this.comprehended.length > 0)) { return }

        this._element = document.createElement('div');
        this._element.style.position = 'absolute';
        this._element.style.display = 'flex';
        this._element.style.flexWrap = 'wrap';
        this._element.style.width = '200px';
        this._element.style.border = 'none'; //1px solid black'; //0.5px solid white';
        // this._element.style.zIndex = '1'; //1px solid black'; //0.5px solid white';


        document.body.appendChild(this._element);

        // make title...
        if (this.name) {
            let container = document.createElement('div')
            container.style.width = '200px'
            // container.draggable = true
            // container.position = 'absolute'
            container.style.backgroundColor = Color.Violet.darken(0.92).toRGBA()

            this.title = document.createElement('div')
            this.title.textContent = this.name
            this.title.style.fontFamily = Game.font //'Verdana'
            this.title.style.border = 'none'
            this.title.style.fontSize = '7pt'
            this.title.style.fontWeight = '400'
            this.title.style.color = Color.White.toRGBA()
            this.title.style.padding = '4px'
            this.title.style.margin = '0px'

            container.appendChild(this.title)
            this._element.appendChild(
                container
            )

            /// hmmmm
            document.addEventListener("pointerdown", (e) => { this.dragStart(e) }, false);
            document.addEventListener("pointerup", (e) => { this.dragEnd(e) }, false);
            document.addEventListener("pointermove", (e) => { this.drag(e) }, false);

        }

    }

    draw(ctx: CanvasRenderingContext2D): any {
        if (this._element) {
            let left = ctx.canvas.offsetLeft;
            let top = ctx.canvas.offsetTop;
            this._element.style.left = `${left + this.x + this.xOff}px`;
            this._element.style.top = `${top + this.y + this.yOff}px`;
        }
    }
    private dragStart = (e) => {
        if (e.target === this.title) {
            // console.log("drag start")
            this.initialX = e.clientX - this.xOff;
            this.initialY = e.clientY - this.yOff;
            this.dragging = true
        }
    }

    private drag = (e) => {
        if (this.dragging) {
            e.preventDefault()
            // console.log("drag")
            let currentX = e.clientX - this.initialX;
            let currentY = e.clientY - this.initialY;
            this.xOff = currentX
            this.yOff = currentY
        }

    }

    private dragEnd = (e) => {
        if (this.dragging) {
            // console.log("drag end")
            this.dragging = false
        }

    }

    protected buttonFactory(label: string, color: Color = Color.LightGray) {
        let c = color.clone()
        let bg = c.darken(0.5).desaturate(0.5).clone();
        bg.a = 0.8;
        let fg = c.lighten(0.8).desaturate(0.4).clone();
        let theButton = document.createElement('button');
        theButton.textContent = label;

        theButton.style.display = 'block';
        theButton.style.fontSize = '6pt';
        theButton.style.fontFamily = Game.font // 'Verdana';
        theButton.style.fontWeight = '500';
        theButton.style.padding = '2px';
        theButton.style.width = '100px';
        theButton.style.textTransform = 'uppercase';
        theButton.style.border = 'none' //1px solid rgba(255,255,255,0.08)';
        theButton.style.background = bg.toRGBA();
        theButton.style.color = fg.toRGBA();
        theButton.onmouseover = () => {
            theButton.style.background = bg.saturate(0.5).lighten(0.95).toRGBA();
            theButton.style.color = fg.lighten(0.9).toRGBA();
        };
        theButton.onmouseleave = () => {
            theButton.style.background = bg.toRGBA();
            theButton.style.color = fg.toRGBA();
        };
        return theButton;
    }
}