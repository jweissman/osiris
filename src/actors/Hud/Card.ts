import { Label, Color, Actor, FontStyle } from "excalibur";
import { Structure } from "../../models/Structure";
import { Machine } from "../../models/Machine";
import { CardTitle } from "./CardTitle";
import { drawRect } from "../../Util";

export class Card extends Actor {
    title: CardTitle
    description: Label
    image: any
    constructor(private entity: Machine | Structure, x: number, y: number) {
        super(x + 150, y, 320, 180, Color.White);
        let x0 = -150, y0 = -50;
        this.title = new CardTitle(entity, x0 - 3, y0); //x, y)
        this.add(this.title);
        this.description = new Label(entity && entity.description || 'okay', x0 + 14, y0 + 40);
        this.description.fontSize = 10;
        this.description.fontStyle = FontStyle.Italic;
        this.add(this.description);
        

        this.image = new Image();
        // this.image.onload = function () {
            //  this.imageLoaded = true
        // }
    }

    draw(ctx: CanvasRenderingContext2D, delta) {
        super.draw(ctx, delta)
        if (this.entity) { //}.image)
            // console.log("DRAW IMAGE")
            if (this.entity instanceof Machine && this.image) {
                let ix = this.pos.x + 48, iy = this.pos.y - 16
                let isz = 92
                drawRect(ctx, { x: ix, y: iy, width: isz, height: isz }, 1, Color.LightGray.lighten(0.1))
                ctx.drawImage(this.image, ix, iy, isz, isz)
            }
        }
    }

    present(entity: Machine | Structure): any {
        this.title.announce(entity)
        this.description.text = entity.description;

        this.entity = entity
        if (this.entity instanceof Machine) {
            this.image.src = this.entity.image
        }
    }

}
