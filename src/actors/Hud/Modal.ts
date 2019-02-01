import { Color } from "excalibur";
import { Game } from "../../Game";
export class Modal {
    private _element: HTMLDivElement

    private _header: HTMLDivElement
    private _body: HTMLDivElement
    private _footer: HTMLDivElement
    // private titleLabel: Label
    // private messageLabel: Label
    constructor(private title: string, private message: string, private x: number, private y: number, private width: number = 500) {
        this.makeDialog();
        // super(x,y,200,200, Color.DarkGray)
    }

    draw(ctx: CanvasRenderingContext2D): any {
        // console.log("DRAW MODAL")
        if (this._element) {
            let left = ctx.canvas.offsetLeft - this.width/2;
            let top = ctx.canvas.offsetTop - this._element.clientHeight/2;
            this._element.style.left = `${left + this.x}px`;
            this._element.style.top = `${top + this.y}px`;
        }
    }

    addButtons(buttonMap: {
        [intent: string]: () => any;
    }) {
        // throw new Error("Method not implemented.");
        let buttons = Object.entries(buttonMap)
        buttons.forEach(([intent, cb]) => {
            let btn = this.buttonFactory(intent, Color.Gray, this.width/(buttons.length))
            btn.onclick = cb
            this._footer.appendChild(btn)
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
        this._element.style.width = `${this.width}px`;
        this._element.style.border = 'none'; //1px solid black'; //0.5px solid white';
        document.body.appendChild(this._element);

        let bg = Color.Violet.clone().darken(0.92) //.clone..toRGBA()
        bg.a = 0.92

        let title = document.createElement('div');
        title.textContent = this.title;
        title.style.fontFamily = Game.font //'Verdana';
        title.style.fontSize = '14pt';
        title.style.fontWeight = '700';
        title.style.textTransform = 'uppercase';
        title.style.textAlign = 'center'
        title.style.width = `${this.width}px`;
        title.style.color = Color.White.toRGBA();
        title.style.backgroundColor = bg.toRGBA() //Color.Violet.darken(0.92).toRGBA();
        title.style.padding = '12px';
        title.style.margin = '0px';
        this._element.appendChild(title);

        this._header = document.createElement('div')
        this._header.style.width = `${this.width}px`;
        this._header.style.backgroundColor = bg.toRGBA() // Color.Violet.darken(0.92).toRGBA();
        this._element.appendChild(this._header)

        this._body = document.createElement('div');
        this._body.textContent = this.message;
        this._body.style.fontFamily = Game.font //'Verdana';
        this._body.style.fontSize = '9pt';
        this._body.style.fontWeight = '400';
        this._body.style.width = `${this.width}px`;
        this._body.style.color = Color.White.toRGBA();
        this._body.style.backgroundColor = bg.toRGBA() //Color.Violet.darken(0.92).toRGBA();
        this._body.style.padding = '24px';
        this._body.style.paddingBottom = '48px';
        this._body.style.margin = '0px';
        this._element.appendChild(this._body);

        this._footer = document.createElement('div')
        this._footer.style.width = `${this.width}px`
        this._footer.style.display = 'flex';
        this._footer.style.flexWrap = 'wrap';
        this._element.appendChild(this._footer)
    }

    addHeading(heading: string, size: number = 24, color: Color = Color.White) {
        let headerMessage = document.createElement('div');
        headerMessage.textContent = heading;
        headerMessage.style.fontFamily = Game.font // 'Helvetica';
        headerMessage.style.fontSize = `${size}pt`;
        headerMessage.style.fontWeight = '600';
        headerMessage.style.textAlign = 'center';
        headerMessage.style.width = `${this.width}px`;
        headerMessage.style.color = color.clone().toRGBA();
        // headerMessage.style.backgroundColor = Color.Violet.darken(0.8).toRGBA();
        headerMessage.style.padding = '0px';
        headerMessage.style.margin = '0px';
        this._header.appendChild(headerMessage)
    }

    addIconMatrix(iconSet: { image: string, label: string }[] = []) {
        // build a icon matrix
        let matrix = document.createElement('div')
        matrix.style.display = 'flex'
        matrix.style.flexWrap = 'wrap'
        matrix.style.padding = '15px'
        matrix.style.width = `100%` //${this.width}px`

        matrix.style.justifyContent = 'space-evenly'

        iconSet.forEach(({ label, image }) => {
            let img = new Image()
            img.width = 64
            img.height = 64
            img.src = image
            img.style.padding = '8px'

            let lbl = document.createElement('span')
            lbl.textContent = label
            lbl.style.textAlign = 'center'
            lbl.style.padding = '8px'
            lbl.style.fontSize = '6pt'
            lbl.style.fontFamily = Game.font

            let icon = document.createElement('div')
            icon.style.display = 'flex'
            icon.style.flexDirection = 'column'
            icon.style.padding = '4px'
            icon.appendChild(img)
            icon.appendChild(lbl)
            
            matrix.appendChild(icon)

        })

        this._body.appendChild(matrix)
    }

    private buttonFactory(label: string, color: Color = Color.DarkGray, width: number = this.width/2) {
        let bg = color.darken(0.5).desaturate(0.5).clone();
        bg.a = 0.8;
        let fg = color.lighten(0.8).desaturate(0.4).clone();
        let modalButton = document.createElement('button');
        modalButton.textContent = label;
        modalButton.style.display = 'block';
        modalButton.style.fontSize = '7pt';
        modalButton.style.fontFamily = Game.font //'Verdana';
        modalButton.style.fontWeight = '500';
        modalButton.style.padding = '20px';
        modalButton.style.width = `${width}px`;
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
