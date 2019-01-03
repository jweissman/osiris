import { Actor, Color, Traits, Vector } from "excalibur";
import { Building } from "./Building";
import { Planet } from "./Planet/Planet";
import { ResourceBlock, blockColor } from "../models/Economy";
import { Game } from "../Game";
import { eachCons } from "../Util";
// import { Machine, Stove, ExperimentBench, MineralProcessor, CommandCenter, Orchard, MiningDrill, Bookshelf, CookingFire, Cabin } from "../models/Machine";
import { Device } from "./Device";
import { Scale } from "../values/Scale";
import { MachineOperation } from "../models/Machine";
import { worker } from "cluster";
// import { Machine, Stove, CommandCenter } from "../models/Machine";

export class Citizen extends Actor {

    walkSpeed: number = Game.citizenSpeed
    carrying: ResourceBlock = null
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

        // check wip
        if (this.workInProgress) {
            let now = (new Date()).getTime()
            this.progress = (now - this.workStarted) / this.workDuration
            this.vel.x += ((Math.random())-0.5) * 0.1
        }
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)
        if (this.carrying) {
            ctx.fillStyle = blockColor(this.carrying).toRGBA()
            ctx.fillRect(this.x+4, this.y-3, 5, 5)
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

        let debugPath = false
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

    carry(c: ResourceBlock) { //c: Color) {
        this.carrying = c;
    }

    drop(): ResourceBlock {
        if (this.carrying) {
            let c = this.carrying; //.clone();
            this.carrying = null;
            return c
        }
        return null
    }

    glideTo(pos: Vector) {
        return this.actions.moveTo(pos.x, pos.y, this.walkSpeed).asPromise()
    }

    async progressBar(duration: number) {
        // console.log("PROGRESS BAR")
        this.workInProgress = true
        this.workStarted = (new Date()).getTime()
        this.workDuration = duration
        await new Promise((resolve, reject) => setTimeout(resolve, duration));
        // console.log("PROGRESS BAR DONE!")
        this.workInProgress = false
    }

    async pathTo(building: Building) { //}, onArrival: (Building) => any) {
        // let building = this.planet.closestBuildingByType(this.pos, structure)

        let path = this.planet.pathBetween(this.pos.clone(), building)

        if (path.length > 0) {
            this.path = path
            path.pop()
            path.shift()
            await Promise.all(
                path.map(step => this.glideTo(step))
            )
            this.path = null
            // onArrival(building);
        }

        return true;
    }

    waitToUse(device) {
        setTimeout(() => device.interact(this), 250)
    }

    async work() {
        if (this.carrying) {
            let item: ResourceBlock = this.carrying;
            let sink: Device = this.planet.closestDevice(this.pos,
                [],
                (device) =>
                    device.machine.consumes === item ||
                    ((
                        item === ResourceBlock.Meal ||
                        item === ResourceBlock.Data ||
                        item === ResourceBlock.Mineral
                    ) && device.machine.behavior === MachineOperation.CollectResource) ||
                    item === ResourceBlock.Meal && device.machine.behavior === MachineOperation.CollectMeals ||
                    item === ResourceBlock.Data && device.machine.behavior === MachineOperation.CollectData
            )

            if (sink) {
                await this.pathTo(sink.building)
                await this.glideTo(sink.pos)
                await sink.interact(this)
            } else {
                console.log("nowhere to deliver it", this.carrying)
            }
        } else {
            let source: Device = this.planet.closestDevice(this.pos,
                [],
                // [ Cabin, Orchard, MiningDrill, Bookshelf ],
                (d) => d.product.length > 0
            )

            if (source) {
                await this.pathTo(source.building)
                await this.glideTo(source.pos)
                await source.interact(this)
            } else {
                console.log("i guess i can try again? (sleep for a bit first)")
                await new Promise((resolve, reject) => setTimeout(resolve, 150));
            }
        }

        setTimeout(() => this.work(), 100)
    }
}