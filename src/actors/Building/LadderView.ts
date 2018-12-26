import { TunnelView } from ".";
import { Orientation } from "../../values/Orientation";
import { Slot } from "../../values/Slot";
import { Vector } from "excalibur";

export class LadderView extends TunnelView {
    // edgeWidth = 1
    originSlot: Slot = null
    constrainCursor(cursor: Vector): Vector {
       if (this.pickingOrigin) {

       } else {
           cursor.x = this.pos.x
       }
       return cursor;
    }

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

                let h = Math.min(maxHeight, Math.max(100, this.originSlot.pos.y - cursor.y))
                this.setHeight((h/50)*50)
                this.pos.y = this.originSlot.pos.y - this.getHeight()
            } else {
                let h = Math.max(100, cursor.y - this.originSlot.pos.y)
                this.setHeight((h/50)*50) // - cursor.y))
            }
        }
    }
}