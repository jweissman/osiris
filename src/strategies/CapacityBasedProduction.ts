import { shuffle, containsUniq } from "../Util";
import { Device } from "../actors/Device";
import { Recipe, ResourceStorage, ExploreForResource } from "../models/MechanicalOperation";
import { ProductionStrategy } from "./ProductionStrategy";
import { Resource } from "excalibur";

export class CapacityBasedProduction extends ProductionStrategy {
    canApply(): boolean {
        let hasOpenStore = !!(this.findStore())
        console.log("Do we have an open store?", hasOpenStore)
        return hasOpenStore
    }

    async apply() {
        let store = this.findStore()
        let recipe = this.findRecipe(store)
        let explorer = this.findExplorer(store)

        if (recipe) {
            if (containsUniq(this.planet.storedResources, recipe.consumes)) {
                if (await this.workRecipe(recipe)) {
                    await this.storeBlock(recipe.produces)
                }
            }
        } else if (explorer) {
            console.warn("would explore!")
            if (await this.workExploration(explorer)) {
                await this.storeBlock(explorer.gathers)

            }
        } else {
            console.warn("No recipe or explorer!")
            /// ....
        }
    }

    private findStore() {
        const storeWithCapacity = (d: Device) => d.operation.type === 'store' &&
            d.product.length < d.getEffectiveOperationalCapacity(d.operation) //&&
        let store: Device = shuffle(this.devices).find(storeWithCapacity)
        return store
    }


    private findRecipe(store: Device): Recipe {
        if (store && store.operation.type === 'store') {
            const storage: ResourceStorage = store.operation
            const recipeForStoredResource = (r: Recipe) => storage.stores.some(stored => r.produces === stored)
            let recipe: Recipe = shuffle(this.recipes).find(recipeForStoredResource)
            return recipe
        }
    }

    private findExplorer(store: Device): ExploreForResource {
        if (store && store.operation.type === 'store') {
            const storage: ResourceStorage = store.operation
            console.log("Looking for explorer for", { stored: storage.stores })
            const explorerForStored = (e: ExploreForResource) => storage.stores.some(stored => e.gathers === stored)
            let explorer: ExploreForResource = shuffle(this.explorers).find(explorerForStored)
            console.log("Looked for explorer, found: ", { explorer })
            return explorer
        }
    }
}
