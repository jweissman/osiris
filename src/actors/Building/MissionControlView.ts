import { Actor, Color, Vector } from "excalibur";
import { Building } from "./Building";
import { Planet } from "../Planet/Planet";
import { Citizen } from "../Citizen";

export class MissionControlView extends Building {

    constrainCursor(cursor: Vector): Vector {
        // cursor.x = this.x //.getTop()
        cursor.y = this.planet.getTop(); //Math.max(planet.getTop() + 100, cursor.y)
        return cursor;
    }

    reshape(cursor: Vector) {
        this.pos = cursor // x = cursor.x
        this.pos.y -= this.getHeight() - 2 // + 1
    }

    interact(citizen: Citizen) {
        citizen.drop()
        return true
    }


    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)

        let color = this.mainColor(); //Color.White //.darken(0.3)

        ctx.fillStyle = color.toRGBA()
        // y is going to be surface height
        ctx.fillRect(this.pos.x, this.pos.y, this.getWidth(), this.getHeight())

        // could draw a little flag :)
        let flagpoleHeight = 18
        let flagX = this.pos.x + 3*(this.getWidth()/4)
        let flagY = this.pos.y - flagpoleHeight
        ctx.fillRect(flagX, flagY, 2, flagpoleHeight)
        ctx.fillRect(flagX, flagY, 10, 5)

        // shadow?
        //ctx.fillStyle = this.color.darken(0.2).toRGBA()
        //ctx.fillRect(this.x, this.y, this.getHeight())
    }

    colorBase() { return Color.White; }
}