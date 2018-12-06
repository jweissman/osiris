import { Color, Vector } from "excalibur";
import { Building } from "./Building";

// we're constrained to the surface, so...
export class DomeView extends Building {

    constrainCursor(cursor: Vector): Vector {
        // cursor.x = this.x //.getTop()
        cursor.y = this.planet.getTop(); //Math.max(planet.getTop() + 100, cursor.y)
        return cursor;
    }

    reshape(cursor: Vector) {
        this.pos = cursor // x = cursor.x
    }


    draw(ctx: CanvasRenderingContext2D) {
        let color: Color = this.mainColor()

        ctx.beginPath()
        ctx.arc(
            this.x + this.getWidth()/2,
            this.y,
            this.getWidth() / 2,
            0,
            Math.PI,
            true
        )
        ctx.closePath()
        ctx.fillStyle = color.toRGBA()
        ctx.fill()
    }

    colorBase() { return Color.White; }
}