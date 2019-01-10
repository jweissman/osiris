import { Actor, Color, Traits, Vector } from "excalibur";
import { Building } from "./Building";
import { Planet } from "./Planet/Planet";
import { ResourceBlock, blockColor } from "../models/Economy";
import { Game } from "../Game";
import { eachCons, deleteByValueOnce, sleep, containsUniq } from "../Util";
import { Device } from "./Device";
import { Scale } from "../values/Scale";
import { ProductionStrategy } from "../strategies/ProductionStrategy";
import { CapacityBasedProduction } from "../strategies/CapacityBasedProduction";
import { drawStar } from "../Painting";
import { ConstructionStrategy } from "../strategies/ConstructionStrategy";
import { ProxmityBasedConstruction } from "../strategies/ProximityBasedConstruction";

export class Citizen extends Actor {
    isPlanning: boolean = false // 

    // walkSpeed: number = Game.citizenSpeed
    carrying: ResourceBlock[] = [] // null
    path: Vector[] = []

    workInProgress: boolean = false
    workStarted: number
    workDuration: number
    progress: number

    private productionStrategy: ProductionStrategy
    private constructionStrategy: ConstructionStrategy

    constructor(private home: Vector, protected planet: Planet, private elite: boolean = false) {
        super(home.x, home.y, Scale.minor.first, Scale.minor.fourth, Color.White)
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling))

        this.productionStrategy = new CapacityBasedProduction(this)
        this.constructionStrategy = new ProxmityBasedConstruction(this)
    }

    // get isWorking() { return this.isWorking }
    get currentPlanet() { return this.planet }

    get walkSpeed() {
        return this.planet.timeFactor * Game.citizenSpeed
    }

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

        if (this.elite) {
            // draw a little star?
            drawStar(ctx, this.pos.x + 6, this.pos.y - 9)
        }

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

        // let debugPath = true
        if (this.path && Game.debugPath) {
            let c = Color.White.lighten(0.5)
            c.a = 0.5
            eachCons(this.path, 2).forEach(([a,b]) => {
                ctx.beginPath()
                ctx.moveTo(a.x,a.y)
                ctx.lineTo(b.x,b.y)
                ctx.strokeStyle = c.toRGBA()
                ctx.lineWidth = 4
                ctx.stroke()
            })
        }
    }

    async progressBar(duration: number) {
        this.workInProgress = true
        this.workStarted = (new Date()).getTime()
        this.workDuration = duration
        await new Promise((resolve, reject) => setTimeout(resolve, duration));
        this.workInProgress = false
    }


    carry(c: ResourceBlock) {
        this.carrying.push(c);
    }

    isCarryingUnique(resources: ResourceBlock[]): boolean {
        let isCarrying = containsUniq(this.carrying, resources)
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

    currentBuilding: Building = null
    async visit(device: Device) {
        if (this.currentBuilding != device.building) {
            // let path = this.planet.pathBetween

            console.log("VISIT (find path)", { device })
            // const path = this.planet.pathBetween(this.pos.clone(), device.building) //pos.add(device.building.pos))
            const path = this.planet.pathBetweenPoints(this.pos.clone(), device.pos.add(device.building.pos))
            // path.pop()
            // path.shift()
            // path.shift()
            console.log("VISIT (path found!)", { path })
            await this.followPath(path)
            console.log("VISIT (path follow done, moving to target)")
        }
        let target = device.pos.add(device.building.pos)
        await this.glideTo(target)
        this.currentBuilding = device.building
    }

    glideTo(pos: Vector) {
        if (pos) {
            return this.actions.moveTo(pos.x, pos.y, this.walkSpeed).asPromise()
        }
    }

    async followPath(path: Vector[]) {
        if (path.length > 0) {
            this.path = path
            // path.pop()
            // path.shift()
            await Promise.all(
                path.map(step => this.glideTo(step))
            )
            this.path = []
        }
    }

    // currentBuilding: Building
    // async pathTo(building: Building) {
    //     if (this.path.length > 0) { throw new Error("Already pathing!!") }
    //     let path = this.planet.pathBetween(this.pos.clone(), building)
    //     await this.followPath(path)
    //     return true;
    // }

    async work() {
        if (this.isPlanning) {
            // console.log("---> Don't re-enter work, already planning")
            return // nope
        }

        this.isPlanning = true
        if (this.constructionStrategy.canApply()) {
            console.log("Constructing...")
            await this.constructionStrategy.attempt()
        } else {
            console.log("Producing...")
            await this.productionStrategy.attempt()
        }
        this.isPlanning = false
        console.log("Done planning...")
    }

}