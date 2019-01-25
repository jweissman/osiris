import { Actor, Color, Traits, Vector, VisibleEvent } from "excalibur";
import { Building } from "./Building";
import { Planet } from "./Planet/Planet";
import { ResourceBlock, blockColor } from "../models/Economy";
import { Game } from "../Game";
import { eachCons, deleteByValueOnce, sleep, containsUniq, deleteByValue } from "../Util";
import { Device } from "./Device";
import { Scale } from "../values/Scale";
import { ProductionStrategy } from "../strategies/ProductionStrategy";
import { CapacityBasedProduction } from "../strategies/CapacityBasedProduction";
import { drawStar, drawRect } from "../Painting";
import { ConstructionStrategy } from "../strategies/ConstructionStrategy";
import { ProxmityBasedConstruction } from "../strategies/ProximityBasedConstruction";
import { SleepingStrategy } from "../strategies/SleepingStrategy";
import { AnyBedSleepingStrategy } from "../strategies/AnyBedSleepingStrategy";
import { EatingStrategy } from "../strategies/EatingStrategy";
import { WhenHungryEatingStrategy } from "../strategies/WhenHungryEatingStrategy";
import { DeviceSize, getVisibleDeviceSize } from "../values/DeviceSize";

export class Citizen extends Actor {
    isPlanning: boolean = false // 

    // walkSpeed: number = Game.citizenSpeed
    carrying: ResourceBlock[] = [] // null
    path: Vector[] = []

    private workInProgress: boolean = false
    private workStarted: number
    private workDuration: number
    private progress: number

    private sleeping: boolean = false


    private productionStrategy: ProductionStrategy
    private constructionStrategy: ConstructionStrategy
    private sleepingStrategy: SleepingStrategy
    private eatingStrategy: EatingStrategy

    private hunger: number = 0.0;
    private energy: number = 100

    driving: Device = null

    constructor(public name: string, private home: Vector, protected planet: Planet, private elite: boolean = false) {
        super(home.x, home.y, Scale.minor.first, Scale.minor.fourth, Color.White.clone())
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling))

        this.productionStrategy = new CapacityBasedProduction(this)
        this.constructionStrategy = new ProxmityBasedConstruction(this)
        this.sleepingStrategy = new AnyBedSleepingStrategy(this)
        this.eatingStrategy = new WhenHungryEatingStrategy(this)
    }

    get isHungry() { return this.hunger > 0.6 }
    get isTired()  { return this.energy < 90 }

    // get isWorking() { return this.isWorking }
    get currentPlanet() { return this.planet }

    get walkSpeed() {
        let speedMultiplier = this.planet.timeFactor * (this.elite ? 1.6 : 1)
        return Game.citizenSpeed * speedMultiplier
    }

    update(engine, delta) {
        super.update(engine, delta)


        // check wip
        if (this.workInProgress) {
            let now = (new Date()).getTime()
            this.progress = 
              Math.min(
                  (now - this.workStarted) / this.workDuration,
                  1
              )

            this.energy -= 0.1
            this.hunger += 0.001
        } else if (this.path.length > 0) {
            // we have a non-empty path
        } else {

            // we aren't working or walking -- make sure we are busy!
            this.work()
        }
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        let { x, y } = this
        if (this.driving) {

            x = this.driving.pos.add(this.driving.building.pos).x //- getVisibleDeviceSize(this.driving.size)/2
            y = this.driving.pos.add(this.driving.building.pos).y // - 14
        } 

        ctx.save()
        // ctx.globalAlpha = 1.0
        ctx.translate(x, y - this.getHeight()/2 - 5)
        if (this.sleeping) {
            ctx.rotate(-Math.PI / 2);
            ctx.translate(5, -10)
        }
        // ctx.globalAlpha = 1.0 //?
        drawRect(
            ctx,
            { x: 0, y: 0, width: this.getWidth(), height: this.getHeight() },
            0,
            Color.White
        )

        if (this.elite) {
            // draw a little star?
            drawStar(ctx, 8, -5)
        }

        // super.draw(ctx, delta)
        if (this.carrying) {
            let dx = 5
            // if (this.vel.x < 0) { dx = -5 }
            this.carrying.forEach((carried, idx) => {
                ctx.fillStyle = blockColor(carried).clone().saturate(0.2).toRGBA()
                ctx.fillRect(dx, 2 - 4 * idx, 5, 5)
            })
        }
        ctx.restore()

        if (this.workInProgress) {
            ctx.lineWidth = 1
            let pw = 10 + Math.floor(this.workDuration / 10000), ph = 3
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
            let c = Color.White.clone().lighten(0.5)
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
        let target = this.targetForDevice(device)
        if (this.currentBuilding != device.building) {
            const path = this.planet.pathBetweenPoints(this.pos.clone(), target)
            await this.followPath(path)
        }
        await this.glideTo(target)
        this.currentBuilding = device.building
    }

    private targetForDevice(device: Device) {
        let target = device.pos.add(device.building.pos)
        if (device.parentDevice) {
            target = (device.parentDevice.pos).add(device.building.pos)
            target.x += device.pos.x
            target.y += getVisibleDeviceSize(device.parentDevice.size) / 2
        } else {
            target.y += getVisibleDeviceSize(device.size) / 2
        }
        return target
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
    
    protected get strategies() {
        return [
            this.sleepingStrategy,
            this.eatingStrategy,
            this.constructionStrategy,
            this.productionStrategy
        ]
    }

    async work() {
        if (this.isPlanning || this.sleeping) { return }

        this.isPlanning = true
        // just get rid of it??
        if (this.carrying.length > 0) { this.carrying = [] }
        let choice = this.strategies.find(strat => strat.canApply())
        if (choice) {
            await choice.attempt()
            this.energy -= 1
            this.hunger += 0.01
        }
        this.isPlanning = false
    }

    async takeRest(duration: number = 8 * 60 * Game.minuteTickMillis) {
        console.log("Citizen taking a well-deserved rest!!")
        this.sleeping = true
        await this.progressBar(duration)
        this.energy = 100
        this.sleeping = false
    }

    async eat() {
        console.log("Citizen eating a meal!")
        // this.eating = true
        let thirtyMinuteTimer = 30 * Game.minuteTickMillis
        await this.progressBar(thirtyMinuteTimer)
        deleteByValueOnce(this.carrying, ResourceBlock.Meal)
        this.hunger = 0
    }
}