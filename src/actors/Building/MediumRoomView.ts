import { CommonAreaView } from ".";
import { DeviceSize, getVisibleDeviceSize } from "../../values/DeviceSize";
import { DevicePlace } from "./Building";
import { Vector } from "excalibur";

export class MediumRoomView extends CommonAreaView {
    devicePlaceSize = DeviceSize.Medium
    devicePlaceCount = 2
    // devicePlaces() {
    //     let w = this.getWidth()/2
    //     let x = this.pos.x + w;
    //     let y = this.pos.y + this.getHeight() - this.floorHeight - getVisibleDeviceSize(DeviceSize.Medium)/3
    //     let ds = [
    //         new Vector(x - w/3, y),
    //         new Vector(x + w/3, y),
    //     ]

    //     return ds.map(d => new DevicePlace(d, DeviceSize.Medium))
    // }
}