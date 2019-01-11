import { shuffle, containsUniq } from "../Util";
import { Device } from "../actors/Device";
import { Recipe, ResourceStorage } from "../models/MechanicalOperation";
import { ProductionStrategy } from "./ProductionStrategy";

export class CapacityBasedProduction extends ProductionStrategy {
    private findStore() {
        const storeWithCapacity = (d: Device) => d.operation.type === 'store' &&
            d.product.length < d.getEffectiveOperationalCapacity(d.operation) //&&
            // !d.inUse
            // containsUniq(this.planet.storedResources, d.operation)
        let store: Device = shuffle(this.devices).find(storeWithCapacity)
        return store
    }

    canApply(): boolean {
        // throw new Error("Method not implemented.");
        return !!this.findStore()
    }

    async apply() {
        let store = this.findStore()

        if (store && store.operation.type === 'store') {
            // store.inUse = true
            const storage: ResourceStorage = store.operation
            const recipeForStoredResource = (r: Recipe) => storage.stores.some(stored => r.produces === stored)
            let recipe: Recipe = shuffle(this.recipes).find(recipeForStoredResource)
            if (recipe && containsUniq(this.planet.storedResources, recipe.consumes)) {
                if (await this.workRecipe(recipe)) {
                    await this.storeBlock(recipe.produces)
                }
            }
            // store.inUse = false
        }
        await this.pause()
    }

}
