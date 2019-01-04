import { Actor, Color, Traits, Vector } from "excalibur";
import { Building } from "./Building";
import { Planet } from "./Planet/Planet";
import { ResourceBlock, blockColor } from "../models/Economy";
import { Game } from "../Game";
import { eachCons, deleteByValue, deleteByValueOnce, sleep, shuffle } from "../Util";
import { Device, retrieveResource as retrieveResource } from "./Device";
import { Scale } from "../values/Scale";
import { MechanicalOperation, Recipe } from "../models/MechanicalOperation";
import { worker } from "cluster";
import { SSL_OP_EPHEMERAL_RSA } from "constants";

export class Citizen extends Actor {

    walkSpeed: number = Game.citizenSpeed
    carrying: ResourceBlock[] = [] // null
    path: Vector[] = []

    workInProgress: boolean = false
    workStarted: number
    workDuration: number
    progress: number

    constructor(private device: Device, protected planet: Planet) {
        super(device.x, device.y, Scale.minor.first, Scale.minor.third, Color.White)
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling))
    }

    update(engine, delta) {
        super.update(engine, delta)

        // make sure we are busy!
        this.work()

        // check wip
        if (this.workInProgress) {
            let now = (new Date()).getTime()
            this.progress = (now - this.workStarted) / this.workDuration
            // this.vel.x += ((Math.random())-0.5) * 0.1
        }
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)
        if (this.carrying) {
            this.carrying.forEach((carried, idx) => {
                ctx.fillStyle = blockColor(carried).toRGBA()
                ctx.fillRect(this.x + 4, this.y - 3 * idx, 5, 5)
            })
        }

        if (this.workInProgress) {
            ctx.lineWidth = 1
            let pw = 10, ph = 3
            let px = this.x - pw/2, py = this.y - 10;
            ctx.strokeStyle = Color.White.toRGBA()
            ctx.strokeRect(px, py, pw, ph)
            ctx.fillStyle = Color.Violet.darken(0.9).toRGBA()
            ctx.fillRect(px, py, pw, ph)
            ctx.fillStyle = Color.Violet.toRGBA()
            ctx.fillRect(px, py, this.progress * pw, ph)
        }

        let debugPath = true
        if (this.path && debugPath) {
            let c = Color.White.lighten(0.5)
            c.a = 0.5
            eachCons(this.path, 2).forEach(([a,b]) => {
                ctx.beginPath()
                ctx.moveTo(a.x,a.y)
                ctx.lineTo(b.x,b.y)
                ctx.strokeStyle = c.toRGBA()
                ctx.lineWidth = 10
                ctx.stroke()
            })
        }
    }

    carry(c: ResourceBlock) {
        this.carrying.push(c); // = c;
    }

    isCarryingUnique(resources: ResourceBlock[]): boolean {
        let isCarrying = true
        let carryingCopy = this.carrying.slice()
        if (this.carrying.length > 0) {
            resources.forEach(resToFind => {
                if (carryingCopy.find(res => res === resToFind)) {
                    deleteByValueOnce(carryingCopy, resToFind)
                } else {
                    isCarrying = false;
                }
            })
        }
        return isCarrying
    }

    drop(res: ResourceBlock): ResourceBlock {
        console.log("ASKED TO DROP", {res})
        if (this.carrying.length > 0) {
            if (this.carrying.find(r => r === res)) {
                // this.carrying = deleteByValue(this.carrying, res)
                deleteByValueOnce(this.carrying, res)
                return res
            }
        }
        return null
    }

    glideTo(pos: Vector) {
        return this.actions.moveTo(pos.x, pos.y, this.walkSpeed).asPromise()
    }

    async progressBar(duration: number) {
        this.workInProgress = true
        this.workStarted = (new Date()).getTime()
        this.workDuration = duration
        await new Promise((resolve, reject) => setTimeout(resolve, duration));
        this.workInProgress = false
    }

    async pathTo(building: Building) {
        if (this.path.length > 0) {
            console.log("The path already exists", { path: this.path })
            throw new Error("Already pathing!!")
        }

        console.log("Pathing to", { building })
        let path = this.planet.pathBetween(this.pos.clone(), building)
        if (path.length > 0) {
            this.path = path
            // path.pop()
            // path.shift()
            await Promise.all(
                path.map(step => this.glideTo(step))
            )
            this.path = []
        }
        return true;
    }

    async waitToUse(device) {
        await sleep(250)
        device.interact(this)
    //     // can't be great
        setTimeout(() => device.interact(this), 250)
    }

    async pause() {
        await sleep(3000)
    }

    // currentRecipe: Recipe
    // targetRecipe: Recipe

    // instead of sink-(source/source/source) it's just:
    // pick a recipe, gather and produce

    private async workRecipe(recipe: Recipe) {
        console.log("WORK RECIPE", { recipe })

        // await recipe.consumes.forEach(async ingredient => {
        for (let ingredient of recipe.consumes) {
            console.log("TRY TO GATHER", {ingredient})
            await this.gather(ingredient)
            console.log("OKAY, I should have gathered", { ingredient, recipe })
        }

        // await Promise.all(
            // recipe.consumes.map(ingredient => this.gather(ingredient))
        // )
        // we should have gathered everything?
        // recipe.consumes.forEach(async ingredient => await this.gather(ingredient))

        let devices = this.planet.colony.findAllDevices()
        let maker = devices.find(d => d.operation === recipe)
        if (maker) {
            console.log("found recipe maker, let's do this!")
            await this.pathTo(maker.building)
            console.log("walking to recipe maker!")
            await this.glideTo(maker)
            if (await maker.interact(this)) {
                console.log("i worked the recipe!")
            } else {
                console.log("i failed to work the recipe...")
                await sleep(1000)
                await this.workRecipe(recipe)
            }
        }

    }

    private async gather(res: ResourceBlock) {
        console.log("GATHER", { res })
        // let gathered = false
        let devices = this.planet.colony.findAllDevices()
        let gen: Device = devices.find((d: Device) =>
            // (d.operation.type === 'store' || d.operation.type === 'generator') &&
            (d.operation.type === 'generator') &&
              d.product.some(stored => res === stored)
        )

        if (gen) {
            console.log("found generator with resource", { res, gen })
            await this.pathTo(gen.building)
            console.log("gliding to get generated resource!", { gen, machine: gen.machine, pos: gen.pos })
            await this.glideTo(gen.pos)
            console.log("attempt to interact with generator to gather", { gen, res })
            if (await gen.interact(this, retrieveResource(res))) {
                console.log("gathered okay!")
                // gathered = true
                // // return true
            } else {
                console.warn("trying to gather again in a bit?")
                await sleep(1000)
                await this.gather(res)
                // setInterval(() => this.gather(res), 500)

            } // { request: res })
        } else {
            // ... is there a machine that makes this as a recipe? :)
            let maker = devices.find(d => d.operation.type === 'recipe' &&
                d.operation.produces === res)

            if (maker) {
                await this.workRecipe(maker.operation)
                // if (this)
            } else {
                console.warn("Can't find producer of", { res })
                await sleep(1000)
                await this.gather(res)
            }
        }
    }

    private working: boolean = false
    work() {
        // console.log("WORK")
        if (!this.working) {
            this.workOne()
        }
        // really need a timer that says: when you're done, be done
        // [ie that checks if we're working and only tries again if not?]
        // ex probably has a timer mechanism!!
    }

    private async workOne() {
        if (this.working) { return }
        this.working = true

        console.log("WORK ONE!!")


        let devices = this.planet.colony.findAllDevices()
        let store = shuffle(devices).find((d: Device) =>
            d.operation.type === 'store' && d.product.length < d.operation.capacity
        )
        if (store) {
            console.log("WORKING FOR STORE", { store })
            let makers = devices.filter(d => d.operation.type === 'recipe')
            let recipes: Recipe[] = makers.map(m => m.operation)

            // is there any just to gather to the store?
            // but let's assume we have to make it
            // find the recipe and work it
            let recipe = shuffle(recipes).find((r: Recipe) =>
                store.operation.stores.some(stored => r.produces === stored)
            )

            if (recipe) {
                console.log("TRY TO WORK RECIPE!!!", recipe)
                await this.workRecipe(recipe)
                // we should now be carrying the thing for the store! just deliver it?

                console.log("DELIVER TO STORE...")
                await this.pathTo(store.building)
                console.log("INTERACT WITH STORE...!")
                await this.glideTo(store.pos)
                if (await store.interact(this)) {
                    console.log("i think it worked!!")
                } else {
                    console.warn("maybe it didn't work!")
                }
            }

        }
        await sleep(1000)
        this.working = false
        // try to do something else
        // setTimeout(() => this.work(), 1000)
    }


        // pick a device with a recipe?
        //let devices = this.planet.colony.findAllDevices()

        //await this.workRecipe(makers[0].operation)
        // or work backwards maybe from a store with capacity...!

        //if (this.carrying.length > 0) {
        //    let item: ResourceBlock = this.carrying[0];
        //    let sink: Device = this.planet.closestDevice(this.pos,
        //        [],
        //        (device: Device) => device.isSinkFor(item)
        //    )

        //    if (sink) {
        //        await this.pathTo(sink.building)
        //        await this.glideTo(sink.pos)
        //        await sink.interact(this)
        //    } else {
        //        console.log("nowhere to deliver it", this.carrying)
        //    }
        //} else {
        //    let source: Device = this.planet.closestDevice(this.pos,
        //        [],
        //        // [ Cabin, Orchard, MiningDrill, Bookshelf ],
        //        (d: Device) => d.machine.operation.type === 'generator' &&
        //            d.product.length > 0
        //    )

        //    if (source) {
        //        await this.pathTo(source.building)
        //        await this.glideTo(source.pos)
        //        await source.interact(this)
        //    } else {
        //        console.log("i guess i can try again? (sleep for a bit first)")
        //        await new Promise((resolve, reject) => setTimeout(resolve, 150));
        //    }
        //}

    // }
}