import { Scale } from "./Scale";
let { major, minor } = Scale

export enum DeviceSize {
    Small,
    Medium,
    Large,
    Huge
}


export function getVisibleDeviceSize(size: DeviceSize): number {
    let sz = 10;
    switch (size) {
        case DeviceSize.Small: sz = major.third; break;
        case DeviceSize.Medium: sz = major.fourth; break;
        case DeviceSize.Large: sz = major.eighth + major.second; break;
        case DeviceSize.Huge: sz = 6 * major.eighth; break;
    }
    return sz;
}