import { Vector } from "excalibur";
import { Building } from "./Building";
import { MissionControl } from "../../models/Structure";
import { range } from "../../Util";
import { Slot } from "../../values/Slot";
import { Orientation, flip } from "../../values/Orientation";

export class TunnelView extends Building {
    pickingOrigin: boolean = true

    slots() {
        let slotSize = 40
        let slotCount = Math.floor((this.getHeight()-60) / slotSize)
        let theSlots: Slot[] = []

        // one at the top pointing up??
        theSlots.push({
            pos: new Vector(this.pos.x + this.getWidth()/2, this.pos.y),
            facing: Orientation.Up
        })

        for (let i of range(slotCount)) {
            theSlots.push({
                pos: new Vector(
                    this.pos.x,
                    100 + this.pos.y + i * slotSize
                ),
                facing: Orientation.Left,
                // parent: this
            })

            theSlots.push({
                pos: new Vector(
                    this.pos.x + this.getWidth(),
                    100 + this.pos.y+ i * slotSize 
                ),
                facing: Orientation.Right,
                // parent: this
            })
        }
        // console.log({theSlots})
        return theSlots;
    } 

    validConnectingStructures() { return [ MissionControl ] }

    handleClick(cursor: Vector) {
        // pick nearest mission ctrl as origin
        if (this.pickingOrigin) {
            //let theSlot = this.findSlot(cursor);
            ////let lastCtrl: Building = this.planet.closestBuildingByType(
            ////    this.pos, MissionControl // 'Mission Control'
            ////)
            //if (theSlot) {
            //    this.pos = theSlot.pos
            //    // let missionControlWidth = new MissionControl().width
            //    // this.pos.x = slot.pos.x + missionControlWidth / 2 - this.getWidth() / 2 //[0].x
            //    let matchingSlot = this.slots().find(s => s.facing == flip(theSlot.facing))
            //    if (matchingSlot) {
            //        let offset = this.pos.sub(matchingSlot.pos)
            //        this.pos.addEqual(offset)

                    this.pickingOrigin = false;
                    return false;
            //    }
            //}
        }
        return true;
    }

    // picking a depth for a tunnel first?
    constrainCursor(cursor: Vector): Vector {
        if (this.pickingOrigin) {

            this.alignToSlot(cursor)
            //let theSlot = this.findSlot(cursor);
            //if (theSlot) {
            //    this.pos = theSlot.pos
            //}
            // snap to nearest mission ctrl?
            //let lastCtrl: Building = this.planet.closestBuildingByType(
            //    cursor, MissionControl //'Mission Control'
            //)
            //this.pos.x = lastCtrl.x + lastCtrl.getWidth() / 2 - this.getWidth() / 2 //[0].x

        } else {
            // we're determining depth of tunnel
            cursor.y = Math.max(this.planet.getTop() + 100, cursor.y)
        }
        return cursor;
    }

    // expand
    reshape(cursor: Vector) {
        this.pos.y = this.planet.getTop() + 2
        if (!this.pickingOrigin) {
          this.setHeight(cursor.y - this.planet.getTop())
        }
    }

    // draw(ctx: CanvasRenderingContext2D) {
    //     let depth = this.getHeight()
    //     let width = this.getWidth()
    //     let edgeWidth = 4

    //     let edgeColor = this.edgeColor()
    //     let mainColor = this.mainColor()

    //     ctx.fillStyle = edgeColor.toRGBA()
    //     ctx.fillRect(this.x, this.y, width, depth)

    //     if (this.pickingOrigin) { mainColor.a = 0.5 }
    //     ctx.fillStyle = mainColor.toRGBA()
    //     ctx.fillRect(this.x + edgeWidth, this.y, width - edgeWidth*2, depth)
    // }

    colorBase() { return this.color.darken(0.2); }
}