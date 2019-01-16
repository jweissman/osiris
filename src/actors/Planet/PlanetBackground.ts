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
    layerHeight: number = 200
    layerCount = 1
    peakCount = 400

    get peakWidth() {
        return Math.floor(this.getWidth() / this.peakCount)
    }

    onInitialize() {
        let min = -this.layerHeight
        for (let layerIndex of range(this.layerCount)) {
            this.layers.unshift({
                baseY: -this.layerHeight - (10 * layerIndex),
                deltas: this.genPeaks(layerIndex)
            })
        }
    }

    draw(ctx, delta) {
        let wc = this.color.clone() //.lighten(0.1)
        let sc = this.skyColor.clone() //.lighten(0.1)

        let ndx = 1
        let ls = this.layers.slice()
        for (let layer of ls) {
            let c = mixColors(wc, sc, (ndx / (this.layers.length)))
            this.drawLayer(ctx, layer, c) //.lighten(0.1))
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
        c.a = 1
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
        let peakCount = 3
        let peakHeight = 4800
        let xOff = this.getWidth() / 2
        let peakDistance = this.getWidth() / peakCount
        for (let times of range(2)) {
            let heightRange = 100
            let drift = 3 * (peakDistance / 2)
            for (let i of range(peakCount)) {
                this.peaks.push({
                    x: -xOff + i * peakDistance + ((Math.random() * drift) - (drift / 2)),
                    height: Math.max(10, 200 + (Math.random() * peakHeight) + ((Math.random() * heightRange) - (heightRange / 2))) //(Util.randomIntInRange(-160,160))
                })
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        let baseColor = this.color.desaturate(0.35)
        let brightColor = baseColor.lighten(0.1)
        ctx.fillStyle = baseColor.toRGBA()
        let yBase = this.pos.y-3
        this.peaks.forEach(peak => {
            let y0 = yBase - peak.height;
            let mtnWidth = peak.height * 3.4;
            ctx.beginPath();
            ctx.moveTo(peak.x, y0);
            ctx.lineTo(peak.x - mtnWidth, yBase);
            ctx.lineTo(peak.x + mtnWidth, yBase);

            ctx.fillStyle = baseColor.toRGBA()
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(peak.x, y0);
            ctx.lineTo(peak.x + 3*(mtnWidth/4), yBase);
            ctx.lineTo(peak.x + mtnWidth, yBase);
            ctx.fillStyle = brightColor.toRGBA()
            ctx.fill();

        });
    }
}