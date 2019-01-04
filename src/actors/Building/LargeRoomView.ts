import { CommonAreaView } from ".";
import { Vector } from "excalibur";
import { DevicePlace } from "./Building";
import { DeviceSize, getVisibleDeviceSize } from "../../values/DeviceSize";

export class LargeRoomView extends CommonAreaView {
    devicePlaces() {
        let w = this.getWidth()/2
        let x = this.pos.x + w;
        let y = this.pos.y + this.getHeight() - this.floorHeight - getVisibleDeviceSize(DeviceSize.Large)/2 
        let ds = [
            new Vector(x - w/3, y),
            new Vector(x + w/3, y),
        ]

        return ds.map(d => new DevicePlace(d, DeviceSize.Large))
    }
}