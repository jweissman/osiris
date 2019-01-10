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
import { drawStar, drawRect } from "../Painting";
import { ConstructionStrategy } from "../strategies/ConstructionStrategy";
import { ProxmityBasedConstruction } from "../strategies/ProximityBasedConstruction";
import { SleepingStrategy } from "../strategies/SleepingStrategy";
import { AnyBedSleepingStrategy } from "../strategies/AnyBedSleepingStrategy";

export class Citizen extends Actor {
    isPlanning: boolean = false // 

    // walkSpeed: number = Game.citizenSpeed
    carrying: ResourceBlock[] = [] // null
    path: Vector[] = []

    workInProgress: boolean = false
    workStarted: number
    workDuration: number
    progress: number

    sleeping: boolean = false

    energy: number = 100

    private productionStrategy: ProductionStrategy
    private constructionStrategy: ConstructionStrategy
    private sleepingStrategy: SleepingStrategy

    constructor(private home: Vector, protected planet: Planet, private elite: boolean = false) {
        super(home.x, home.y, Scale.minor.first, Scale.minor.fourth, Color.White)
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling))

        this.productionStrategy = new CapacityBasedProduction(this)
        this.constructionStrategy = new ProxmityBasedConstruction(this)
        this.sleepingStrategy = new AnyBedSleepingStrategy(this)
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
        ctx.save()
        // ctx.globalAlpha = 1.0
        ctx.translate(this.x, this.y - this.getHeight()/2)
        if (this.sleeping) {
            ctx.rotate(Math.PI / 2);
            ctx.translate(0, -5)
        }
        drawRect(ctx,
            { x: 0, y: 0, width: this.getWidth(), height: this.getHeight() },
            0,
            Color.White
        )
        // super.draw(ctx, delta)
        ctx.restore()

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
            const path = this.planet.pathBetweenPoints(this.pos.clone(), device.pos.add(device.building.pos))
            await this.followPath(path)
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
            await Promise.all(
                path.map(step => this.glideTo(step))
            )
            this.path = []
        }
    }

    async work() {
        if (this.isPlanning || this.sleeping) { return }

        this.isPlanning = true
        // just get rid of it??
        if (this.carrying.length > 0) { this.carrying = [] }
        let strats = [
            this.sleepingStrategy,
            this.constructionStrategy,
            this.productionStrategy
        ]
        let choice = strats.find(strat => strat.canApply())
        if (choice) {
            await choice.attempt()
            this.energy--
        }
        this.isPlanning = false
    }

    async takeRest(duration: number) {
        console.log("Citizen taking a well-deserved rest!!")
        this.sleeping = true
        await this.progressBar(duration)
        this.energy = 100
        this.sleeping = false
    }
}