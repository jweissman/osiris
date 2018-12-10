import { Building } from "./Building";
import { Vector } from "excalibur";
import { Orientation } from "../../values/Orientation";
import { MainTunnel, CommonArea, LivingQuarters } from "../../models/Structure";
import { closest } from "../../Util";
import { Slot } from "../../values/Slot";
import { SSL_OP_TLS_BLOCK_PADDING_BUG } from "constants";

export class AccessTunnelView extends Building {
    edgeWidth: number = 1

    pickingOrigin: boolean = true
    facing: Orientation = Orientation.Left
    // multipleClicks: boolean = true

    // slots() {

    // } 

    //aabb() {
    //   return this.facing === Orientation.Right ? super.aabb() : {
    //       x: this.pos.x - this.getWidth(),
    //       y: this.pos.y,
    //       width: this.getWidth(),
    //       height: this.getHeight()
    //   }
    //}
    
    handleClick(cursor: Vector) {
        if (this.pickingOrigin) {
            // this.pos = this.constrainCursor(cursor)
            this.pickingOrigin = false;
            this.reshape(this.constrainCursor(cursor))
            return false;
        }
        return true;
    }

    // picking a depth for a tunnel first?
    constrainCursor(cursor: Vector): Vector {
        let newCursor = cursor.clone();
        // always attached to closest tunnel
        if (this.pickingOrigin) {
            // let tunnel: Building = this.tunnelTo(cursor) 
            // let tunnel = this.nearestTunnel(cursor)

            //if (cursor.x > tunnel.x + tunnel.getWidth() / 2) {
            //    newCursor.x = tunnel.x + tunnel.getWidth() // + 1
            //} else {
            //    newCursor.x = tunnel.x - this.getWidth() // - 1
            //}

        } else {
            newCursor.y = this.pos.y
        }

        // cursor.x = this.x //.getTop()
        // cursor.x = Math.max(this.x + 10, cursor.x)
        return newCursor;
    }

    originX: number = 0
    // expand
    reshape(cursor: Vector) {

        if (this.pickingOrigin) {
            let slot: Slot = this.findSlot(cursor);

            // let tunnel = this.nearestTunnel(cursor)

            let { facing, pos } = slot;
            this.facing = facing
            this.pos = pos
            if (facing === Orientation.Left) {
                this.originX = slot.pos.x
                this.pos.x = slot.pos.x - this.getWidth()
            }

            //if (slot.facing === Orientation.Right) { // cursor.x > tunnel.x + tunnel.getWidth() / 2) {
            //    this.pos.x = slot.pos.x // + Tunnel.width
            //    this.facing = Orientation.Right
            //} else { // assume left?
            //    this.pos.x = slot.pos.x //tunnel.x // - this.getWidth() // - 1
            //    this.facing = Orientation.Left
            //}

            //this.pos.y = slot.pos // cursor.y
            //    Math.min(
            //        Math.max(cursor.y, slot.y + 10),
            //        tunnel.y + tunnel.getHeight() - this.getHeight() - 10
            //    )
        } else {
            if (this.facing === Orientation.Left) {
                this.setWidth(Math.abs(this.originX - cursor.x)) //planet.getTop())
                this.pos.x = this.originX - this.getWidth()
            } else {
                this.setWidth(Math.abs(this.pos.x - cursor.x)) //planet.getTop())
            }
        }
    }

    // draw(ctx: CanvasRenderingContext2D, delta: number) {
    //     super.draw(ctx,delta)
    //     let edgeWidth = 1
    //     let edgeColor = this.edgeColor().toRGBA(); //color.lighten(0.5)
    //     let mainColor = this.mainColor().toRGBA(); //color.darken(0.2)

    //     ctx.fillStyle = this.color.toRGBA() // this.color.desaturate(0.45).lighten(0.15).toRGBA();
    //     ctx.save()
    //     ctx.translate(this.pos.x, this.pos.y)

    //     let theta = this.facing * (Math.PI/2)
    //     ctx.rotate(theta) 

    //     ctx.fillStyle = edgeColor;
    //     ctx.fillRect(-this.getWidth(), 0, this.getWidth(), this.getHeight())
    //     ctx.fillStyle = mainColor;
    //     ctx.fillRect(-this.getWidth(), edgeWidth, this.getWidth(), this.getHeight() - edgeWidth * 2)

    //     ctx.restore()
    // }

    protected nearestTunnel(pos: Vector) {
        return this.planet.closestBuildingByType(pos, MainTunnel)
    }

    protected nearestCommonArea(pos: Vector) {
        return this.planet.closestBuildingByType(pos, CommonArea)
    }

    protected nearestLivingQuarters(pos: Vector) {
        return this.planet.closestBuildingByType(pos, LivingQuarters)
    }

    protected findSlot(pos: Vector) {
        let slotList: Slot[] = []
        let tunnel = this.nearestTunnel(pos);
        let common = this.nearestCommonArea(pos);
        let living = this.nearestLivingQuarters(pos);
        if (tunnel) { slotList.push(...tunnel.slots()); } //.. = slotList.concat(tunnel.slots()); } // [...slotList, ...tunnel.slots()]; } // .push(tunnel.slots())}
        if (common) { slotList.push(...common.slots()); } // = [...slotList, ...common.slots()]; } // .push(tunnel.slots())}
        if (living) { slotList.push(...living.slots()); }
        // if (!slotList.length) { throw new Error("no slots"); return null; }
        return closest(
            pos,
            slotList,
            // [ ...this.nearestTunnel(pos).slots(), ...this.nearestCommonArea(pos).slots() ],
            (slot: Slot) => slot.pos // new Vector(slot.x, slot.y)
        )
    }
}