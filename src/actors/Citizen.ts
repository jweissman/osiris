import { Actor, Color, Traits, Vector } from "excalibur";
import { Building } from "./Building";
import { Planet } from "./Planet/Planet";
import { ResourceBlock, blockColor } from "../models/Economy";
import { Game } from "../Game";
import { eachCons, deleteByValueOnce, sleep } from "../Util";
import { Device } from "./Device";
import { Scale } from "../values/Scale";
import { ProductionStrategy } from "../strategies/ProductionStrategy";
import { CapacityBasedProduction } from "../strategies/CapacityBasedProduction";

export class Citizen extends Actor {

    walkSpeed: number = Game.citizenSpeed
    carrying: ResourceBlock[] = [] // null
    path: Vector[] = []

    workInProgress: boolean = false
    workStarted: number
    workDuration: number
    progress: number

    private productionStrategy: ProductionStrategy

    constructor(private home: Vector, protected planet: Planet) {
        super(home.x, home.y, Scale.minor.first, Scale.minor.third, Color.White)
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling))

        this.productionStrategy = new CapacityBasedProduction(this)
    }

    get isWorking() { return this.isWorking }
    get currentPlanet() { return this.planet }

    update(engine, delta) {
        super.update(engine, delta)

        // make sure we are busy!
        this.work()

        // check wip
        if (this.workInProgress) {
            let now = (new Date()).getTime()
            this.progress = 
              Math.min(
                  (now - this.workStarted) / this.workDuration,
                  1
              )
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

    carry(c: ResourceBlock) {
        this.carrying.push(c);
    }

    isCarryingUnique(resources: ResourceBlock[]): boolean {
        let isCarrying = false
        let carryingCopy = this.carrying.slice()
        if (this.carrying.length > 0) {
            let missingItem = false
            resources.forEach(resToFind => {
                if (carryingCopy.find(res => res === resToFind)) {
                    deleteByValueOnce(carryingCopy, resToFind)
                } else {
                    missingItem = true;
                }
            })
            isCarrying = !missingItem
        }
        // console.log("IS CARRYING", { resources, carrying: this.carrying, result: isCarrying })
        return isCarrying
    }

    drop(res: ResourceBlock): ResourceBlock {
        if (this.carrying.length > 0) {
            if (this.carrying.find(r => r === res)) {
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
            throw new Error("Already pathing!!")
        }

        let path = this.planet.pathBetween(this.pos.clone(), building)
        if (path.length > 0) {
            this.path = path
            path.pop()
            path.shift()
            await Promise.all(
                path.map(step => this.glideTo(step))
            )
            this.path = []
        }
        return true;
    }

    work() {
        this.productionStrategy.attempt()
    }

}