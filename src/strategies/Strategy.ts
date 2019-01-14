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
        console.debug("GATHER BLOCK", { res })
        let gathered = false
        let generatesDesiredBlock = (d: Device) => (d.operation.type === 'generator') &&
            d.product.some(stored => res === stored) //&& !d.inUse
        let gen: Device = this.planet.colony.closestDeviceByType(this.pawn.pos, [], generatesDesiredBlock)

        let storesDesiredBlock = (d: Device) => (d.operation.type === 'store') &&
              d.product.some(stored => res === stored) //&& !d.inUse
        let store: Device = this.planet.colony.closestDeviceByType(this.pawn.pos, [], storesDesiredBlock)

        let device: Device = gen || store

        if (device) {
            // device.inUse = true
            console.debug("Found device to gather, visting...")
            await this.visitDevice(device)

            if (device.inUse) {
                // at least wait a bit and try again?
                let waitTimes = 0
                while (device.inUse) {
                    console.warn("waiting for device to be ready!")
                    await sleep(5000) //this.pause()
                    if (waitTimes++ > 10) {
                        return false 
                    }
                }
            }

            console.debug("Attempt to interact with device...")
            if (await device.interact(this.pawn, retrieveResource(res))) {
                console.debug("Interacted successfully!")
                gathered = true
            }
        } else {
            console.warn("Didn't gather...")
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
        console.debug("Working recipe", { product: recipe.produces })
        let knowsRecipe = (d: Device) => d.operation === recipe && !d.reserved
        let maker = this.planet.colony.closestDeviceByType(this.pawn.pos, [], knowsRecipe)
        let made = false
        if (maker) {
            maker.reserved = true
            // maker.inUse = true
            if (await this.gatherIngredients(recipe.consumes)) {
                await this.visitDevice(maker)
                if (await this.performRecipeTask(maker, recipe)) {
                    made = true
                }
            }
            maker.reserved = false
            // maker.inUse = false
        }
        // await this.pause()
        // await this.workRecipe(recipe);
        return made
    }

    protected async gatherIngredients(blocks: ResourceBlock[]): Promise<boolean> {
        if (!this.pawn.isCarryingUnique(blocks)) {
            console.debug("Gathering blocks...")
            for (let ingredient of blocks) {
                console.debug("attempting to gather", { ingredient })
                let tries = 0
                let gathered = false
                while (!gathered && tries < 20) {
                    tries += 1
                    if (await this.gatherBlock(ingredient)) {
                        gathered = true
                    } else {
                        await this.pause()
                    }
                }

                if (!gathered) {
                    console.warn("couldn't gather one of the ingredients!!")
                    return false
                }
                //else {
                //    console.warn("didn't gather it!")
                //    return false
                //}
            }
        }
        return true
    }

    protected async performRecipeTask(maker: Device, recipe: Recipe, timesToAttempt: number = 5) {
        console.debug("Try to perform recipe task...", { produces: recipe.produces })
        let worked = await maker.interact(this.pawn, { type: 'work', recipe })
        if (!worked) {
            // await this.pause()
            console.warn("waiting for machine to become available...")
            for (let i = 0; i < timesToAttempt; i ++) {
                await this.pause()
                if (await this.performRecipeTask(maker, recipe)) {
                    worked = true
                    break
                }
            }
        }
        return worked
    }
}