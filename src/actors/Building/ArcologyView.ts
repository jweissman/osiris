import { DomeView } from ".";
import { Color, Vector } from "excalibur";
import { DevicePlace } from "./Building";
import { DeviceSize } from "../../values/DeviceSize";

export class ArcologyView extends DomeView {

    devicePlaces() {
        let w = 3*this.getWidth()/5
        let x = this.pos.x + w;
        let y = this.pos.y + this.getHeight()/2 // - 20
        let ds = [
            new Vector(x, y-800),
            new Vector(x, y),
            new Vector(x, y+800),
        ]

        return ds.map(d => new DevicePlace(d, DeviceSize.Huge))
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        // super.draw(ctx, delta)

        this.drawShape(ctx, this.pos.x, this.pos.y)
        this.getDevices().forEach(device => device.draw(ctx, delta))

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