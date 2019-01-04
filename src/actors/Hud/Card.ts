import { Color, Actor } from "excalibur";
import { Structure } from "../../models/Structure";
import { Machine } from "../../models/Machine";
import { CardTitle } from "./CardTitle";
import { CardBody } from "./CardBody";
import { SpaceFunction } from "../../models/SpaceFunction";

export class Card extends Actor {
    title: CardTitle
    cardBody: CardBody
    image: any

    constructor(private entity: Machine | Structure | SpaceFunction, x: number, y: number) {
        super(x + 160, y + 90, 320, 180, Color.White);
        let x0 = -150, y0 = -50;
        this.title = new CardTitle(entity, x0 - 3, y0); //x, y)
        this.add(this.title);
        this.cardBody = new CardBody(entity, x0 + 14, y0 + 40)
        this.add(this.cardBody)

        this.image = new Image();
    }

    draw(ctx: CanvasRenderingContext2D, delta) {
        super.draw(ctx, delta)
        if (this.entity) {
            if (this.entity instanceof Machine) {
                let ix = this.pos.x + 48, iy = this.pos.y - 16
                let isz = 92
                ctx.drawImage(this.image, ix, iy, isz, isz)
            }
        }
    }

    present(entity: Machine | Structure | SpaceFunction): any {
        this.title.announce(entity)
        this.cardBody.show(entity)

        this.entity = entity
        if (this.entity instanceof Machine) {
            this.image.src = this.entity.image
        }
    }

}
