import { Actor, Color, Vector } from "excalibur";
import { Building } from "./Building";
import { Planet } from "./planet";

export class MissionControlView extends Building {

    constrainCursor(cursor: Vector): Vector {
        // cursor.x = this.x //.getTop()
        cursor.y = this.planet.getTop(); //Math.max(planet.getTop() + 100, cursor.y)
        return cursor;
    }

    reshape(cursor: Vector) {
        this.pos = cursor // x = cursor.x
        this.pos.y -= this.getHeight()
    }


    draw(ctx: CanvasRenderingContext2D) {
        let color = this.mainColor(); //Color.White //.darken(0.3)

        ctx.fillStyle = color.toRGBA()
        // y is going to be surface height
        ctx.fillRect(this.x, this.y, this.getWidth(), this.getHeight())

        // could draw a little flag :)
        let flagpoleHeight = 18
        let flagX = this.x + 3*(this.getWidth()/4)
        let flagY = this.y - flagpoleHeight
        ctx.fillRect(flagX, flagY, 2, flagpoleHeight)
        ctx.fillRect(flagX, flagY, 10, 5)

        // shadow?
        //ctx.fillStyle = this.color.darken(0.2).toRGBA()
        //ctx.fillRect(this.x, this.y, this.getHeight())
    }

    colorBase() { return Color.White; }
}