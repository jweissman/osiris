import { range } from '../../Util';
import { PlanetBackground } from './PlanetBackground';
import { Game } from '../../Game';
export class Mountains extends PlanetBackground {
    peaks: {
        x: number;
        height: number;
    }[] = [];
    onInitialize() {
        let peakCount = 4
        let peakHeight = 10 * Game.mansheight
        let xOff = this.getWidth() / 2;
        let peakDistance = this.getWidth() / peakCount;
        // for (let times of range(2)) {
        let heightRange = 4 * Game.mansheight
        let drift = 3 * (peakDistance / 2);
        for (let i of range(peakCount)) {
            let h = 
                (peakHeight) + (Math.random() * heightRange)
            this.peaks.push({
                x: Math.min(this.getWidth() / 2 - h / 2, -xOff + i * peakDistance + ((Math.random() * drift))),
                height: h
            });
        }
        // }
    }
    draw(ctx: CanvasRenderingContext2D, delta: number) {
        let baseColor = this.color.desaturate(0.35);
        let brightColor = baseColor.lighten(0.1);
        ctx.fillStyle = baseColor.toRGBA();
        let yBase = this.pos.y - 3;
        this.peaks.forEach(peak => {
            let y0 = yBase - peak.height;
            let mtnWidth = peak.height * 3.4;
            ctx.beginPath();
            ctx.moveTo(peak.x, y0);
            ctx.lineTo(peak.x - mtnWidth, yBase);
            ctx.lineTo(peak.x + mtnWidth, yBase);
            ctx.fillStyle = baseColor.toRGBA();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(peak.x, y0);
            ctx.lineTo(peak.x + 3 * (mtnWidth / 4), yBase);
            ctx.lineTo(peak.x + mtnWidth, yBase);
            ctx.fillStyle = brightColor.toRGBA();
            ctx.fill();
        });
    }
}
