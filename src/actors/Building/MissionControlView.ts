import { Color, Vector } from "excalibur";
import { Building } from "./Building";
import { Citizen } from "../Citizen";
import { Orientation } from "../../values/Orientation";
import { Slot } from "../../values/Slot";

export class MissionControlView extends Building {
    hideBox = true

    slots() {
        let theSlots: Slot[] = []
        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth()/2,
                this.pos.y + this.getHeight(),
                Orientation.Down
            )
        )

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

    constrainCursor(cursor: Vector): Vector {
        cursor.y = this.planet.getTop();
        return cursor;
    }

    reshape(cursor: Vector) {
        this.pos = cursor
        this.pos.y -= this.getHeight() - 2 // + 1
    }

    async interact(citizen: Citizen) {
        let resource = citizen.drop()
        if (resource) {
            this.planet.gather(resource)
        }
    }


    draw(ctx: CanvasRenderingContext2D, delta: number) {
        let color = this.mainColor();

        ctx.fillStyle = color.toRGBA()
        // y is going to be surface height
        ctx.fillRect(this.pos.x, this.pos.y, this.getWidth(), this.getHeight())

        // could draw a little flag :)
        let flagpoleHeight = 18
        let flagX = this.pos.x + 3*(this.getWidth()/4)
        let flagY = this.pos.y - flagpoleHeight
        ctx.fillRect(flagX, flagY, 2, flagpoleHeight)
        ctx.fillRect(flagX, flagY, 10, 5)

        super.draw(ctx, delta)
    }

    colorBase() { return Color.White; }
}