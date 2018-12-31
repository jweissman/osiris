import { CommonAreaView } from ".";
import { DeviceSize } from "../../values/DeviceSize";
import { DevicePlace } from "./Building";
import { Vector } from "excalibur";

export class MediumRoomView extends CommonAreaView {
    // device nodes are medium sized...
    devicePlaces() {
        let w = this.getWidth()/2
        let x = this.pos.x + w;
        let y = this.pos.y + this.getHeight() - this.floorHeight - 20 
        let ds = [
            new Vector(x - w/3, y),
            // new Vector(x, y),
            new Vector(x + w/3, y),
        ]

        return ds.map(d => new DevicePlace(d, DeviceSize.Medium))
    }
}