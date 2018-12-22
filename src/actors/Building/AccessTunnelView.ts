import { Building } from "./Building";
import { Vector } from "excalibur";
import { Orientation } from "../../values/Orientation";
import { MainTunnel, CommonArea, LivingQuarters, Laboratory, Mine, PowerPlant, Refinery } from "../../models/Structure";
import { Slot } from "../../values/Slot";

export class AccessTunnelView extends Building {
    edgeWidth: number = 0.4

    pickingOrigin: boolean = true
    facing: Orientation = Orientation.Left

    slots() {
        // left slot -- right slot
        let theSlots: Slot[] = [];
        let slotY = this.getHeight() / 2;

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
        return [
            MainTunnel,
            CommonArea,
            LivingQuarters,
            Laboratory,
            Mine,
            Refinery,
            PowerPlant
        ];
    }

}