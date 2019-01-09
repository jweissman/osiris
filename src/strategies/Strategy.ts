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

    protected async gatherBlock(res: ResourceBlock) {
        let gathered = false
        let generatesDesiredBlock = (d: Device) => (d.operation.type === 'generator') &&
            d.product.some(stored => res === stored)
        let gen: Device = this.planet.colony.closestDeviceByType(this.pawn.pos, [], generatesDesiredBlock)

        let storesDesiredBlock = (d: Device) => (d.operation.type === 'store') &&
              d.product.some(stored => res === stored)
        let store: Device = this.planet.colony.closestDeviceByType(this.pawn.pos, [], storesDesiredBlock)

        let device: Device = gen || store

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
            await this.pause()
            await this.gatherBlock(res)
        }
    }

    protected async visitDevice(device: Device) {
        await this.pawn.visit(device)
    }


    protected async workRecipe(recipe: Recipe) {
        await this.gatherIngredients(recipe.consumes)

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

    protected async gatherIngredients(blocks: ResourceBlock[]) { //recipe: Recipe) {
        if (!this.pawn.isCarryingUnique(blocks)) { //recipe.consumes)) {
            for (let ingredient of blocks) { //recipe.consumes) {
                await this.gatherBlock(ingredient);
            }
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
}