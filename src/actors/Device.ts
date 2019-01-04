import { Actor, Label, Color, Vector } from "excalibur";
import { Machine } from "../models/Machine";
import { Building } from "./Building";
import { ResourceBlock, blockColor } from "../models/Economy";
import { Citizen } from "./Citizen";
import { Planet } from "./Planet/Planet";
import { allStructures } from "../models/Structure";
import { getVisibleDeviceSize } from "../values/DeviceSize";
import { Recipe, Storage } from "../models/MechanicalOperation";
import { range, deleteByValueOnce } from "../Util";

interface RetrieveResource {
    type: 'retrieve'
    resource: ResourceBlock
    // count: number
}

export function retrieveResource(res: ResourceBlock): RetrieveResource {
    return {
        type: 'retrieve',
        resource: res,
        // count: 1
    }
}

export type InteractionRequest = RetrieveResource // | ...

export class Device extends Actor {
    // could also use for storage?
    product: ResourceBlock[] = []
    nameLabel: Label
    image: any
    building: Building
    inUse: boolean = false

    imageLoaded: boolean = false

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
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        if (this.imageLoaded) {
        ctx.drawImage(
            this.image,
            this.pos.x - this.getWidth() / 2,
            this.pos.y - this.getHeight() / 2 - 10,
            this.getWidth(), this.getHeight()
        )
        }

        let showLabel = true
        if (showLabel) {
            this.nameLabel.pos = this.getCenter()
            this.nameLabel.pos.x -= 10
            this.nameLabel.pos.y += 8 + this.getHeight()/2
            this.nameLabel.draw(ctx, delta)
        }

        let bx = this.x - this.getWidth()/2 + 5, by = this.y - 23
        let blockSize = 5
        this.product.forEach((produced, index) => {
            ctx.fillStyle = blockColor(produced).desaturate(0.3).lighten(0.2).toRGBA();
            ctx.fillRect(bx + blockSize * index, by - blockSize, blockSize-1, blockSize-1)
        })
    }
    get operation() { return this.machine.operation }

    //isSinkFor(it: ResourceBlock) {
    //    if (this.operation.type === 'recipe') {
    //        return this.operation.consumes.includes(it) // === it
    //    }

    //    if (this.operation.type === 'store') {
    //        return this.operation.stores.includes(it) &&
    //          this.product.length < this.operation.capacity
    //    }

    //    return false;
    //}

    async interact(citizen: Citizen, request: InteractionRequest): Promise<boolean> {
        if (this.inUse) {
            citizen.waitToUse(this)
            return false
        }

        let worked = false
        let op = this.operation
        if (op.type === 'recipe') {
            let recipe: Recipe = op
            // do we have all the things?
            if (citizen.carrying.some(it => recipe.consumes.includes(it))) {
                this.inUse = true
                if (citizen.isCarryingUnique(recipe.consumes)) {
                    recipe.consumes.forEach(consumed => citizen.drop(consumed))
                    await citizen.progressBar(recipe.workTime)
                    citizen.carry(recipe.produces)

                    worked = true
                } else {
                    console.log("not carrying all requirements?", { requires: recipe.consumes, has: citizen.carrying })
                }
                this.inUse = false
            }
        } else if (op.type === 'store') {
            // accept it! (whatever you have that matches...?)
            let store: Storage = op
            if (request) { // assume dispense request for now?
                this.inUse = true
                worked = this.dispense(citizen, request)
                if (worked) {
                    await citizen.progressBar(500)
                }
                this.inUse = false
            } else if (citizen.carrying.some(it => store.stores.includes(it))) { // maybe trying to store?
                if (this.product.length < store.capacity) {
                    let res = null
                    if (store.stores.some(stored => { res = citizen.drop(stored); return res })) {
                        if (res) {
                            this.product.push(res)
                            this.building.redeem(res)
                            worked = true
                        }
                    }
                } else {
                    console.warn("no capacity in this store!!")
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

    private dispense(citizen: Citizen, request: InteractionRequest) {
        if (request && request.type === 'retrieve') {
            let canFulfill = this.product.find(p => p === request.resource)
            if (canFulfill) {
                deleteByValueOnce(this.product, request.resource)
                citizen.carry(request.resource)
                return true
            }
        }
        return false
    }

    public produce(step: number) {
        if (this.machine.operation.type === 'generator') {
            if (step % this.machine.operation.generationTime === 0) {
                if (this.product.length < this.machine.operation.capacity) {
                    this.product.push(this.machine.operation.generates)
                }
            }

        } else if (this.machine.operation.type === 'spawn') {
            setTimeout(() => this.building.populate(this.pos), 100)
        }
    }

    // todo only snap when close enough? try to prevent some mis-clicks?
    snap(planet: Planet, pos: Vector = this.pos) {
        let bldg = planet.colony.closestBuildingByType(pos,
            // hmmm
            allStructures,
            // machines count < device slots count
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

        if (snapped) {  //bldg && d < 300) {
            this.building = bldg;
            this.pos = this.building.nextDevicePlace().position
            //devicePlaces()[
            //    this.building.devices.length
            //]
        } else {
            this.pos = pos
        }

        return snapped //!!bldg;
    }

    // finalize() {
    // this.building.devices.push(this)
    // }
}