import { Building } from "./Building";
import { Orientation } from "../../values/Orientation";
import { Slot } from "../../values/Slot";
import { Vector } from "excalibur";

export class CommonAreaView extends Building {
    floorHeight: number = 8
    edgeWidth: number = 0.5 //.1
    showLabel = true
    // maybe you can set height AND width of common area view??
    // maybe just width...
    colorBase() { return this.color.darken(0.1); }

    slots() {
        let theSlots = []
        let slotY = this.getHeight() - this.floorHeight
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

        // top slot
        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth()/2,
                this.pos.y,
                Orientation.Up
            )
        )

        // bottom slot
        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth()/2,
                this.pos.y + this.getHeight(),
                Orientation.Down
            )
        )
        return theSlots;
    }

    nodes(): Vector[] {
        let x = this.pos.x + this.getWidth()/2;
        let y = this.pos.y + this.getHeight()-this.floorHeight
        return [
            new Vector(Math.floor(x), Math.floor(y)) //-16)
        ];
    }
  
    reshape(cursor) {
        this.alignToSlot(cursor);
    }
}