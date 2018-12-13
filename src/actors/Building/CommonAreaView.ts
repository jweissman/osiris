import { Building } from "./Building";
import { Color, Vector } from "excalibur";
import { AccessTunnelView } from "./AccessTunnelView";
import { Orientation, flip } from "../../values/Orientation";
import { AccessTunnel, Structure } from "../../models/Structure";
import { range, closest, flatSingle } from "../../Util";
import { Slot } from "../../values/Slot";

export class CommonAreaView extends Building {
    floorHeight: number = 5
    edgeWidth: number = 2
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

    reshape(cursor) {
        this.alignToSlot(cursor);
    }

    protected validConnectingStructures(): (typeof Structure)[] {
        return [ AccessTunnel ];
    }
}