import { ResourceBlock } from "../models/Economy";
import { sleep, shuffle } from "../Util";
import { Device, retrieveResource as retrieveResource } from "../actors/Device";
import { Recipe, ResourceStorage } from "../models/MechanicalOperation";
import { ProductionStrategy } from "./ProductionStrategy";
// todo better efficiency (pick closest)
// try harder to deposit produced resources!! you made that
export class CapacityBasedProduction extends ProductionStrategy {
    // async pause() { await sleep(250) }

    async apply() {
        if (this.isActive) { return; }
        this.isActive = true
        // await this.pause()
        const storeWithCapacity = (d: Device) => d.operation.type === 'store' &&
            d.product.length < d.operation.capacity
        const store: Device = shuffle(this.devices).find(storeWithCapacity)
        if (store && store.operation.type === 'store') {
            const storage: ResourceStorage = store.operation
            const recipeForStoredResource = (r: Recipe) => storage.stores.some(stored => r.produces === stored)
            let recipe = shuffle(this.recipes).find(recipeForStoredResource)
            if (recipe) {
                console.log("Working recipe", { recipe })
                await this.workRecipe(recipe)
                console.log("Recipe worked, storing block...", { block: recipe.produces })
                await this.storeBlock(recipe.produces)
            }
        }
        await this.pause()
        this.isActive = false
    }

}
