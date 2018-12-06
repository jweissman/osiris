import { Building } from "./Building";
import { Color } from "excalibur";
import { AccessTunnelView } from "./AccessTunnelView";
import { Orientation } from "../values/orientation";

export class CommonAreaView extends Building {
    constrainCursor(cursor) {
        let newCursor = cursor.clone()
        let closest = this.planet.closestBuildingByType(
            cursor, 'Access Tunnel'
        )

        // try to pick the cap??
        if (closest) {
            if ((<AccessTunnelView>closest).facing === Orientation.Left) {
                newCursor.x = closest.x - closest.getWidth() - this.getWidth()
            } else {
                newCursor.x = closest.x + closest.getWidth()
            }
            newCursor.y = closest.y - this.getHeight() / 2
        }

        return newCursor
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
            this.getWidth() - edgeWidth*2,
            this.getHeight() - edgeWidth*2
        )

    }

    // colorBase() { return this.color.darken(0.8)}
}