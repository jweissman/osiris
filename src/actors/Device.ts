import { Actor, Label, Color, Vector } from "excalibur";
import { Machine } from "../models/Machine";
import { Building } from "./Building";
import { ResourceBlock, blockColor, emptyMarket, sumMarkets } from "../models/Economy";
import { Citizen } from "./Citizen";
import { Planet } from "./Planet/Planet";
import { allStructures } from "../models/Structure";
import { getVisibleDeviceSize, DeviceSize } from "../values/DeviceSize";
import { Recipe, ResourceStorage, MechanicalOperation, ResourceGenerator, ExploreForResource } from "../models/MechanicalOperation";
import { range, deleteByValueOnce, closest } from "../Util";
import { drawRect } from "../Painting";
import { InteractionRequest, retrieveResource } from "../values/InteractionRequest";
import { Game } from "../Game";
import { Rectangle } from "../values/Rectangle";

export class Device extends Actor {
    // constructionMaterials: ResourceBlock[] = []

    // could also use for storage?
    product: ResourceBlock[] = []
    nameLabel: Label
    image: HTMLImageElement
    building: Building
    inUse: boolean = false
    hover: boolean = false

    imageLoaded: boolean = false

    built: boolean = false
    reserved: boolean = false

    constructor(
        public machine: Machine,
        initialPos: Vector
    ) {
        super(
            initialPos.x,
            initialPos.y,
            getVisibleDeviceSize(machine.size),
            getVisibleDeviceSize(machine.size),
            Color.Transparent
            // machine.color
        )

        this.nameLabel = new Label(this.machine.name, 0, 0, Game.font) // 'Helvetica')
        this.nameLabel.fontSize = this.machine.size === DeviceSize.Tiny ? 2 : 6
        this.nameLabel.color = Color.White

        this.image = new Image();
        this.image.onload = () => { this.imageLoaded = true }
        this.image.src = machine.image

        this.on('pointerenter', () => {
            // console.log("HOVER OVER", { machine: this.machine })
            this.hover = true
            let tinyDevices = this.tinyDevices.length > 0 &&
              this.tinyDevices.some(d => d.hover)
            if (this.building && !tinyDevices) {
                this.building.planet.currentlyViewing = this
            }
        })

        this.on('pointerleave', () => {
            this.hover = false
            if (this.building && this.building.planet.currentlyViewing === this) {
                this.building.planet.currentlyViewing = null
            }
        })
    }

    get imageX() { return this.pos.x - this.getWidth() / 2 }
    get imageY() { return this.pos.y - this.getHeight() / 2 } //- 10 }

    get economy() { return this.built ? this.computeEconomy() : emptyMarket() }

    private computeEconomy() {
        let econs = [ this.machine.economy, ...this.tinyDevices.map(d => d.economy) ]
        return econs.reduce(sumMarkets, emptyMarket())
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        if (this.imageLoaded) {
            ctx.save()
            if (!this.built) { ctx.globalAlpha = 0.5 }
            ctx.translate(this.imageX, this.imageY)
            if (this.vel.x > 0) {
                // flip? (assume we're drawn facing left)
                ctx.translate(this.getWidth(), 0)
                ctx.scale(-1,1)
            }
            ctx.drawImage(
                this.image,
                0,
                0, //this.imageY,

                this.getWidth(),
                this.getHeight()
            )
            // if (!this.built) { ctx.globalAlpha = 1.0 }

            let c = Color.Transparent.clone()
            if (this.hover) {
                c = Color.White.clone()
                c.a = 0.5
            }
            if (!(this.size === DeviceSize.Tiny || this.placed) && this.overlapsAny()) {
                c = Color.Red.clone()
                c.a = 0.3
            }

            // if (this.hover || this.overlapsAny()) {
                // let c = Color.White.clone()
                // c.a = 0.6
                drawRect(
                    ctx,
                    { x: 0, y: 0, width: this.getWidth(), height: this.getHeight() },
                    0,
                    c
                )
            // }
            ctx.restore()
        }

        let iv = new Vector(this.imageX, this.imageY + this.getHeight() / 8)

        let showLabel = true
        if (showLabel) {
            this.nameLabel.pos = iv
            this.nameLabel.draw(ctx, delta)
        }

        let { x: bx, y: by } = iv
        let blockSize = 5
        let yOff = this.nameLabel.fontSize
        this.product.forEach((produced, index) => {
            ctx.fillStyle = blockColor(produced).toRGBA()
            ctx.fillRect(bx + blockSize * index, by - blockSize + yOff, blockSize-1, blockSize-1)
        })

        super.draw(ctx ,delta)
        // this.tinyDevices.forEach(d => d.draw(ctx, delta))
    }

