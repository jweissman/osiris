import { Actor, Color, Traits, Vector, VisibleEvent, Label, CollisionType, Timer, EmitterType, ParticleEmitter } from "excalibur";
import { Building } from "./Building";
import { Planet } from "./Planet/Planet";
import { ResourceBlock, blockColor } from "../models/Economy";
import { Game } from "../Game";
import { eachCons, deleteByValueOnce, sleep, containsUniq, deleteByValue, sample, range } from "../Util";
import { Device } from "./Device";
import { Scale } from "../values/Scale";
import { ProductionStrategy } from "../strategies/ProductionStrategy";
import { CapacityBasedProduction } from "../strategies/CapacityBasedProduction";
import { drawStar, drawRect, drawCircle, drawEllipse, drawText, drawLine } from "../Painting";
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
import { LaserBeam } from "./LaserBeam";

export class Citizen extends Actor {
    alive: boolean = true

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

    private bloodEmitter: ParticleEmitter

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

        if (this.evil) {
            this.shirtColor = Color.Black.clone()
        }

        this.skinColor = sample([
            Color.Orange.lighten(0.5),
            Color.Orange.lighten(0.6),
            Color.Orange.lighten(0.7),
            Color.Orange.lighten(0.8),
        ])

        this.weight = sample(range(7).map(w => w + 4)) //[ 5, 6, 7, 8, 9, 10 ])

        // this.nameLabel = new Label(name, this.pos.x, this.pos.y, Game.font)
        // this.add(this.nameLabel)

        this.collisionType = CollisionType.Passive
        // this.collisionArea
        this.bloodEmitter = this.makeBloodEmitter();  // should the emitter be emitting

