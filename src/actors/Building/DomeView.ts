import { Color, Vector } from "excalibur";
import { Building } from "./Building";
import { Citizen } from "../Citizen";
import { Orientation } from "../../values/Orientation";
import { SurfaceRoad } from "../../models/Structure";

// we're constrained to the surface, so...
export class DomeView extends Building {
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

    // constrainCursor(cursor: Vector): Vector {
    //     // cursor.x = this.x //.getTop()
    //     cursor.y = this.planet.getTop() - this.getHeight() + 4; //Math.max(planet.getTop() + 100, cursor.y)
    //     return cursor;
    // }

    reshape(cursor: Vector) {
        this.alignToSlot(cursor)
        // this.pos = cursor // x = cursor.x
    }

    interact(citizen: Citizen) {
        // give actor a green block?
        if (this.product.length > 0) {
            citizen.carry(Color.Green)
            this.product.pop()
        }
        return true
        // this.structure.interaction
    }

    produce(step: number) {
        if (step % 100 === 0) {
            this.product.push(Color.Green)
        }
    }


    draw(ctx: CanvasRenderingContext2D, delta: number) {
        // super.draw(ctx, delta)

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

        this.product.forEach((produced, index) => {
            ctx.fillStyle = produced.toRGBA();
            ctx.fillRect(this.x + 20 * index, this.y - 20, 18, 18)
        })

        super.draw(ctx, delta)
    }

    colorBase() { return Color.White.darken(0.05); } // this.baseColor; }

    validConnectingStructures() { return [ SurfaceRoad ]; }
}