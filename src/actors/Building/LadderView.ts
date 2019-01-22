import { TunnelView } from ".";
import { Orientation } from "../../values/Orientation";
import { Slot } from "../../values/Slot";
import { Vector } from "excalibur";
import { Scale } from "../../values/Scale";

export class LadderView extends TunnelView {
    originSlot: Slot = null
    slotSize: number = Scale.major.third
    constrainCursor(cursor: Vector): Vector {
       if (this.pickingOrigin) {

       } else {
           cursor.x = this.pos.x
       }
       return cursor;
    }

    // minHeight: number = slt
    reshape(cursor: Vector) {
        if (this.pickingOrigin) { 
            let theSlot = this.alignToSlot(cursor)
            if (theSlot) {
                this.facing = theSlot.facing

                if (theSlot) {
                    this.originSlot = theSlot
                }
            }
        } else {
            if (this.facing === Orientation.Up) {
                let maxHeight = this.originSlot.pos.y - this.planet.getTop() - 25

                let h = Math.min(maxHeight, Math.max(this.slotSize, this.originSlot.pos.y - cursor.y))
                this.setHeight((h/this.slotSize)*this.slotSize + 15)
                this.pos.y = this.originSlot.pos.y - this.getHeight()
            } else {
                let h = Math.max(this.slotSize, cursor.y - this.originSlot.pos.y)
                this.setHeight((h/this.slotSize)*this.slotSize + 15) // - cursor.y))
            }
        }
    }
}