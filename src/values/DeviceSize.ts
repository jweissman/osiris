import { Scale } from "./Scale";
let { major, minor } = Scale

export enum DeviceSize {
    Small,
    Medium,
    Large
}


export function getVisibleDeviceSize(size: DeviceSize): number {
    let sz = 10;
    switch (size) {
        case DeviceSize.Small: sz = major.third; break;
        case DeviceSize.Medium: sz = major.sixth; break;
        case DeviceSize.Large: sz = 2 * major.eighth; break;
    }
    return sz;
}