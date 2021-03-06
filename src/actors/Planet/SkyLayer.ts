import { Actor, Color } from 'excalibur';
import { mixColors } from '../../Util';
import { Mountains } from "./Mountains";
import { MountainLayers } from "./MountainLayers";
export class SkyLayer extends Actor {
    mountains: Mountains;
    mountainLayers: MountainLayers;
    backMountainLayers: MountainLayers;
    constructor(y: number, width: number, lo: Color, hi: Color) {
        super(0, y, width, 1500); //width,1500) //height)
        let mid = mixColors(lo, hi);
        let buffer = MountainLayers.layerHeight / 4
        let ht = (MountainLayers.layerHeight - buffer) * MountainLayers.layerCount
        this.backMountainLayers = new MountainLayers(-ht, width, mid);
        this.backMountainLayers.skyColor = hi;
        this.add(this.backMountainLayers);
        this.mountains = new Mountains(0, width, mid);
        this.add(this.mountains);
        this.mountainLayers = new MountainLayers(0, this.getWidth(), lo);
        this.mountainLayers.skyColor = mid;
        this.add(this.mountainLayers);
    }
    setLoHi(lo: Color, hi: Color) {
        let mid = mixColors(lo, hi);
        this.backMountainLayers.color = mid;
        this.backMountainLayers.skyColor = hi;
        this.mountains.color = mid;
        this.mountainLayers.color = lo;
        this.mountainLayers.skyColor = mid;
    }
}