        // add the emitter as a child actor, it will draw on top of the parent actor
        // and move with the parent
        this.add(this.bloodEmitter);
    }

    private makeBloodEmitter() {
        let bloodEmitter = new ParticleEmitter();
        bloodEmitter.emitterType = EmitterType.Circle; // Shape of emitter nozzle
        bloodEmitter.radius = 7;
        bloodEmitter.minVel = 10;
        bloodEmitter.maxVel = 30;
        bloodEmitter.minAngle = 0;
        bloodEmitter.maxAngle = Math.PI * 2;
        bloodEmitter.emitRate = 350; // 300 particles/second
        bloodEmitter.opacity = 0.5;
        bloodEmitter.fadeFlag = true; // fade particles overtime
        bloodEmitter.particleLife = 500; // in milliseconds = 1 sec
        bloodEmitter.maxSize = 2; // in pixels
        bloodEmitter.minSize = 1;
        bloodEmitter.beginColor = Color.Red.darken(0.12);
        bloodEmitter.endColor = Color.Red.darken(0.36);
        bloodEmitter.isEmitting = false;
        return bloodEmitter
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

    get isEvil(): boolean { return !!this.evil }

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

        if (this.combatting && !this.combatting.alive) { //isKilled()) {
            console.warn("enemy was killed?", this.combatting)
            this.combatting = null
        }

        if (this.sleeping) {
            // heal during sleep
            this.health = Math.min(100, this.health+0.1)
            this.energy = Math.min(100, this.energy+0.1)
            if (this.health === 100 && !this.isTired) { //} && this.planet.hour > 6) {
                this.sleeping = false
                this.abortProgressBar()
            }
        }
    }


    draw(ctx: CanvasRenderingContext2D, delta: number) {

        let { x, y } = this
        ctx.save()
        ctx.translate(x, y - this.getHeight()/2) // - 5)

        if (this.alive) {
            drawText(ctx, this.name, -14, -22)

            if (this.health < 100) {
                let healthColor = this.health > 60 ? Color.Green : Color.Yellow
                if (this.health < 10) { healthColor = Color.Red }
                this.drawBar(ctx, -13, -18, 32, 4, (this.health / 100), healthColor)
            }

            if (this.guarding) {
                let c = Color.Cyan.clone()
                c.a = 0.3
                drawCircle(ctx, 2, 2, 24, c) //Color.Cyan)
            }
        }

        if (this.sleeping || !this.alive) {
            ctx.rotate(-Math.PI / 2);
            if (this.sleeping) {
                ctx.translate(5, -10)
            } else {
                ctx.translate(-5, 0)
            }
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

        if (this.combatting) {
            // drawLine(ctx, this.combatting.pos, this.pos, Color.Red, 4)
        }


        super.draw(ctx, delta)
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

    }

    async progressBar(duration: number) {
        this.workInProgress = true
        this.workStarted = (new Date()).getTime()
        this.workDuration = duration
        await new Promise((resolve, reject) => setTimeout(resolve, duration));
        this.workInProgress = false
    }

    abortProgressBar() {
        this.log("work in progress aborted...!")
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
        // if (this.currentBuilding != device.building) {
            await this.pathTo(target)
        // }
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
                path.map(step => {
                    // if we are engaged in combat, and enemy is at same level

                    // let engaged = this.engagedInCombat

                    // if (engaged) { 
                    //     let dy = Math.abs(this.combatting.y - this.y) // < 10
                    //     if (dy < 40) {
                    //     // don't try to glide around anymore? (maybe make this action q and we can clear if need be???)
                    //     // this.path = []
                    //         this.log("not following path, engaged in combat")
                    //         return
                    //     }
                    // } //else {
                    this.log("glide to next step")
                    this.glideTo(step)
                    // }
                })
            )
            this.path = []
        }
    }
    
    protected get strategies() {
        return [
            this.fightingStrategy,
            ...(this.evil ? [] : [this.sleepingStrategy]),
            ...(this.evil ? [] : [this.eatingStrategy]),
            ...(this.evil ? [] : [this.constructionStrategy]),
            ...(this.evil ? [] : [this.productionStrategy])
        ]
    }

    async work() {
        if (this.isPlanning || this.sleeping || !this.alive) { return }
        this.isPlanning = true
        if (this.carrying.length > 0) { this.carrying = [] }
        let choice = this.strategies.find(strat => strat.canApply())
        if (choice) {
            await choice.attempt()
        }
        this.isPlanning = false
    }

    async takeRest(duration: number = 8 * 60 * Game.minuteTickMillis) {
        // this.abortProgressBar()
        // this.combatting = null

        this.sleeping = true
        this.progressBar(duration)
        // this.energy = 100
        // this.sleeping = false
    }

    async eat() {
        let thirtyMinuteTimer = 30 * Game.minuteTickMillis
        await this.progressBar(thirtyMinuteTimer)
        deleteByValueOnce(this.carrying, ResourceBlock.Meal)
        this.hunger = 0
    }

    private combatting: Citizen = null

    engageHostile(hostile: Citizen) {
        this.abortProgressBar()
        this.actionQueue.clearActions()
        if (!this.combatting && !this.workInProgress) {
            // this.log(`ENGAGE HOSTILE ${hostile.name}`)
            // this.abortProgressBar()
            this.combatting = hostile
            //if (!hostile.engagedInCombat) {
            //    hostile.engageHostile(this)
            //}
        }
    }

    get enemyCombatant() { return this.combatting }

    get engagedInCombat() {
        // console.log("is engaged in combat", { enemyCombatant: this.combatting })
        return this.combatting !== null // && this.combatting.health > 0
    }

    distanceToHostile(): number { 
        if (this.combatting) {
            return this.combatting.getWorldPos().distance(this.getWorldPos())
        } else {
            return 0
        }
    }

    private paceUnit: number = 20
    get idealCombatRange() {
        // let paceUnit = 20
        let idealDistance = 20 * this.paceUnit
        return idealDistance
    }

    get hostileDirectionSign() {
        if (this.combatting) {
            let enemy = this.combatting.getWorldPos()
            let self = this.getWorldPos()
            if (enemy.x > self.x) {
                return 1
            } else {
                return -1
            }
        } else {
            return 0
        }
    }

    get enemyPosition() { return this.combatting.getWorldPos().clone() }
    // get horiistanceToEnemyLine() {}

    combatMovementUnit: number = this.paceUnit * 5
    firingRangeBuffer: number = this.combatMovementUnit * 2

    tooCloseToEnemyLine(): boolean {
        let dx = Math.abs(this.enemyPosition.x - this.x)
        return dx < this.idealCombatRange - this.firingRangeBuffer
    }

    tooFarFromEnemyLine(): boolean {
        let dx = Math.abs(this.enemyPosition.x - this.x)
        return dx > this.idealCombatRange + this.firingRangeBuffer
    }

    withinFiringRange(): boolean {
        return !(this.tooCloseToEnemyLine() || this.tooFarFromEnemyLine())
    }

    async advanceTowardsEnemy() {
        //let idealDistance = this.idealCombatRange //20 * paceUnit
        //let enemy = this.combatting.getWorldPos().clone()
        //let self = this.getWorldPos().clone()
        let nextGoal = this.getWorldPos().clone()
        let unit = this.combatMovementUnit //paceUnit * 7
        //let dx = Math.abs(enemy.x - self.x) //this.distanceToHostile()
        //let buffer = 3 * unit // * this.paceUnit
        if (this.tooFarFromEnemyLine()) { // dx > idealDistance+buffer) {
            unit *= this.hostileDirectionSign
            this.log(`ADVANCE TOWARD ENEMY LINE`)
            nextGoal.x += unit // enemy.x - (idealDistance * this.hostileDirectionSign)
            await this.glideTo(nextGoal) //this.combatting.pos)
        } else if (this.tooCloseToEnemyLine()) { //dx < idealDistance-buffer) {
            unit *= -this.hostileDirectionSign
            this.log(`RETREAT FROM ENEMY LINE`)
            nextGoal.x += unit // enemy.x - (idealDistance * this.hostileDirectionSign)
            await this.glideTo(nextGoal) //this.combatting.pos)
        }
    }

    // bullets: Actor[]
    firing: boolean = false
    async fire() {
        if (!this.firing) {
            // console.log("FIRE!!!")
            // launch a (few) projectile(s)!!!

            await sleep(500)
            let numTimes = range(sample(range(3)))
            for (let times in numTimes) {
                await this.progressBar(150)
                if (this.alive && this.combatting && this.combatting.alive) {
                    this.firing = true
                    let bullet = this.assembleBullet()
                    this.scene.add(bullet)
                    this.scene.addTimer(new Timer(() => { bullet.kill() }, 2000))
                    this.firing = false
                }
            }
            await sleep(250) //this.progressBar(250)
        }
    }

    guarding: boolean = false
    async guard() {
        if (!this.guarding) {
            // this.guarding = true
            if (this.alive && this.combatting) {
                // await this.progressBar(100)
                this.guarding = true
                await sleep(1500)
                // await this. //progressBar(5000)
                this.guarding = false
            }
        }
    }

    private assembleBullet() {
        let hostileDir = this.hostileDirectionSign
        let bullet = new LaserBeam(this, hostileDir)
        return bullet
    }

    injure(amt: number, attacker: Citizen) {
        if (this.elite) {
            amt = amt * 0.3
        }
        this.health -= amt
        if (this.health <= 0) {
            this.die()
        }
        this.bleed()
        this.engageHostile(attacker)
    }

    die() {
        this.actionQueue.clearActions()
        this.path = []
        this.alive = false
        this.collisionType = CollisionType.Passive
        this.scene.addTimer(new Timer(() => { this.kill() }, 5000))
    }

    bleed() {

        this.bloodEmitter.isEmitting = true
        this.scene.addTimer(new Timer(() => { this.bloodEmitter.isEmitting = false }, 50))

    }

    private fatigue() {
        let unit = 1e-4;
        this.energy -= unit;
        this.hunger += unit;
    }

    log(msg) {
        // console.log(`${this.name}: ${msg}`)
    }
}