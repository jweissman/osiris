import { shuffle, containsUniq } from "../Util";
import { Device } from "../actors/Device";
import { Recipe, ResourceStorage } from "../models/MechanicalOperation";
import { ProductionStrategy } from "./ProductionStrategy";

export class CapacityBasedProduction extends ProductionStrategy {
    private get store() {
        const storeWithCapacity = (d: Device) => d.operation.type === 'store' &&
            d.product.length < d.getEffectiveOperationalCapacity(d.operation)
            // containsUniq(this.planet.storedResources, d.operation)
        const store: Device = shuffle(this.devices).find(storeWithCapacity)
        return store
    }

    canApply(): boolean {
        // throw new Error("Method not implemented.");
        return !!this.store
    }

    async apply() {
        if (this.store && this.store.operation.type === 'store') {
            const storage: ResourceStorage = this.store.operation
            const recipeForStoredResource = (r: Recipe) => storage.stores.some(stored => r.produces === stored)
            let recipe: Recipe = shuffle(this.recipes).find(recipeForStoredResource)
            if (recipe && containsUniq(this.planet.storedResources, recipe.consumes)) {
                if (await this.workRecipe(recipe)) {
                    await this.storeBlock(recipe.produces)
                }
            }
        }
        await this.pause()
    }

}
