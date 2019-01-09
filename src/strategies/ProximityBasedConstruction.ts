import { ConstructionStrategy } from "./ConstructionStrategy";
import { Device } from "../actors/Device";

export class ProxmityBasedConstruction extends ConstructionStrategy {


    async apply() {
        // if (this.isActive) { return }
        // this.isActive = true

        console.warn("APPLY PROXIMITY BASED CONSTRUCTION!!")

        // await this.pause()
        // await this.pause()
        // await this.pause()

        // throw new Error("Method not implemented.");
        // const isUnbuilt = (d: Device) => !d.built && !d.inUse && d.building.isActive
        // let unbuiltDevice = this.planet.colony.findAllDevices().find(isUnbuilt)

        // find cost items
        if (this.unbuiltDevice && this.unbuiltDevice.building) { //} && unbuiltDevice.building) {
            await this.constructDevice(this.unbuiltDevice)
        }
        await this.pause()

        // this.isActive = false
    }

    private async constructDevice(device: Device) {
        console.log("CONSTRUCT DEVICE", { device, building: device.building })
        device.inUse = true
        let resources = device.machine.cost
        console.log("gather ingredients...")
        await this.gatherIngredients(resources)
        console.log("visit!!")
        await this.visitDevice(device)
        await device.assemble(this.pawn)
        device.inUse = false
    }
}