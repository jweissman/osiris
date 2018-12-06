import { Building } from "./Building";
import { Vector } from "excalibur";
import { Orientation } from "../values/orientation";

export class AccessTunnelView extends Building {
    pickingOrigin: boolean = true
    facing: Orientation = Orientation.Left
    // multipleClicks: boolean = true

    aabb() {
        return this.facing === Orientation.Right ? super.aabb() : {
            x: this.pos.x - this.getWidth(),
            y: this.pos.y,
            width: this.getWidth(),
            height: this.getHeight()
        }
    }
    
    handleClick(cursor: Vector) {
        if (this.pickingOrigin) {
            // this.pos = this.constrainCursor(cursor)
            this.pickingOrigin = false;
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
            let tunnel = this.nearestTunnel(cursor)
            if (cursor.x > tunnel.x + tunnel.getWidth() / 2) {
                newCursor.x = tunnel.x + tunnel.getWidth() + 1
            } else {
                newCursor.x = tunnel.x - this.getWidth() - 1
            }
        } else {
            newCursor.y = this.pos.y
        }

        // cursor.x = this.x //.getTop()
        // cursor.x = Math.max(this.x + 10, cursor.x)
        return newCursor;
    }

    // expand
    reshape(cursor: Vector) {

        if (this.pickingOrigin) {
            let tunnel = this.nearestTunnel(cursor)

            if (cursor.x > tunnel.x + tunnel.getWidth() / 2) {
                this.pos.x = tunnel.x + tunnel.getWidth() + 1
                this.facing = Orientation.Right
            } else {
                this.pos.x = tunnel.x - this.getWidth() - 1
                this.facing = Orientation.Left
            }

            this.pos.y = // cursor.y
                Math.min(
                    Math.max(cursor.y, tunnel.y + 10),
                    tunnel.y + tunnel.getHeight() - this.getHeight() - 10
                )
        } else {
            this.setWidth(Math.abs(this.pos.x - cursor.x)) //planet.getTop())
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        let edgeWidth = 1
        let edgeColor = this.edgeColor().toRGBA(); //color.lighten(0.5)
        let mainColor = this.mainColor().toRGBA(); //color.darken(0.2)
        if (this.facing === Orientation.Right) {
            ctx.fillStyle = edgeColor;
            ctx.fillRect(this.pos.x, this.pos.y, this.getWidth(), this.getHeight())

            ctx.fillStyle = mainColor;
            ctx.fillRect(this.pos.x, this.pos.y+edgeWidth, this.getWidth(), this.getHeight() - edgeWidth*2)
        } else {  // assume left
            ctx.fillStyle = edgeColor;
            ctx.fillRect(this.pos.x - this.getWidth(), this.pos.y, this.getWidth(), this.getHeight())
            ctx.fillStyle = mainColor;
            ctx.fillRect(this.pos.x - this.getWidth(), this.pos.y+edgeWidth, this.getWidth(), this.getHeight() - edgeWidth*2)
        }
    }

    protected nearestTunnel(pos: Vector) {
        return this.planet.closestBuildingByType(
            pos, 'Main Tunnel'
        )
    }
}