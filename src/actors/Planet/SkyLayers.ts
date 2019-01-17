import { Actor, Color } from 'excalibur';
import { range, mixColors } from '../../Util';
import { SkyLayer } from "./SkyLayer";
export class SkyLayers extends Actor {
    layers: SkyLayer[] = [];
    constructor(y: number, width: number, private lo: Color, hi: Color, private layerCount: number = 5) {
        super(0, y, width, 1500);
        for (let i of range(layerCount)) {
            let c0 = mixColors(lo, hi, (i / (layerCount + 1)));
            let c1 = mixColors(lo, hi, ((i + 1) / (layerCount + 1)));
            let layer = new SkyLayer(-200 * (layerCount - i - 1), this.getWidth(), c1, c0);
            this.layers.push(layer);
            this.add(layer);
        }
    }
    setHi(hi: Color) {
        let lo = this.lo;
        for (let i of range(this.layerCount)) {
            let c0 = mixColors(lo, hi, (i / (this.layerCount + 1)));
            let c1 = mixColors(lo, hi, ((i + 1) / (this.layerCount + 1)));
            this.layers[i].setLoHi(c1, c0);
            // let layer = new SkyLayer(-100 * (layerCount-i-1), this.getWidth(), c1, c0)
        }
    }
}
