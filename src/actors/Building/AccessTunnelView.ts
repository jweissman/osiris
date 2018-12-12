import { Building } from "./Building";
import { Vector } from "excalibur";
import { Orientation, flip } from "../../values/Orientation";
import { MainTunnel, CommonArea, LivingQuarters } from "../../models/Structure";
import { closest } from "../../Util";
import { Slot } from "../../values/Slot";
import { SSL_OP_TLS_BLOCK_PADDING_BUG } from "constants";

export class AccessTunnelView extends Building {
    edgeWidth: number = 1

    pickingOrigin: boolean = true
    facing: Orientation = Orientation.Left

    slots() {
        // left slot -- right slot
        let theSlots = [];
        let slotY = this.getHeight() / 2;


        theSlots.push({
            pos: new Vector(this.pos.x, this.pos.y + slotY),
            facing: Orientation.Left
        })

        theSlots.push({
            pos: new Vector(this.pos.x + this.getWidth(), this.pos.y + slotY),
            facing: Orientation.Right
        })

        return theSlots;
    } 

    
    handleClick(cursor: Vector) {
        if (this.pickingOrigin) {
            this.pickingOrigin = false;
            this.reshape(this.constrainCursor(cursor))
            return false;
        }
        return true;
    }

    // picking a depth for a tunnel first?
    constrainCursor(cursor: Vector): Vector {
        let newCursor = cursor.clone();
        if (this.pickingOrigin) {
        } else {
            newCursor.y = this.pos.y
        }

        return newCursor;
    }

    originX: number = 0
    // expand
    reshape(cursor: Vector) {

        if (this.pickingOrigin) {
            // let theSlot: Slot = this.findSlot(cursor);

            // let { facing, pos } = theSlot;
            // this.pos = pos
            // let matching = this.slots().find(s => s.facing == flip(facing))

            // let offset = this.pos.sub(matching.pos)
            // this.pos.addEqual(offset)

            let theSlot = this.alignToSlot(cursor)
            this.facing = theSlot.facing

            if (theSlot && this.facing === Orientation.Left) {
               this.originX = theSlot.pos.x
            }

        } else {
            if (this.facing === Orientation.Left) {
               this.setWidth(Math.abs(this.originX - cursor.x))
               this.pos.x = this.originX - this.getWidth()
            } else {
                this.setWidth(Math.abs(this.pos.x - cursor.x))
            }
        }
    }

    validConnectingStructures() {
        return [ MainTunnel, CommonArea, LivingQuarters ];
    }

}