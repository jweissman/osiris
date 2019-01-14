import { CommonAreaView } from ".";
import { DeviceSize } from "../../values/DeviceSize";

export class MediumRoomThreeView extends CommonAreaView {
    devicePlaceSize = DeviceSize.Medium
    devicePlaceCount = 3

    poly() { return this.angledRoofPoly() }

    // devicePlaces() {
    //     let w = this.getWidth()/2
    //     let x = this.pos.x + w;
    //     let y = this.pos.y + this.getHeight() - getVisibleDeviceSize(DeviceSize.Medium)/3
    //     let ds = [
    //         new Vector(x - w/3, y),
    //         new Vector(x, y),
    //         new Vector(x + w/3, y),
    //     ]

    //     return ds.map(d => new DevicePlace(d, DeviceSize.Medium))
    // }
}