import { Strategy } from "./Strategy";
import { Device } from "../actors/Device";

export abstract class ConstructionStrategy extends Strategy {
    canApply(): boolean {
        return !!this.unbuiltDevice
    }

    get unbuiltDevice() {
        const isUnbuilt = (d: Device) => !d.built && !d.inUse && d.building.isActive
        return this.planet.colony.findAllDevices().find(isUnbuilt)
    }
}