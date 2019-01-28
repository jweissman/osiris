import { drawRect } from "../../Painting";
import { DomeView, Building } from ".";
import { Orientation } from "../../values/Orientation";
import { Color } from "excalibur";
import { DeviceSize } from "../../values/DeviceSize";

export class GroundVehiclePoolView extends Building {

    deviceSize = DeviceSize.Small
    colorBase() { return Color.Orange.clone().darken(0.05); } 
    draw(ctx, delta) {
        // drawRect(ctx, this.aabb())
       super.draw(ctx, delta)
    }

    slots() {
        let theSlots = [];
        let slotY = this.getHeight();

        let buffer = this.getWidth() / 4


        theSlots.push(
            this.buildSlot(
                this.pos.x - buffer, this.pos.y + slotY,
                Orientation.Left
            )
        )

        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth() + buffer,
                this.pos.y + slotY,
                Orientation.Right
            )
        )

        return theSlots;
    } 
}