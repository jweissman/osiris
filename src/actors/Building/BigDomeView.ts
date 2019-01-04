import { DeviceSize } from "../../values/DeviceSize";
import { DevicePlace } from "./Building";
import { Vector } from "excalibur";
import { DomeView } from ".";

export class BigDomeView extends DomeView {

    devicePlaces() {
        let w = this.getWidth()/2
        let x = this.pos.x + w;
        let y = this.pos.y + this.getHeight() - 20
        let ds = [
            new Vector(x - w/3, y),
            new Vector(x + w/3, y),
        ]

        return ds.map(d => new DevicePlace(d, DeviceSize.Large))
    }
}