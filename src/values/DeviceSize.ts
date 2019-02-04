import { Scale } from "./Scale";
import { Game } from "../Game";
let { major, minor } = Scale

export enum DeviceSize {
    Tiny,
    Small,
    Medium,
    Large,
    Huge,
}


export function getVisibleDeviceSize(size: DeviceSize): number {
    let unit = Game.mansheight
    let sz = 10;
    switch (size) {
        case DeviceSize.Tiny:   sz = minor.second; break
        case DeviceSize.Small:  sz = minor.sixth; break
        case DeviceSize.Medium: sz = major.first;  break
        case DeviceSize.Large:  sz = major.second; break
        case DeviceSize.Huge:   sz = major.eighth; break
    }
    return sz;
}