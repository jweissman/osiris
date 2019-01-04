import { Color } from "excalibur";
import { EntityKind } from "../../values/Entity";

export class Palette {
    private _element: HTMLDivElement;
    built: EntityKind[] = [];
    comprehended: EntityKind[] = [];
    constructor(
        private x: number,
        private y: number,
        private all: EntityKind[],
        private onButtonClick: (EntityKind) => any = null,
        private onButtonEnter: (EntityKind) => any = null
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
        this.comprehended = this.all.filter((e: EntityKind) => {
            let s = new e();
            let prereqs: (EntityKind)[] = s.prereqs;
            return prereqs.every((prereq: EntityKind) => {
                let built = this.built.some((s: EntityKind) => s === prereq);
                return built;
            });
        });
        console.log("UPDATE BUILT", { built, comprehended: this.comprehended });
        this.makePalette();
    }

    private makePalette() {
        if (this._element) {
            this._element.parentElement.removeChild(this._element);
        }
        this._element = document.createElement('div');
        this._element.style.position = 'absolute';
        this._element.style.border = '1px solid white';
        document.body.appendChild(this._element);
        this.comprehended
            .map((elem: EntityKind) => new elem())
            .sort((a, b) => a.color > b.color ? -1 : 1)
            .forEach(elem => {
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
        let bg = color.darken(0.6).desaturate(0.5).clone();
        bg.a = 0.8;
        let fg = color.lighten(0.8).desaturate(0.4).clone();
        let paletteButton = document.createElement('button');
        paletteButton.textContent = label;
        paletteButton.style.display = 'block';
        paletteButton.style.fontSize = '9pt';
        paletteButton.style.fontFamily = 'Helvetica';
        paletteButton.style.fontWeight = '600';
        paletteButton.style.padding = '2px';
        paletteButton.style.width = '160px';
        paletteButton.style.textTransform = 'uppercase';
        paletteButton.style.border = '1px solid rgba(255,255,255,0.08)';
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
