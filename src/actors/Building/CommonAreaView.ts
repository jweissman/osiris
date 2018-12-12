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
        let leftSlot: Slot = {
            pos: new Vector(this.pos.x, this.pos.y + slotY),
            facing: Orientation.Left,
        }
        theSlots.push(leftSlot)

        let rightSlot: Slot = {
            pos: new Vector(this.pos.x + this.getWidth(), this.pos.y + slotY),
            facing: Orientation.Right,
        }
        theSlots.push(rightSlot)
        return theSlots;
    }

    reshape(cursor) {
        //let tunnel = this.planet.closestBuildingByType(
        //    cursor, AccessTunnel //'Access Tunnel'
        //)

        //// try to pick the cap??
        this.alignToSlot(cursor);
        //if (tunnel) {
            //let theSlot = this.findSlot(cursor) // closest(cursor, tunnel.slots(), (s) => s.pos)
            //if (theSlot) {
            //    this.pos = theSlot.pos
            //    // position us so our slot lines up?
            //    let matchingSlot = this.slots().find(s => s.facing == flip(theSlot.facing))
            //    let offset = this.pos.sub(matchingSlot.pos)
            //    this.pos.addEqual(offset)
            //}
        // }
    }

    protected validConnectingStructures(): (typeof Structure)[] {
        return [ AccessTunnel ];
    }

    

    //protected findSlot(pos: Vector): Slot {
    //    let buildings = this.validConnectingStructures().map(structure =>
    //        this.planet.closestBuildingByType(pos, structure)
    //    )
    //    let slotList = flatSingle(buildings.map(building => building.slots())) //.flat(1)
    //    return closest(pos, slotList, (slot) => slot.pos)
    //}
}