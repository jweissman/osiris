import { Actor, Color } from 'excalibur';
import { range, mixColors } from '../../Util';
import { drawRect } from '../../Painting';

class PlanetBackground extends Actor {
    constructor(y: number, width: number, color: Color) {
        super(0, y, width, 1500, color)
    }
}

export class MountainLayers extends PlanetBackground {
    layers: {
        baseY: number,
        // color: Color,
        deltas: number[]
    }[] = []

    skyColor: Color = Color.Blue.clone()
    layerHeight: number = 30
    layerCount = 2
    peakCount = 1000

    get peakWidth() {
        return Math.floor(this.getWidth() / this.peakCount)
    }

    onInitialize() {
        let min = -this.layerHeight
        for (let layerIndex of range(this.layerCount)) {
            this.layers.unshift({
                baseY: -this.layerHeight - (16 * layerIndex),
                deltas: this.genPeaks(layerIndex)
            })
        }
    }

    draw(ctx, delta) {
        let wc = this.color.clone().lighten(0.1)
        let sc = this.skyColor.clone().lighten(0.1)

        let ndx = 1
        let ls = this.layers.slice()
        for (let layer of ls) {
            let c = mixColors(wc, sc, (ndx / (this.layers.length+1)))
            this.drawLayer(ctx, layer, c.lighten(0.1))
            ndx += 1
        }
    }

    private drawLayer(ctx, layer, color) {
        let ox = -this.getWidth()/2, oy = this.pos.y + layer.baseY 
        let c = color.clone()

        ctx.beginPath()
        ctx.moveTo(ox, oy)
        let ndx = 0
        for (let delta of layer.deltas) {
            ctx.lineTo(ox + (ndx * this.peakWidth), oy + delta)
            ndx += 1
        }
        ctx.lineTo(ox + (this.peakCount * this.peakWidth), oy)
        ctx.lineTo(ox + (this.peakCount * this.peakWidth), oy + this.layerHeight)
        ctx.lineTo(ox, oy+this.layerHeight)
        ctx.closePath()
        ctx.fillStyle = c.toRGBA()
        ctx.fill()
    }

    private genPeaks(n) {
        let dMax = 2*(this.layerHeight/3)
        let deltas = []
        let randomDelta = () => (Math.random() * (dMax)) - (dMax/2)
        let last = 0
        let maxDiff = 5 + (n*2)
        for (let times in range(this.peakCount)) {
            let curr = randomDelta()
            let pick = Math.max(
                   last - maxDiff,
                   Math.min(curr, last + maxDiff),
               )
            deltas.push(
               pick
            )
            last = pick
        }
        return deltas
    }
}

export class Mountains extends PlanetBackground {
    peaks: {
        x: number;
        height: number;
    }[] = [];
    onInitialize() {
        let peakCount = 18;
        let peakHeight = 3600;
        let xOff = this.getWidth() / 2;
        let peakDistance = this.getWidth() / peakCount;
        for (let times of range(2)) {
            let heightRange = 100;
            let drift = 3 * (peakDistance / 2);
            for (let i of range(peakCount)) { //} / 2)) {
                this.peaks.push({
                    x: -xOff + i * peakDistance + ((Math.random() * drift) - (drift / 2)),
                    height: Math.max(10, (Math.random() * peakHeight) + ((Math.random() * heightRange) - (heightRange / 2))) //(Util.randomIntInRange(-160,160))
                    // y = yBase - peakHeight
                });
            }
        }
        // console.log({ peaks: this.peaks });
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        let baseColor = this.color.desaturate(0.35); //.toRGB
        // baseColor.a = 0.6
        let brightColor = baseColor.lighten(0.1) // this.color.saturate(0.2).lighten(0.1)
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