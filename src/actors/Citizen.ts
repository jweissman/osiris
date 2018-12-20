import { Actor, Color, Traits, Vector } from "excalibur";
import { Building } from "./Building";
import { Planet } from "./Planet/Planet";
import { Structure, MissionControl, Laboratory, Mine, Dome, Kitchen } from "../models/Structure";
import { ResourceBlock, blockColor } from "../models/Economy";
import { Game } from "../Game";

export class Citizen extends Actor {
    walkSpeed: number = Game.citizenSpeed
    carrying: ResourceBlock = null
    path: Vector[] = []

    workInProgress: boolean = false
    workStarted: number
    workDuration: number
    progress: number

    constructor(building: Building, protected planet: Planet) {
        super(building.nodes()[0].x,building.nodes()[0].y,4,10,Color.White)
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling))
    }

    update(engine, delta) {
        super.update(engine, delta)

        // check wip
        if (this.workInProgress) {
            let now = (new Date()).getTime()
            this.progress = (now - this.workStarted) / this.workDuration //0.5
        }
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)
        if (this.carrying) {
            ctx.fillStyle = blockColor(this.carrying).toRGBA()
            ctx.fillRect(this.x+4, this.y-3, 5, 5)
        }

        if (this.workInProgress) {
            let pw = 10, ph = 3
            let px = this.x - pw/2, py = this.y - 10;
            // draw progress bar?
            ctx.strokeStyle = Color.White.toRGBA()
            // ctx.stroke(20)
            ctx.strokeRect(px, py, pw, ph)

            ctx.fillStyle = Color.Violet.darken(0.9).toRGBA()
            ctx.fillRect(px, py, pw, ph)
            ctx.fillStyle = Color.Violet.toRGBA()
            ctx.fillRect(px, py, this.progress * pw, ph)

            this.vel.x += (Math.random())-0.5 // * 10.0)
        }
    }

    carry(c: ResourceBlock) { //c: Color) {
        this.carrying = c;
    }

    drop() {
        if (this.carrying) {
            let c = this.carrying; //.clone();
            this.carrying = null;
            return c
        }
        return true
    }

    glideTo(pos: Vector) {
        return this.actions.moveTo(pos.x, pos.y, this.walkSpeed).asPromise()
    }

    async progressBar(duration: number) {
        console.log("PROGRESS BAR")
        this.workInProgress = true
        this.workStarted = (new Date()).getTime()
        this.workDuration = duration
        await new Promise((resolve, reject) => setTimeout(resolve, duration));
        console.log("PROGRESS BAR DONE!")
        this.workInProgress = false
    }

    async walkTo(building: Building) { //}, onArrival: (Building) => any) {
        // let building = this.planet.closestBuildingByType(this.pos, structure)

        let path = this.planet.pathBetween(this.pos.clone(), building)

        if (path.length > 0) {
            this.path = path
            await Promise.all(
                path.map(step => this.glideTo(step))
            )
            this.path = null
            // onArrival(building);
        }

        return true;
    }


    async work() {
        if (this.carrying) {
            console.log("carrying", this.carrying)
            let item: ResourceBlock = this.carrying;
            let sinks = []
            if (ResourceBlock[item] === 'Food') {
                sinks = [Kitchen]
            } else {
                sinks = [MissionControl]
            }

            if (sinks.length > 0) {
                let theSink = this.planet.closestBuildingByType(this.pos, sinks)
                if (theSink) {
                    await this.walkTo(theSink) //, async (b) => await b.interact(this))
                    await theSink.interact(this)
                    console.log("delivered to sink!")
                }
            } else {
                console.log("nowhere to deliver it", this.carrying)
            }
        } else {
            let source = this.planet.closestBuildingByType(this.pos,
                [Dome, Mine, Laboratory],
                (building) => building.product.length > 0
            )

            if (source) {
                await this.walkTo(source) //, async (b) => await b.interact(this))
                await source.interact(this)
                console.log("gathered from source!!")
            } else {
                console.log("i guess i can try again? (sleep for a bit first)")
        await new Promise((resolve, reject) => setTimeout(resolve, 3000));
                //etTimeout(() => this.work(), 500)
            }
        }

        // console.log("DONE WORK")
        // this.work()
        setTimeout(() => this.work(), 100)
        // await new Promise((resolve, reject) => setTimeout(resolve, 500));
        // await this.work()
    }
}