    get name() { return this.machine.name }
    get description() { return this.machine.description }
    get size() { return this.machine.size }
    get operation() { return this.machine.operation }

    async assemble(citizen: Citizen) {
        if (citizen.isCarryingUnique(this.machine.cost)) {
            for (let res of this.machine.cost) {
                citizen.drop(res)
                await citizen.progressBar(3000)
            }
            this.built = true
        }
    }

    async interact(citizen: Citizen, request: InteractionRequest): Promise<boolean> {
        if (this.inUse || !this.built) {
            return false
        }

        let worked = false
        let op = this.operation
        if (op.type === 'recipe' && request.type === 'work') {
            let recipe: Recipe = op
            // do we have all the things?
            if (citizen.carrying.some(it => recipe.consumes.includes(it))) {
                this.inUse = true
                if (citizen.isCarryingUnique(recipe.consumes)) {
                    recipe.consumes.forEach(consumed => citizen.drop(consumed))
                    let workTime = this.getEffectiveWorkTime(recipe)
                    await citizen.progressBar(workTime) // recipe.workTime)
                    citizen.carry(recipe.produces)

                    worked = true
                } else {
                    console.warn("not carrying all requirements?", { requires: recipe.consumes, has: citizen.carrying })
                }
                this.inUse = false
            }
        } else if ((op.type === 'store' || op.type === 'explore') && (request.type === 'retrieve' || request.type === 'store')) {
            // accept it! (whatever you have that matches...?)
            let storeOrExplore: ResourceStorage | ExploreForResource = op
            if (request && request.type === 'retrieve') { // assume dispense request for now?
                this.inUse = true
                await citizen.progressBar(1000)
                worked = this.dispense(citizen, request)
                //if (worked) {
                //    await citizen.progressBar(500)
                //}
                this.inUse = false
            } else {
                if (storeOrExplore.type === 'store') {
                    let store: ResourceStorage = storeOrExplore
                    if (request.type === 'store' &&
                        citizen.carrying.some(it => store.stores.includes(it))) { // maybe trying to store?
                        if (this.product.length < this.getEffectiveOperationalCapacity(store)) { // store.capacity) {
                            let res = null
                            if (store.stores.some(stored => { res = citizen.drop(stored); return res })) {
                                if (res) {
                                    this.produceResource(res)
                                    // this.product.push(res)
                                    // this.building.redeem(res)
                                    worked = true
                                }
                            }
                        }
                    }
                } else {
                    console.warn("no capacity in this store!!")
                    worked = false
                }
            }
        } else if (op.type === 'generator') {
            this.inUse = true
            worked = this.dispense(citizen, request)
            if (worked) {
                await citizen.progressBar(500)
            }
            this.inUse = false
        } else if (op.type === 'explore') {
            this.inUse = true
            let origX = this.pos.x
            let groundSpeed = Game.citizenSpeed * 3
            citizen.drive(this)
            let xOff = 25000 * (Math.random() > 0.5 ? -1 : 1)
            await this.actions.moveTo(this.pos.x + xOff, this.pos.y, groundSpeed).asPromise()
            await citizen.progressBar(5000)
            this.produceResource(op.gathers)
            await this.actions.moveTo(origX, this.pos.y, groundSpeed).asPromise()
            worked = true
            citizen.stopDriving()
            this.inUse = false
        }

        return worked
    }



    getEffectiveOperationalCapacity(op: ResourceGenerator | ResourceStorage | ExploreForResource) {
        let bonus = this.building.spaceFunction
            ? this.building.spaceFunction.bonuses.capacity 
        : 0
        return op.capacity + bonus
    }

    getEffectiveWorkTime(op: Recipe) {
        let bonus = this.building.spaceFunction 
         ? this.building.spaceFunction.bonuses.workSpeed
         : 1

        return Math.round(op.workTime * (1/bonus))
    } 


    private dispense(citizen: Citizen, request: InteractionRequest) {
        if (request && request.type === 'retrieve') {
            let canFulfill = this.product.find(p => p === request.resource)
            if (canFulfill) {
                deleteByValueOnce(this.product, request.resource)
                citizen.carry(request.resource)
                this.building.debit(request.resource)
                return true
            }
        }
        return false
    }

