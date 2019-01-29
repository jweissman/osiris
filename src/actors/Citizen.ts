import { Actor, Color, Traits, Vector, VisibleEvent, Label, CollisionType, Timer } from "excalibur";
import { Building } from "./Building";
import { Planet } from "./Planet/Planet";
import { ResourceBlock, blockColor } from "../models/Economy";
import { Game } from "../Game";
import { eachCons, deleteByValueOnce, sleep, containsUniq, deleteByValue, sample, range } from "../Util";
import { Device } from "./Device";
import { Scale } from "../values/Scale";
import { ProductionStrategy } from "../strategies/ProductionStrategy";
import { CapacityBasedProduction } from "../strategies/CapacityBasedProduction";
import { drawStar, drawRect, drawCircle, drawEllipse, drawText } from "../Painting";
import { ConstructionStrategy } from "../strategies/ConstructionStrategy";
import { ProxmityBasedConstruction } from "../strategies/ProximityBasedConstruction";
import { SleepingStrategy } from "../strategies/SleepingStrategy";
import { AnyBedSleepingStrategy } from "../strategies/AnyBedSleepingStrategy";
import { EatingStrategy } from "../strategies/EatingStrategy";
import { WhenHungryEatingStrategy } from "../strategies/WhenHungryEatingStrategy";
import { DeviceSize, getVisibleDeviceSize } from "../values/DeviceSize";
import { CombatStrategy } from "../strategies/CombatStrategy";
import { AttackNearestHostileStrategy } from "../strategies/AttackNearestHostileStrategy";
import { randomBytes } from "crypto";

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
    private fightingStrategy: CombatStrategy

    hunger: number = 0.0;
    energy: number = 100
    health: number = 100

    private driving: Device = null

    private shirtColor: Color
    private skinColor: Color
    private weight: number
    // private nameLabel: Label

    constructor(public name: string, private home: Vector, protected planet: Planet, private elite: boolean = false, private evil: boolean = false) {
        super(
            home.x, home.y,
            18,20,
            // Scale.minor.first, Scale.minor.fourth,
            Color.Transparent.clone()
            )
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling))

        this.productionStrategy = new CapacityBasedProduction(this)
        this.constructionStrategy = new ProxmityBasedConstruction(this)
        this.sleepingStrategy = new AnyBedSleepingStrategy(this)
        this.eatingStrategy = new WhenHungryEatingStrategy(this)
        this.fightingStrategy = new AttackNearestHostileStrategy(this)


        this.shirtColor = (this.elite ? Color.Red : sample([
            Color.Green,
            Color.Blue,
            Color.Orange,
            Color.Yellow,
        ])).clone()
        if (this.evil) { this.shirtColor = Color.Black.clone() }

        this.skinColor = sample([
            Color.Orange.lighten(0.5),
            Color.Orange.lighten(0.6),
            Color.Orange.lighten(0.7),
            Color.Orange.lighten(0.8),
        ])

        this.weight = sample([ 5, 6, 7, 8, 9, 10 ])

        // this.nameLabel = new Label(name, this.pos.x, this.pos.y, Game.font)
        // this.add(this.nameLabel)

        this.collisionType = CollisionType.Active
        // this.collisionArea
    }

    get title() {
        let title = this.elite ? 'Cmdr. ' : ''
        return title
    }

    get isHungry() { return this.hunger > 60 }
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

            this.fatigue()
        } else if (this.path.length > 0) {
            // we have a non-empty path
        } else {

            // we aren't working or walking -- make sure we are busy!
            this.work()
        }

        if (this.driving) {
            this.pos = this.driving.pos.add(this.driving.building.pos)
        }

        if (this.combatting && this.combatting.isKilled()) {
            // console.log("enemy was killed?", this.combatting)
            this.combatting = null
        }
    }

    private fatigue() {
        let unit = 1e-4;
        this.energy -= unit;
        this.hunger += unit;
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)

        let { x, y } = this
        ctx.save()
        ctx.translate(x, y - this.getHeight()/2) // - 5)
        if (this.sleeping) {
            ctx.rotate(-Math.PI / 2);
            ctx.translate(5, -10)
        }
        this.drawSelf(ctx)
        if (this.carrying) {
            let dx = 5
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
            this.drawBar(ctx, px, py, pw, ph, this.progress)
        }

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

    private drawBar(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number, ph: number, progress: number, color: Color = Color.Violet) {
        let c = color.clone()
        ctx.strokeStyle = Color.White.toRGBA()
        ctx.strokeRect(px, py, pw, ph)
        ctx.fillStyle = c.darken(0.9).toRGBA()
        ctx.fillRect(px, py, pw, ph)
        ctx.fillStyle = c.toRGBA()
        ctx.fillRect(px, py, progress * pw, ph)
    }


    private drawSelf(ctx: CanvasRenderingContext2D) {
        drawEllipse(ctx, 2, 8,
            this.weight, 9,
            this.shirtColor.desaturate(0.1).lighten(0.1))
        drawCircle(ctx, 2, -3,
            4.5, this.skinColor.desaturate(0.2))
        if (this.elite) {
            drawStar(ctx, 12, -8)
        }
        drawText(ctx, this.name, -14, -22)

        if (this.health < 100) {
            let healthColor = this.health > 60 ? Color.Green : Color.Yellow
            if (this.health < 10) { healthColor = Color.Red }
            this.drawBar(ctx, -13, -18, 32, 4, (this.health / 100), healthColor)
        }
    }

    async progressBar(duration: number) {
        this.workInProgress = true
        this.workStarted = (new Date()).getTime()
        this.workDuration = duration
        await new Promise((resolve, reject) => setTimeout(resolve, duration));
        this.workInProgress = false
    }

    drive(d: Device) {
        this.driving = d
    }

    stopDriving() {
        this.driving = null
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
            await this.pathTo(target)
        }
        await this.glideTo(target)
        this.currentBuilding = device.building
    }

    async pathTo(pos: Vector) {
        const path = this.planet.pathBetweenPoints(this.pos.clone(), pos)
        path.pop()
        await this.followPath(path)
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
            this.fightingStrategy,
            this.sleepingStrategy,
            this.eatingStrategy,
            this.constructionStrategy,
            this.productionStrategy
        ]
    }

    async work() {
        if (this.isPlanning || this.sleeping) { return }
        this.isPlanning = true
        if (this.carrying.length > 0) { this.carrying = [] }
        let choice = this.strategies.find(strat => strat.canApply())
        if (choice) {
            await choice.attempt()
        }
        this.isPlanning = false
    }

    async takeRest(duration: number = 8 * 60 * Game.minuteTickMillis) {
        this.sleeping = true
        await this.progressBar(duration)
        this.energy = 100
        this.sleeping = false
    }

    async eat() {
        let thirtyMinuteTimer = 30 * Game.minuteTickMillis
        await this.progressBar(thirtyMinuteTimer)
        deleteByValueOnce(this.carrying, ResourceBlock.Meal)
        this.hunger = 0
    }

    private combatting: Citizen = null
    engageHostile(hostile: Citizen) {
        // console.log("ENGAGE HOSTILE", { hostile })
        this.combatting = hostile
        if (!hostile.engagedInCombat) {
            hostile.engageHostile(this)
        }
    }

    get engagedInCombat() {
        // console.log("is engaged in combat", { enemyCombatant: this.combatting })
        return this.combatting !== null // && this.combatting.health > 0
    }

    distanceToHostile(): number { 
        return this.combatting.getWorldPos().distance(this.getWorldPos())
    }

    private paceUnit: number = 20
    get idealCombatRange() {
        // let paceUnit = 20
        let idealDistance = 20 * this.paceUnit
        return idealDistance
    }

    get hostileDirectionSign() {
        let enemy = this.combatting.getWorldPos()
        let self = this.getWorldPos()
        if (enemy.x > self.x) {
            return 1
        } else {
            return -1
        }
    }

    async followHostile() {
        // let paceUnit = 20
        let idealDistance = this.idealCombatRange //20 * paceUnit
        let enemy = this.combatting.getWorldPos().clone()
        // if (!(target.y === this.y)) {
            // we may need to path to it?
        // }

        let self = this.getWorldPos().clone()
        let nextGoal = self.clone()
        let unit = this.paceUnit * 5
        if (this.distanceToHostile() > idealDistance) {
            if (enemy.x > self.x) {
                nextGoal.x += unit

                // target.x += 5 //= target.x - idealDistance
            } else if (enemy.x < self.x) {
                nextGoal.x -= unit
                // target.x -= 5 //= enemy.x + idealDistance
            }

            await this.glideTo(nextGoal) //this.combatting.pos)
        }

        // if (Math.floor(this.x) !== Math.floor(target.x)) {
        // }
    }

    // bullets: Actor[]
    firing: boolean = false
    async fire() {
        if (!this.firing) {
            await sleep(Math.random() * 1000)
            console.log("FIRE!!!")
            // launch a (few) projectile(s)!!!
            let numTimes = range(sample(range(5)))
            for (let times in numTimes) {
                await this.progressBar(100)
                if (!this.isKilled() && this.combatting && !this.combatting.isKilled()) {
                    this.firing = true
                    let bullet = this.assembleBullet()
                    this.scene.add(bullet)
                    this.scene.addTimer(new Timer(() => { bullet.kill() }, 1500))
                    this.firing = false
                }
            }
        }
    }

    private assembleBullet() {
        let hostileDir = this.hostileDirectionSign
        let bullet = new Actor(this.pos.x + 42 * hostileDir, this.pos.y - 10, 14, 0.5)
        bullet.color = Color.Cyan
        bullet.vel.x = 450 * hostileDir //this.hostileDirectionSign
        bullet.vel.y = (Math.random() * 10) - 5 //750 * hostileDir //this.hostileDirectionSign
        bullet.on('collisionstart', (collision) => {
            // console.log("COLLISION", { collision })
            if (collision.other instanceof Citizen) {
                if (this.evil !== collision.other.evil) {
                    if (Math.random() > 0.3) {
                        console.log("someone got hit!", { person: collision.other.name })
                        bullet.kill()
                        collision.other.injure(Math.random() * 10)
                    }
                }
            }
        })
        bullet.collisionType = CollisionType.Passive
        // bullet.isKilled
        return bullet
    }

    injure(amt: number) {
        this.health -= amt
        if (this.health <= 0) {
            this.kill()
        }
    }
}