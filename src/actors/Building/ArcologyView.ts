import { DomeView } from ".";
import { Color } from "excalibur";

export class ArcologyView extends DomeView {
    draw(ctx: CanvasRenderingContext2D, delta: number) {

        this.drawShape(ctx, this.pos.x, this.pos.y)

    }

    drawShape(ctx, xoff, yoff) {
        let h = this.getHeight()
        let w = this.getWidth()
        ctx.beginPath();
        ctx.moveTo(0 + xoff, h + yoff);
        // ctx.bezierCurveTo(-3 + xoff, 514 + yoff, 1 + xoff, 406 + yoff, 1 + xoff, 391 + yoff);
        ctx.bezierCurveTo(1 + xoff, h - 150 + yoff, 121 + xoff, 70 + yoff, w - 80 + xoff, 8 + yoff);
        ctx.bezierCurveTo(w - 40 + xoff, 2 + yoff, w - 5 + xoff, 11 + yoff, w - 10 + xoff, 25 + yoff);
        ctx.bezierCurveTo(w - 5 + xoff, 10 + yoff, w + xoff, (h-10) + yoff, w + xoff, h + yoff);
        ctx.lineTo(0 + xoff, h + yoff);
        ctx.fillStyle = this.mainColor().toRGBA()
        ctx.fill();
    }
}