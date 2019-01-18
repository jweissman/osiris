import { Device } from "../actors/Device";
import { MechanicalOperation, Recipe } from "../models/MechanicalOperation";
import { ResourceBlock } from "../models/Economy";
import { retrieveResource } from "../values/InteractionRequest";
import { Strategy } from "./Strategy";

export abstract class ProductionStrategy extends Strategy {

    protected async storeBlock(res: ResourceBlock) {
        let stored = false
        let tries = 0
        while (!stored && tries < 30) {
            tries++
            if (await this.tryStoreBlock(res)) {
                stored = true
            } else {
                await this.pause()
            }
        }
    }

    private async tryStoreBlock(res: ResourceBlock): Promise<boolean> {
        let storesDesiredBlock = (d: Device) => d.operation.type === 'store' &&
            d.product.length < d.getEffectiveOperationalCapacity(d.operation) && //operation.capacity &&
            d.operation.stores.includes(res)
        let openStore = this.planet.colony.closestDeviceByType(this.pawn.pos, [], storesDesiredBlock)
        let stored = false
        if (openStore) {
            await this.visitDevice(openStore)
            if (await openStore.interact(this.pawn, { type: 'store', resource: res })) {
                stored = true
            }
        }

        //if (!stored) {
        //    await this.pause()
        //    // should try agi
        //    // await this.storeBlock(res)
        //}

        return stored
    }

}
