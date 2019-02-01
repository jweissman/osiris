import { Color } from 'excalibur';
import { range, mixColors } from '../../Util';
import { PlanetBackground } from './PlanetBackground';
export class MountainLayers extends PlanetBackground {
    layers: {
        baseY: number;
        deltas: number[];
    }[] = [];
    skyColor: Color = Color.Blue.clone();
    static layerHeight: number = 32;
    static layerCount = 1;
    peakCount = 2760;
    get peakWidth() {
        return Math.floor(this.getWidth() / this.peakCount);
    }
    onInitialize() {
        let c = MountainLayers.layerCount
        for (let layerIndex of range(c)) {
            this.layers.unshift({
                baseY: (layerIndex + 1) * (-MountainLayers.layerHeight+4),
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
        let h = MountainLayers.layerHeight
        ctx.lineTo(ox + (this.peakCount * this.peakWidth), oy + h) //this.layerHeight);
        ctx.lineTo(ox, oy + h) //this.layerHeight);
        ctx.closePath();
        c.a = 1;
        ctx.fillStyle = c.toRGBA();
        ctx.fill();
    }
    private genPeaks(n) {
        let h = MountainLayers.layerHeight
        let dMax = 1 * (h / 2);
        let deltas = [];
        let randomDelta = () => (Math.random() * (dMax)) - (dMax / 2);
        let last = 0;
        let maxDiff = (h/3);
        for (let times in range(this.peakCount)) {
            let curr = randomDelta();
            let pick = Math.max(last - maxDiff, Math.min(curr, last + maxDiff));
            deltas.push(pick);
            last = pick;
        }
        return deltas;
    }
}
