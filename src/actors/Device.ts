import { Actor, Label, Color, Vector } from "excalibur";
import { Machine } from "../models/Machine";
import { Building } from "./Building";
import { ResourceBlock, blockColor, emptyMarket } from "../models/Economy";
import { Citizen } from "./Citizen";
import { Planet } from "./Planet/Planet";
import { allStructures } from "../models/Structure";
import { getVisibleDeviceSize } from "../values/DeviceSize";
import { Recipe, ResourceStorage, MechanicalOperation, ResourceGenerator } from "../models/MechanicalOperation";
import { range, deleteByValueOnce } from "../Util";
import { drawRect } from "../Painting";
import { InteractionRequest } from "../values/InteractionRequest";

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
            machine.color
        )

        this.nameLabel = new Label(this.machine.name, 0, 0, 'Helvetica')
        this.nameLabel.fontSize = 6
        this.nameLabel.color = Color.White

        this.image = new Image();
        this.image.onload = () => { this.imageLoaded = true }
        this.image.src = machine.image

        this.on('pointerenter', () => {
            // console.log("HOVER ON", { device: this })
            this.hover = true
            if (this.building) {
                // setInterval(() => {
                this.building.planet.currentlyViewing = this
                // }, 75)
            }
        })

        this.on('pointerdown', () => {
            // console.log("CLICKED DEVICE", { device: this })
            // this.toggleActive();
        })

        this.on('pointerleave', () => {
            this.hover = false
            if (this.building) {
                this.building.planet.currentlyViewing = null
            }
        })
    }

    get imageX() { return this.pos.x - this.getWidth() / 2 }
    get imageY() { return this.pos.y - this.getHeight() / 2 - 10 }

    get economy() { return this.built ? this.machine.economy : emptyMarket() }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        if (this.imageLoaded) {
            if (!this.built) { ctx.globalAlpha = 0.5 }
            ctx.drawImage(
                this.image,
                this.imageX,
                this.imageY,

                this.getWidth(),
                this.getHeight()
            )
            if (!this.built) { ctx.globalAlpha = 1.0 }

            if (this.hover) {
                let c = Color.White.clone()
                c.a = 0.6
                drawRect(
                    ctx,
                    { x: this.imageX, y: this.imageY, width: this.getWidth(), height: this.getHeight() },
                    0,
                    c
                )
            }
        }

        let iv = new Vector(this.imageX, this.imageY)

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
    }

    get name() { return this.machine.name }
    get description() { return this.machine.description }
    get size() { return this.machine.size }
    get operation() { return this.machine.operation }

    async assemble(citizen: Citizen) {
        if (citizen.isCarryingUnique(this.machine.cost)) {
            for (let res of this.machine.cost) {
                await citizen.progressBar(1000)
                citizen.drop(res)
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
        } else if (op.type === 'store') {
            // accept it! (whatever you have that matches...?)
            let store: ResourceStorage = op
            if (request && request.type === 'retrieve') { // assume dispense request for now?
                this.inUse = true
                worked = this.dispense(citizen, request)
                if (worked) {
                    await citizen.progressBar(500)
                }
                this.inUse = false
            } else if (request && request.type === 'store' &&
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
        }

        return worked
    }

    getEffectiveOperationalCapacity(op: ResourceGenerator | ResourceStorage) {
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
        let bldg = planet.colony.closestBuildingByType(pos,
            allStructures,
            (bldg: Building) => {
                let hasSpace = bldg.hasPlaceForDevice()
                return hasSpace && bldg.structure.machines.some(Machine => this.machine instanceof Machine)

            }
        )

        let snapped = false
        if (bldg) {
            let spot = bldg.nextDevicePlace().position
            let d = spot.distance(pos)
            snapped = d < 150
        }

        if (snapped) {
            this.building = bldg;
            this.pos = this.building.nextDevicePlace().position
        } else {
            this.pos = pos
        }

        return snapped
    }
}