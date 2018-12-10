import { CommonAreaView } from ".";
import { Vector } from "excalibur";

export class LivingQuartersView extends CommonAreaView {
    edgeWidth: number = 2

    // constrainCursor(cursor: Vector) {
    //     // okay, we want the nearest slots of the nearest building
    //     // let closestCommon = this.planet.closestBuildingByType(cursor, CommonArea)
    //     // if (closestCommon) {
    //     //     if (closestCommon.slots(this.getWidth()).length > 0) {
    //     //         let slots: Slot[] = closestCommon.slots(this.getWidth())
    //     //         let closestSlot: Slot = closest(cursor, slots, s => s.pos)
    //     //         // this.facing = -closestSlot.facing //.facing * 90
    //     //         // this.aa
    //     //         // this.getGeometry()
    //     //         return closestSlot.pos
    //     //     }
    //     // }
    //     // return cursor
    // }

    // draw(ctx: CanvasRenderingContext2D, delta: number) {
    //     super.draw(ctx, delta)
    //     // ctx.save()
    //     // let { x, y } = this.pos
    //     // if (this.facing === Orientation.Up) { y -= this.getHeight() }
    //     // if (this.facing === Orientation.Left) { x -= this.getWidth() }
    //     // ctx.translate(x,y) //this.pos.x, this.pos.y)

    //     // let theta = (this.facing * (Math.PI/2)) - (Math.PI/2)
    //     // this.rotation = theta
    //     // ctx.rotate(theta) 

    //     // let edge = this.edgeColor();
    //     // ctx.fillStyle = edge.toRGBA();
    //     // ctx.fillRect(
    //     //     0,0,
    //     //     // -this.getWidth()/2, -this.getHeight()/2,
    //     //     this.getWidth(), this.getHeight()
    //     // )

    //     // let main = this.mainColor();
    //     // ctx.fillStyle = main.toRGBA();
    //     // ctx.fillRect(
    //     //     this.edgeWidth, // - this.getWidth()/2,
    //     //     this.edgeWidth, // - this.getHeight()/2,
    //     //     this.getWidth() - this.edgeWidth*2,
    //     //     this.getHeight() - this.edgeWidth*2
    //     // )

    //     // ctx.restore()
    // }
}