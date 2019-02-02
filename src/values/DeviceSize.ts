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
        case DeviceSize.Tiny:   sz = minor.first; break //Game.mansheight / 4; break //minor.third; break;
        case DeviceSize.Small:  sz = major.first; break // Game.mansheight    ; break //major.third; break;
        case DeviceSize.Medium: sz = major.second; break //1.5*Game.mansheight  ; break //major.third; break;//major.fourth; break;
        case DeviceSize.Large:  sz = major.third; break
        case DeviceSize.Huge:   sz = major.eighth; break
    }
    return sz;
}