    public tryProduce(step: number) {
        if (this.building.isActive && this.built) {
            if (this.machine.operation.type === 'generator') {
                if (step % this.machine.operation.generationTime === 0) {
                    if (this.product.length < this.machine.operation.capacity) {
                        this.produceResource(this.machine.operation.generates)
                    }
                }

            } else if (this.machine.operation.type === 'spawn') {
                if (step % 1000 == 0) {
                    // console.log("WOULD SPAWN")
                    setTimeout(() => this.building.populate(this.pos.add(this.building.pos)), 100)
                }
            }
        }

    }

    public produceResource(res: ResourceBlock) {
        this.product.push(res)
        this.building.redeem(res)
    }

    snap(planet: Planet, pos: Vector = this.pos) {
        if (this.size === DeviceSize.Tiny) { // or large...
            return this.snapTiny(planet, pos)
        } else {
            console.log("attempt to snap device...")
            let bldg = planet.colony.closestBuildingByType(pos,
                allStructures,
                (bldg: Building) => {
                    // let hasSpace = bldg.hasPlaceForDevice()
                    let compatible = bldg.structure.machines.some(Machine => this.machine instanceof Machine)
                    return compatible

                }
            )

            let snapped = false
            let halfSize = getVisibleDeviceSize(this.size) / 2
            if (bldg) {
                // console.log("we have a building!", { bldg })
                let spot = bldg.getCenter()
                let d = spot.distance(pos)
                snapped = d < (bldg.getWidth()/2 - halfSize) && (Math.abs(spot.y - pos.y) < 80)
            } else {
                // console.log("no bldg found")
            }

            if (snapped) {
                this.building = bldg;
                this.pos = pos //.x //this.building.nextDevicePlace().position
                let gridGrain = halfSize
                this.pos.x += bldg.x
                this.pos.x = Math.floor(this.pos.x / gridGrain) * gridGrain
                this.pos.x -= bldg.x
                this.pos.x = Math.max(
                    bldg.x,
                    this.pos.x
                )
                this.pos.x = Math.min(
                    bldg.x + bldg.getWidth() - halfSize,
                    this.pos.x
                )
                this.pos.y = bldg.floorY - getVisibleDeviceSize(this.size)/2 //getCenter().y + (bldg.getHeight()/8)
            } else {
                this.pos = pos
            }

            // let overlapping = !this.overlapsAny()

            return snapped // && !overlapping
        }
    }

    public overlapsAny(): boolean {
        if (this.building) {
            return !!this.building.planet.colony.findAllDevices().find(device => device !== this && this.overlaps(device))
        } else {
            return true
        }
    }

    private overlaps(other: Device): boolean {
        let rect1 = this.aabb(), rect2 = other.aabb();
        let doesOverlap = (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        )
        return(!!doesOverlap);
    }

    placed: boolean = false
    private aabb(): Rectangle {
        let pos = this.pos.clone()
        if (this.placed) {
            pos.addEqual(this.building.pos)
        }
        return {
            x: pos.x,
            y: pos.y,
            width: this.getWidth(),
            height: this.getHeight()
        }
    }
    // private overlapsAny()

    private snapTiny(planet: Planet, pos: Vector) {
        // okay, we need the closest building with any built machine that HAS a tiny slot
        let bldg = planet.colony.closestBuildingByType(pos,
            allStructures,
            (bldg: Building) => bldg.getDevices().some(
                (device: Device) => device.built && device.hasTinyPlace()
            )
        )

        if (!bldg) {
            return false
        }

        // todo look at all devices? (closest bldg may not house closest device!!)
        let device: Device = closest(
            pos,
            bldg.getDevices().filter((d: Device) => d.built && d.hasTinyPlace()),
            (d: Device) => d.pos,
        )

        this.pos = pos
        let snapped = false
        if (device) {
            let spot = device.nextTinyPlace().add(device.pos).add(device.building.pos)
            let d = spot.distance(pos)
            snapped = d < 50

            if (snapped) {
                this.building = device.building
                this.parentDevice = device
                this.pos = spot
            }
        }

        return snapped
    }

    public parentDevice: Device = null
    tinyDevices: Device[] = []
    private hasTinyPlace() {
        if (!this.machine.tinySlots) {
            return false
        } else {
            return this.tinyDevices.length < 3
        }
    }

    private nextTinyPlace() {
        let tx0 = -this.getWidth()/3, ty0 = -3
        let ndx = this.tinyDevices.length
        return new Vector(tx0 + (ndx * 14), ty0)
    }

    public addTinyDevice(device: Device) {
        // console.log("ADD TINY DEVICE", { device: device.machine })
        device.pos = this.nextTinyPlace() //.add(this.pos)
        // device.pos.addEqual(this.pos.add(this.nextTinyPlace()))
        this.tinyDevices.push(device)
        this.add(device)
    }
}