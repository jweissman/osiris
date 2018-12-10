import { Building } from "./Building";
import { Color, Vector } from "excalibur";
import { AccessTunnelView } from "./AccessTunnelView";
import { Orientation } from "../../values/Orientation";
import { AccessTunnel } from "../../models/Structure";
import { range } from "../../Util";
import { Slot } from "../../values/Slot";

export class CommonAreaView extends Building {
    // maybe you can set height AND width of common area view??

    slots() {
        let theSlots = []
        let slotY = this.getHeight() - 20 //3*(this.getHeight()/4)
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

    constrainCursor(cursor) {
        let newCursor = cursor.clone()
        //let closest = this.planet.closestBuildingByType(
        //    cursor, AccessTunnel //'Access Tunnel'
        //)

        //// try to pick the cap??
        //if (closest) {
        //    if ((<AccessTunnelView>closest).facing === Orientation.Left) {
        //        newCursor.x = closest.x - closest.getWidth() - this.getWidth()
        //    } else {
        //        newCursor.x = closest.x + closest.getWidth()
        //    }
        //    newCursor.y = closest.y - this.getHeight() + closest.getHeight() + 5 // closest.edgeSize // / 2
        //}

        return newCursor
    }

    reshape(cursor) {
        let closest = this.planet.closestBuildingByType(
            cursor, AccessTunnel //'Access Tunnel'
        )

        // try to pick the cap??
        if (closest) {
            if ((<AccessTunnelView>closest).facing === Orientation.Left) {
                this.pos.x = closest.x - closest.getWidth() // - this.getWidth()
            } else {
                this.pos.x = closest.x + closest.getWidth()
            }
            this.pos.y = closest.y - this.getHeight() + closest.getHeight() + 5 // closest.edgeSize // / 2
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        let edgeWidth = 4;

        // console.log("draw common area", { pos: this.pos, size: [ this.getWidth(), this.getHeight() ]})

        let edge = this.edgeColor();
        ctx.fillStyle = edge.toRGBA();
        ctx.fillRect(this.pos.x, this.pos.y, this.getWidth(), this.getHeight())

        let main = this.mainColor();
        ctx.fillStyle = main.toRGBA();
        ctx.fillRect(
            this.pos.x + edgeWidth,
            this.pos.y + edgeWidth,
            this.getWidth() - edgeWidth * 2,
            this.getHeight() - edgeWidth * 2
        )

    }

    // colorBase() { return this.color.darken(0.8)}
}