import { ConstructionStrategy } from "./ConstructionStrategy";
import { Device } from "../actors/Device";

export class ProxmityBasedConstruction extends ConstructionStrategy {
    async apply() {
        console.log("Applying prox-based construction...")
        if (this.unbuiltDevice && this.unbuiltDevice.building) {
            console.log("Okay, let's build it!", { device: this.unbuiltDevice.machine })
            await this.constructDevice(this.unbuiltDevice)
        }
        await this.pause()
    }

    private async constructDevice(device: Device) {
        device.inUse = true
        let resources = device.machine.cost
        if (await this.gatherIngredients(resources)) {
            await this.visitDevice(device)
            await device.assemble(this.pawn)
        } else {
            // await this.storeCarrying() // ?
        }

        device.inUse = false
    }
}