import { Color, Vector } from "excalibur";
import { Building } from "./Building";
import { Orientation } from "../../values/Orientation";

export class DomeView extends Building {
    hideBox = true

    slots() {
        let theSlots = [];
        let slotY = this.getHeight();


        theSlots.push(
            this.buildSlot(
                this.pos.x, this.pos.y + slotY,
                Orientation.Left
            )
        )

        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth(),
                this.pos.y + slotY,
                Orientation.Right
            )
        )

        return theSlots;
    } 

    reshape(cursor: Vector) {
        this.alignToSlot(cursor)
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        let color: Color = this.mainColor()

        ctx.beginPath()
        ctx.arc(
            this.pos.x + this.getWidth()/2,
            this.pos.y + this.getHeight(),
            this.getHeight()/1.5,
            0,
            Math.PI,
            true
        )
        ctx.closePath()
        ctx.fillStyle = color.toRGBA()
        ctx.fill()

        super.draw(ctx, delta)
    }

    colorBase() { return Color.White.darken(0.05); } 

    devicePlaces() {
        let w = this.getWidth()/2
        let x = this.pos.x + w;
        let y = this.pos.y + this.getHeight() - 6
        return [
            new Vector(x - w/3, y),
            new Vector(x, y),
            new Vector(x + w/3, y),
        ]
    }
}