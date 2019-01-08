import { Color } from "excalibur";
import { EntityKind } from "../../values/Entity";

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
            this._element.style.left = `${left + this.x}px`;
            this._element.style.top = `${top + this.y}px`;
        }
    }

    updateBuilt(built: (EntityKind)[]) {
        this.built = built;
        if (this.comprehend) {
            this.comprehended = this.all.filter((e: EntityKind) => {
                let s = new e();
                let prereqs: (EntityKind)[] = s.prereqs;
                return prereqs.every((prereq: EntityKind) => {
                    let built = this.built.some((s: EntityKind) => s === prereq);
                    return built;
                });
            });
        } else {
            this.comprehended = this.built
        }
        this.makePalette();
    }

    private makePalette() {
        if (this._element) {
            this._element.parentElement.removeChild(this._element);
        }
        if (!(this.comprehended.length > 0)) { return }

        this._element = document.createElement('div');
        this._element.style.position = 'absolute';
        this._element.style.border = 'none'; //1px solid black'; //0.5px solid white';
        document.body.appendChild(this._element);

        if (this.name) {
            let title = document.createElement('h2')
            title.textContent = this.name
            title.style.fontFamily = 'Verdana'
            title.style.fontSize = '7pt'
            title.style.fontWeight = '400'
            title.style.color = Color.White.toRGBA()
            title.style.backgroundColor = Color.Violet.darken(0.92).toRGBA()
            title.style.padding = '4px'
            title.style.margin = '0px'
            this._element.appendChild(
                title
            )
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
        paletteButton.style.fontSize = '7pt';
        paletteButton.style.fontFamily = 'Verdana';
        paletteButton.style.fontWeight = '500';
        paletteButton.style.padding = '3px';
        paletteButton.style.width = '124px';
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
