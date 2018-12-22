import { Building } from ".";
import { AccessTunnel } from "../../models/Structure";
import { Slot } from "../../values/Slot";
import { Orientation } from "../../values/Orientation";
import { Vector, Polygon } from "excalibur";

export class PowerPlantView extends Building {
    showLabel = true

    validConnectingStructures() { return [ AccessTunnel ]}

    draw(ctx, delta) {
        // octagon...
        super.draw(ctx, delta)
    }

    slots() {
        let theSlots = []
        let slotY = this.getHeight() / 2
        let leftSlot: Slot = this.buildSlot(
            this.pos.x,
            this.pos.y + slotY,
            Orientation.Left,
        )
        theSlots.push(leftSlot)

        let rightSlot: Slot = this.buildSlot(
            this.pos.x + this.getWidth(),
            this.pos.y + slotY,
            Orientation.Right,
        )
        theSlots.push(rightSlot)
        return theSlots;
    }

   nodes(): Vector[] {
        let x = this.pos.x + this.getWidth()/2;
        let y = this.pos.y + this.getHeight()/2 //-this.floorHeight
        return [
            new Vector(Math.floor(x), Math.floor(y)) //-16)
        ];
    }

    reshape(cursor) {
        this.alignToSlot(cursor);
    }


}