import { Color } from "excalibur";
import { EntityKind } from "../../values/Entity";
import { onlyUnique } from "../../Util";

class PaletteGroup {

    built: EntityKind[] = [];
    comprehended: EntityKind[] = [];
    constructor(private name: string, private all: EntityKind[], private comprehend = true) {
    }
}

export class Palette {
    private _element: HTMLDivElement;
    built: EntityKind[] = [];
    comprehended: EntityKind[] = [];
    constructor(
        private name: string,
        private x: number,
        private y: number,
        private all: EntityKind[],
        private onButtonClick: (EntityKind) => any = null,
        private onButtonEnter: (EntityKind) => any = null,
        private comprehend = true 
    ) {
        this.makePalette();
    }

    draw(ctx: CanvasRenderingContext2D): any {
        if (this._element) {
            let left = ctx.canvas.offsetLeft;
            let top = ctx.canvas.offsetTop;
            this._element.style.left = `${left + this.x + this.xOff}px`;
            this._element.style.top = `${top + this.y + this.yOff}px`;
        }
    }

    updateBuilt(built: (EntityKind)[], unlocked: (EntityKind)[] = []) {
        this.built = built;
        if (this.comprehend) {
            let nowComprehended = this.all.filter((e: EntityKind) => {
                let s = new e();
                let prereqs: (EntityKind)[] = s.prereqs;
                return prereqs.every((prereq: EntityKind) => {
                    let built = this.built.some((s: EntityKind) => s === prereq);
                    return built;
                });
            });
            this.comprehended = [
                ...nowComprehended,
                ...unlocked
            ].filter(onlyUnique)
        } else {
            this.comprehended = [ ...this.built, ...unlocked ].filter(onlyUnique)
        }
        this.makePalette();
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

    title: HTMLDivElement
    dragging: boolean = false
    xOff: number = 0
    yOff: number = 0
    initialX: number
    initialY: number
    private makePalette() {
        if (this._element) {
            this._element.parentElement.removeChild(this._element);
        }
        if (!(this.comprehended.length > 0)) { return }

        this._element = document.createElement('div');
        this._element.style.position = 'absolute';
        this._element.style.display = 'flex';
        this._element.style.flexWrap = 'wrap';
        this._element.style.width = '200px';
        this._element.style.border = 'none'; //1px solid black'; //0.5px solid white';
        // this._element.style.zIndex = '1'; //1px solid black'; //0.5px solid white';


        document.body.appendChild(this._element);

        if (this.name) {
            let container = document.createElement('div')
            container.style.width = '200px'
            // container.draggable = true
            // container.position = 'absolute'
            container.style.backgroundColor = Color.Violet.darken(0.92).toRGBA()

            this.title = document.createElement('div')
            this.title.textContent = this.name
            this.title.style.fontFamily = 'Verdana'
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

        this.comprehended
            .map((elem: EntityKind) => new elem())
            .sort((a, b) => a.color > b.color ? -1 : 1)
            .forEach(elem => {
                if (elem.hide) { return }
                let label = elem.name;
                if (!this.built.map(m => new m().name).includes(elem.name)) {
                    label += ' *';
                }
                let clr = elem.color;
                let btn = this.buttonFactory(label, clr);
                this._element.appendChild(btn);
                if (this.onButtonEnter) {
                    btn.onmouseenter = () => { this.onButtonEnter(elem); };
                }
                if (this.onButtonClick) {
                    btn.onclick = () => { this.onButtonClick(elem); };
                }
            });
    }

    private buttonFactory(label: string, color: Color) {
        let bg = color.darken(0.5).desaturate(0.5).clone();
        bg.a = 0.8;
        let fg = color.lighten(0.8).desaturate(0.4).clone();
        let paletteButton = document.createElement('button');
        paletteButton.textContent = label;

        paletteButton.style.display = 'block';
        paletteButton.style.fontSize = '6pt';
        paletteButton.style.fontFamily = 'Verdana';
        paletteButton.style.fontWeight = '500';
        paletteButton.style.padding = '2px';
        paletteButton.style.width = '100px';
        paletteButton.style.textTransform = 'uppercase';
        paletteButton.style.border = 'none' //1px solid rgba(255,255,255,0.08)';
        paletteButton.style.background = bg.toRGBA();
        paletteButton.style.color = fg.toRGBA();
        paletteButton.onmouseover = () => {
            paletteButton.style.background = bg.saturate(0.5).lighten(0.95).toRGBA();
            paletteButton.style.color = fg.lighten(0.9).toRGBA();
        };
        paletteButton.onmouseleave = () => {
            paletteButton.style.background = bg.toRGBA();
            paletteButton.style.color = fg.toRGBA();
        };
        return paletteButton;
    }
}
