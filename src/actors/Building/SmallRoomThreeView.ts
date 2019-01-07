import { CommonAreaView } from ".";
import { Vector } from "excalibur";
import { DevicePlace } from "./Building";
import { DeviceSize } from "../../values/DeviceSize";

export class SmallRoomThreeView extends CommonAreaView {
    devicePlaceCount = 3
    //devicePlaces() {
    //    let w = this.getWidth()/2
    //    let x = this.pos.x + w;
    //    let y = this.pos.y + this.getHeight() - this.floorHeight - 10
    //    let ds = [
    //        new Vector(x - w / 2, y),
    //        new Vector(x, y),
    //        new Vector(x + w / 2, y),
    //    ]

    //    return ds.map(d => new DevicePlace(d, DeviceSize.Small))
    //}
}