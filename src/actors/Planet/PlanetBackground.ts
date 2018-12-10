import { Actor, Color } from 'excalibur';
import { range } from '../../Util';

class PlanetBackground extends Actor {
    constructor(y: number, width: number, color: Color) {
        super(0, y, width, 500, color); // y + size, size, layerSize, color.darken(0.2))
    }
}

export class Mountains extends PlanetBackground {
    peaks: {
        x: number;
        height: number;
    }[] = [];
    onInitialize() {
        let peakCount = 30; // Math.floor(this.getWidth() / 2000)
        let peakHeight = 1000;
        // let mtnWidth = 180
        // figure out mountain peaks?
        // let yBase = this.pos.y //-1000 //this.pos.y //this.getHeight()
        let xOff = this.getWidth() / 2;
        let peakDistance = this.getWidth() / peakCount;
        for (let times of range(10)) {
            let heightRange = 100*times;
            let drift = 3 * times * (peakDistance / 2);
            for (let i of range(peakCount)) { //} / 2)) {
                this.peaks.push({
                    x: -xOff + i * peakDistance + ((Math.random() * drift) - (drift / 2)),
                    height: Math.max(10, peakHeight + ((Math.random() * heightRange)-(heightRange/2))) //(Util.randomIntInRange(-160,160))
                    // y = yBase - peakHeight
                });
            }
        }
        console.log({ peaks: this.peaks });
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        let baseColor = this.color.desaturate(0.25); //.toRGB
        // baseColor.a = 0.6
        let brightColor = this.color.saturate(0.2).lighten(0.5)
        // super.draw(ctx, delta)
        ctx.fillStyle = baseColor.toRGBA() // this.color.desaturate(0.45).lighten(0.15).toRGBA();
        //let peakHeight = 250
        // let mtnWidth = 180
        let yBase = this.pos.y-3; //-1000 //this.pos.y //this.getHeight()
        // let xOff = this.getWidth() / 2
        this.peaks.forEach(peak => {
            let y0 = yBase - peak.height;
            let mtnWidth = peak.height * 3.4;
            ctx.beginPath();
            ctx.moveTo(peak.x, y0);
            ctx.lineTo(peak.x - mtnWidth, yBase);
            ctx.lineTo(peak.x + mtnWidth, yBase);

            ctx.fillStyle = baseColor.toRGBA() // this.color.desaturate(0.45).lighten(0.15).toRGBA();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(peak.x, y0);
            ctx.lineTo(peak.x + 3*(mtnWidth/4), yBase);
            ctx.lineTo(peak.x + mtnWidth, yBase);
            ctx.fillStyle = brightColor.toRGBA() // this.color.desaturate(0.45).lighten(0.15).toRGBA();
            ctx.fill();

        });
    }
}