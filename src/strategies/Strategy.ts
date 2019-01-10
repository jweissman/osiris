import { Citizen } from "../actors/Citizen";
import { Planet } from "../actors/Planet/Planet";
import { Device } from "../actors/Device";
import { sleep } from "../Util";
import { ResourceBlock } from "../models/Economy";
import { retrieveResource } from "../values/InteractionRequest";
import { Recipe, MechanicalOperation } from "../models/MechanicalOperation";

export abstract class Strategy {
    private sleepInterval: number = 250
    protected isActive: boolean = false;
    constructor(protected pawn: Citizen) { }

    protected abstract async apply();
    abstract canApply(): boolean;

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
            this.isActive = true
            // note apply will need to set this.isActive around its critical section
            await this.apply();
            this.isActive = false
        }

        await this.pause()
        // setInterval(() => { this.attempt() }, this.sleepInterval)
    }

    protected async pause() {
        await sleep(this.sleepInterval)
    }

    protected async gatherBlock(res: ResourceBlock): Promise<boolean> {
        console.log("GATHER BLOCK", { res })
        let gathered = false
        let generatesDesiredBlock = (d: Device) => (d.operation.type === 'generator') &&
            d.product.some(stored => res === stored)
        let gen: Device = this.planet.colony.closestDeviceByType(this.pawn.pos, [], generatesDesiredBlock)

        let storesDesiredBlock = (d: Device) => (d.operation.type === 'store') &&
              d.product.some(stored => res === stored)
        let store: Device = this.planet.colony.closestDeviceByType(this.pawn.pos, [], storesDesiredBlock)

        let device: Device = gen || store

        if (device) {
            console.log("Found device to gather, visting...")
            await this.visitDevice(device)

            if (device.inUse) {
                // at least wait a bit and try again?
                let waitTimes = 0
                while (device.inUse) {
                    console.warn("waiting for device to be ready!")
                    await sleep(3000) //this.pause()
                    if (waitTimes++ > 10) {
                        return false 
                    }
                }
            }

            console.log("Attempt to interact with device...")
            if (await device.interact(this.pawn, retrieveResource(res))) {
                console.log("Interacted successfully!")
                gathered = true
            }
        } else {
            console.log("Didn't gather...")
            // don't work sub-recipes??
            // let recipe = this.recipes.find(recipe => recipe.produces === res);
            // if (recipe) {
                // gathered = await this.workRecipe(recipe);
                // gathered = true
            // }
        }

        return gathered
    }

    protected async visitDevice(device: Device) {
        await this.pawn.visit(device)
    }


    protected async workRecipe(recipe: Recipe): Promise<boolean> {
        console.log("Working recipe", { product: recipe.produces })
        if (await this.gatherIngredients(recipe.consumes)) {
            let knowsRecipe = (d: Device) => d.operation === recipe
            let maker = this.planet.colony.closestDeviceByType(this.pawn.pos, [], knowsRecipe)
            if (maker) {
                await this.visitDevice(maker)
                if (await this.performRecipeTask(maker, recipe)) {
                    return true
                }
            }
        }
        // await this.pause()
        // await this.workRecipe(recipe);
        return false
    }

    protected async gatherIngredients(blocks: ResourceBlock[]): Promise<boolean> {
        if (!this.pawn.isCarryingUnique(blocks)) {
            console.log("Gathering blocks...")
            for (let ingredient of blocks) {
                console.log("attempting to gather", { ingredient })
                if (await this.gatherBlock(ingredient)) {
                    console.log("gathered!", { ingredient })
                } else {
                    console.warn("didn't gather it!")
                    return false
                }
            }
        }
        return true
    }

    protected async performRecipeTask(maker: Device, recipe: Recipe, timesToAttempt: number = 5) {
        console.log("Try to perform recipe task...", { produces: recipe.produces })
        let worked = await maker.interact(this.pawn, { type: 'work', recipe })
        if (!worked) {
            // await this.pause()
            console.warn("NOT waiting for machine to become available...")
            for (let i = 0; i < timesToAttempt; i ++) {
              if (await this.performRecipeTask(maker, recipe)) {
                  worked = true
                  break
              }
            }
        }
        return worked
    }
}