import { Color } from "excalibur";
export class Modal {
    private _element: HTMLDivElement;
    // private titleLabel: Label
    // private messageLabel: Label
    constructor(private title: string, private message: string, private x: number, private y: number) {
        this.makeDialog();
        // super(x,y,200,200, Color.DarkGray)
    }
    draw(ctx: CanvasRenderingContext2D): any {
        // console.log("DRAW MODAL")
        if (this._element) {
            let left = ctx.canvas.offsetLeft;
            let top = ctx.canvas.offsetTop;
            this._element.style.left = `${left + this.x}px`;
            this._element.style.top = `${top + this.y}px`;
        }
    }

    addButtons(buttonMap: {
        [intent: string]: () => any;
    }) {
        // throw new Error("Method not implemented.");
        Object.entries(buttonMap).forEach(([intent, cb]) => {
            let btn = this.buttonFactory(intent)
            btn.onclick = cb
            this._element.appendChild(btn)
        })
    }

    teardown() {
        document.body.removeChild(this._element)
        // throw new Error("Method not implemented.");
    }

    private makeDialog() {
        this._element = document.createElement('div');
        this._element.style.position = 'absolute';
        this._element.style.display = 'flex';
        this._element.style.flexWrap = 'wrap';
        this._element.style.width = '200px';
        this._element.style.border = 'none'; //1px solid black'; //0.5px solid white';
        let title = document.createElement('div');
        title.textContent = this.title;
        title.style.fontFamily = 'Verdana';
        title.style.fontSize = '7pt';
        title.style.fontWeight = '400';
        title.style.width = '200px';
        title.style.color = Color.White.toRGBA();
        title.style.backgroundColor = Color.Violet.darken(0.92).toRGBA();
        title.style.padding = '4px';
        title.style.margin = '0px';
        this._element.appendChild(title);
        let body = document.createElement('div');
        body.textContent = this.message;
        body.style.fontFamily = 'Verdana';
        body.style.fontSize = '7pt';
        body.style.fontWeight = '400';
        body.style.width = '200px';
        body.style.color = Color.White.toRGBA();
        body.style.backgroundColor = Color.Violet.darken(0.92).toRGBA();
        body.style.padding = '4px';
        body.style.margin = '0px';
        this._element.appendChild(body);
        document.body.appendChild(this._element);
    }

    private buttonFactory(label: string, color: Color = Color.DarkGray) {
        let bg = color.darken(0.5).desaturate(0.5).clone();
        bg.a = 0.8;
        let fg = color.lighten(0.8).desaturate(0.4).clone();
        let modalButton = document.createElement('button');
        modalButton.textContent = label;
        modalButton.style.display = 'block';
        modalButton.style.fontSize = '6pt';
        modalButton.style.fontFamily = 'Verdana';
        modalButton.style.fontWeight = '500';
        modalButton.style.padding = '2px';
        modalButton.style.width = '100px';
        modalButton.style.textTransform = 'uppercase';
        modalButton.style.border = 'none'; //1px solid rgba(255,255,255,0.08)';
        modalButton.style.background = bg.toRGBA();
        modalButton.style.color = fg.toRGBA();
        modalButton.onmouseover = () => {
            modalButton.style.background = bg.saturate(0.5).lighten(0.95).toRGBA();
            modalButton.style.color = fg.lighten(0.9).toRGBA();
        };
        modalButton.onmouseleave = () => {
            modalButton.style.background = bg.toRGBA();
            modalButton.style.color = fg.toRGBA();
        };
        return modalButton;
    }
}
