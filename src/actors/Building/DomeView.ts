import { Color, Vector } from "excalibur";
import { Building } from "./Building";
import { Citizen } from "../Citizen";
import { Orientation } from "../../values/Orientation";
import { SurfaceRoad } from "../../models/Structure";
import { ResourceBlock } from "../../models/Economy";

// we're constrained to the surface, so...
export class DomeView extends Building {
    productionTime = 300
    // produces = ResourceBlock.Food
    // productColor = Color.Green
    hideBox = true

    slots() {
        // left slot -- right slot
        let theSlots = [];
        let slotY = this.getHeight(); // / 2;


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
            this.getHeight()/1.5, // / 2,
            0,
            Math.PI,
            true
        )
        ctx.closePath()
        ctx.fillStyle = color.toRGBA()
        ctx.fill()

        super.draw(ctx, delta)
    }

    colorBase() { return Color.White.darken(0.05); } // this.baseColor; }

    validConnectingStructures() { return [ SurfaceRoad ]; }
}