import { Planet } from "../actors/Planet/Planet";
import { Device, retrieveResource } from "../actors/Device";
import { MechanicalOperation, Recipe } from "../models/MechanicalOperation";
import { Citizen } from "../actors/Citizen";
import { sleep } from "../Util";
import { ResourceBlock } from "../models/Economy";
export abstract class ProductionStrategy {
    private sleepInterval: number = 250
    protected isActive: boolean = false;
    constructor(protected pawn: Citizen) { }
    protected abstract async apply();
    protected get planet(): Planet { return this.pawn.currentPlanet; }
    protected get devices(): Device[] { return this.planet.colony.findPoweredDevices(); }
    protected get operations(): MechanicalOperation[] { return this.devices.map(d => d.operation); }
    protected get recipes(): Recipe[] {
        let recipes: Recipe[] = [];
        this.operations.forEach(op => {
            if (op.type === 'recipe') {
                recipes.push(op);
            }
        });
        return recipes;
    }

    async attempt(): Promise<void> {
        if (this.isActive) {
            return;
        }
        if (!this.isActive) {
            // note apply will need to set this.isActive around its critical section
            await this.apply();
        }

        await this.pause()
        setInterval(() => { this.attempt() }, this.sleepInterval)
    }

    protected async pause() {
        await sleep(this.sleepInterval)
    }

    protected async workRecipe(recipe: Recipe) {
        for (let ingredient of recipe.consumes) {
            await this.gatherBlock(ingredient);
        }
        let knowsRecipe = (d: Device) => d.operation === recipe
        let maker = this.planet.colony.closestDeviceByType(this.pawn.pos, [], knowsRecipe)
        if (maker) {
            await this.visitDevice(maker)
            await this.performRecipeTask(maker, recipe)
        } else {
            await this.pause()
            await this.workRecipe(recipe);
        }
    }

    protected async performRecipeTask(maker: Device, recipe: Recipe) {
      let worked = await maker.interact(this.pawn, { type: 'work', recipe })
      if (!worked) {
          await this.pause()
          console.warn("waiting for machine to become available...")
          await this.performRecipeTask(maker, recipe)
      }
    }


    protected async storeBlock(res: ResourceBlock) {

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

        if (!stored) {
            await this.pause()
            await this.storeBlock(res)
        }
    }

    protected async gatherBlock(res: ResourceBlock) {
        let gathered = false
        let generatesDesiredBlock = (d: Device) => (d.operation.type === 'generator') &&
            d.product.some(stored => res === stored)

        let gen: Device = this.planet.colony.closestDeviceByType(this.pawn.pos, [], generatesDesiredBlock)
        let storesDesiredBlock = (d: Device) => (d.operation.type === 'store') &&
              d.product.some(stored => res === stored)

        let store: Device = this.planet.colony.closestDeviceByType(this.pawn.pos, [], storesDesiredBlock)

        let device = gen || store

        if (device) {
            await this.visitDevice(device)
            if (await device.interact(this.pawn, retrieveResource(res))) {
                gathered = true
            }
        } else {
            let recipe = this.recipes.find(recipe => recipe.produces === res);
            if (recipe) {
                await this.workRecipe(recipe);
                gathered = true
            }
        }

        if (!gathered) {
            await this.pause() // sleep(1000)
            await this.gatherBlock(res)
        }
    }

    private async visitDevice(device: Device) {
        await this.pawn.pathTo(device.building)
        await this.pawn.glideTo(device.pos.add(device.building.pos))
    }
}
