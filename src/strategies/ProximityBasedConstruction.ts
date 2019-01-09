import { ConstructionStrategy } from "./ConstructionStrategy";
import { Device } from "../actors/Device";

export class ProxmityBasedConstruction extends ConstructionStrategy {


    async apply() {
        // find cost items
        if (this.unbuiltDevice && this.unbuiltDevice.building) {
            await this.constructDevice(this.unbuiltDevice)
        }
        await this.pause()
    }

    private async constructDevice(device: Device) {
        device.inUse = true
        let resources = device.machine.cost
        await this.gatherIngredients(resources)
        await this.visitDevice(device)
        await device.assemble(this.pawn)
        device.inUse = false
    }
}