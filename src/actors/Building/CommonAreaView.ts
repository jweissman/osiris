import { Building } from "./Building";
import { Orientation } from "../../values/Orientation";
import { AccessTunnel, Structure, CommonArea, Laboratory, Mine, Kitchen, Study, CloneMatrix } from "../../models/Structure";
import { Slot } from "../../values/Slot";
import { Vector } from "excalibur";

export class CommonAreaView extends Building {
    floorHeight: number = 8
    edgeWidth: number = 1
    showLabel = true
    // maybe you can set height AND width of common area view??

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

    protected validConnectingStructures(): (typeof Structure)[] {
        return [
            AccessTunnel,
            CommonArea,
            Laboratory,
            Kitchen,
            Study,
            CloneMatrix,
        ];
    }
}