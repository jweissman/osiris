import { Strategy } from "./Strategy";
import { Device } from "../actors/Device";
import { containsUniq } from "../Util";

export abstract class ConstructionStrategy extends Strategy {
    canApply(): boolean {
        return !!this.unbuiltDevice
    }

    get unbuiltDevice() {
        const isUnbuilt = (d: Device) => !d.built && !d.inUse && d.building.isActive &&
          // the player can TRY to build it, we don't have to hang forever on it though
          containsUniq(this.planet.storedResources, d.machine.cost)
        return this.planet.colony.findAllDevices().find(isUnbuilt)
    }
}