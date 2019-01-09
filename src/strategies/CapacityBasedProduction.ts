import { shuffle } from "../Util";
import { Device } from "../actors/Device";
import { Recipe, ResourceStorage } from "../models/MechanicalOperation";
import { ProductionStrategy } from "./ProductionStrategy";

export class CapacityBasedProduction extends ProductionStrategy {
    async apply() {
        console.warn("APPLY CAPACITY BASED PRODUCTION!!")
        // if (this.isActive) { return; }
        // this.isActive = true
        const storeWithCapacity = (d: Device) => d.operation.type === 'store' &&
            d.product.length < d.getEffectiveOperationalCapacity(d.operation) //operation.capacity
        const store: Device = shuffle(this.devices).find(storeWithCapacity)
        if (store && store.operation.type === 'store') {
            const storage: ResourceStorage = store.operation
            const recipeForStoredResource = (r: Recipe) => storage.stores.some(stored => r.produces === stored)
            let recipe = shuffle(this.recipes).find(recipeForStoredResource)
            if (recipe) {
                await this.workRecipe(recipe)
                await this.storeBlock(recipe.produces)
            }
        }
        await this.pause()
        // this.isActive = false
    }

}
