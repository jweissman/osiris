import { Color } from 'excalibur';
import { range, mixColors } from '../../Util';
import { PlanetBackground } from './PlanetBackground';
export class MountainLayers extends PlanetBackground {
    layers: {
        baseY: number;
        deltas: number[];
    }[] = [];
    skyColor: Color = Color.Blue.clone();
    layerHeight: number = 70;
    layerCount = 1;
    peakCount = 300;
    get peakWidth() {
        return Math.floor(this.getWidth() / this.peakCount);
    }
    onInitialize() {
        for (let layerIndex of range(this.layerCount)) {
            this.layers.unshift({
                baseY: (layerIndex + 1) * -this.layerHeight,
                deltas: this.genPeaks(layerIndex)
            });
        }
    }
    draw(ctx, delta) {
        let wc = this.color.clone();
        let sc = this.skyColor.clone().lighten(0.1);
        let ndx = 1;
        let ls = this.layers.slice();
        for (let layer of ls) {
            let c = mixColors(wc, sc, (ndx / (this.layers.length)));
            this.drawLayer(ctx, layer, c);
            ndx += 1;
        }
    }
    private drawLayer(ctx, layer, color) {
        let ox = -this.getWidth() / 2, oy = this.pos.y + layer.baseY;
        let c = color.clone();
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        let ndx = 0;
        for (let delta of layer.deltas) {
            ctx.lineTo(ox + (ndx * this.peakWidth), oy + delta);
            ndx += 1;
        }
        ctx.lineTo(ox + (this.peakCount * this.peakWidth), oy);
        ctx.lineTo(ox + (this.peakCount * this.peakWidth), oy + this.layerHeight);
        ctx.lineTo(ox, oy + this.layerHeight);
        ctx.closePath();
        c.a = 1;
        ctx.fillStyle = c.toRGBA();
        ctx.fill();
    }
    private genPeaks(n) {
        let dMax = 2 * (this.layerHeight / 3);
        let deltas = [];
        let randomDelta = () => (Math.random() * (dMax)) - (dMax / 2);
        let last = 0;
        let maxDiff = 15;
        for (let times in range(this.peakCount)) {
            let curr = randomDelta();
            let pick = Math.max(last - maxDiff, Math.min(curr, last + maxDiff));
            deltas.push(pick);
            last = pick;
        }
        return deltas;
    }
}
