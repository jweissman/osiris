import { Actor, Label, Color, Vector } from "excalibur";
import { Machine, MachineOperation } from "../models/Machine";
import { Building, CommonAreaView } from "./Building";
import { ResourceBlock, blockColor } from "../models/Economy";
import { Citizen } from "./Citizen";
import { Planet } from "./Planet/Planet";
import { SmallRoomThree, SmallRoomTwo, MediumRoom, SmallDome, MidDome, LargeRoom } from "../models/Structure";
import { getVisibleDeviceSize } from "../values/DeviceSize";

export class Device extends Actor {
    product: ResourceBlock[] = []
    // capacity: number = 4

    nameLabel: Label

    image: any
    imageLoaded: boolean = false

    building: Building // set once built?

    inUse: boolean = false

    constructor(
        // public building: Building,
        public machine: Machine,
        private initialPos: Vector
    ) {
        super(
            initialPos.x,
            initialPos.y,
            getVisibleDeviceSize(machine.size),
            getVisibleDeviceSize(machine.size),
            // machine.height,
            machine.color
        )

        this.nameLabel = new Label(this.machine.name, 0, 0, 'Helvetica')
        this.nameLabel.fontSize = 6
        this.nameLabel.color = Color.White

        this.image = new Image();
        this.image.onload = function () {
             this.imageLoaded = true
        }
        this.image.src = machine.image
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        // super.draw(ctx, delta)
        ctx.drawImage(
            this.image,
            this.pos.x - this.getWidth() / 2,
            this.pos.y - this.getHeight() / 2 - 10,
            this.getWidth(), this.getHeight()
        )

        let showLabel = true
        if (showLabel) {
            this.nameLabel.pos = this.getCenter()
            this.nameLabel.pos.x -= 10 //ctx.measureText(this.machine.name).width / 2
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

    get produces()       { return this.machine.produces }
    get consumes()       { return this.machine.consumes }
    get workTime()       { return this.machine.workTime }
    get generationTime() { return this.machine.generationTime }
    // get productionTime() { return this.machine.productionTime }
    get capacity()       { return this.machine.capacity }

    async interact(citizen: Citizen) {
        if (this.inUse) {
            citizen.waitToUse(this)
            return
        }

        if (this.product.length > 0) {
            this.product.pop()
            this.inUse = true
            await citizen.progressBar(500) //this.productionTime)
            this.inUse = false
            citizen.carry(this.produces)
        } else {
            if (this.consumes && citizen.carrying === this.consumes) {
                this.inUse = true
                await citizen.progressBar(this.workTime)
                citizen.carry(this.produces)
                this.inUse = false
            }
        }

        if (this.machine.behavior === MachineOperation.Work) {
            // ...

        } else if (this.machine.behavior === MachineOperation.CollectResource) {
            // generic redeem..
            let resource = citizen.drop()
            if (resource) {
                this.building.redeem(resource)
            }
        } else if (this.machine.behavior === MachineOperation.CollectMeals) {
            // store a meal...
            if (citizen.carrying === ResourceBlock.Meal) {
                let resource = citizen.drop()
                if (resource) {
                    this.building.redeem(resource)
                }
            }
        } else if (this.machine.behavior === MachineOperation.CollectData) {
            // store research
            if (citizen.carrying === ResourceBlock.Data) {
                let resource = citizen.drop()
                if (resource) {
                    this.building.redeem(resource)
                }
            }
        } else {
            console.warn("no handler for this interaction", { device: this })
        }
    }

    public produce(step: number) {
        if (step % this.generationTime === 0) {
            if (this.machine.behavior === MachineOperation.Work) {

                if (this.produces && !this.consumes && this.product.length < this.capacity) {
                    this.product.push(this.produces)
                }
            } else if (this.machine.behavior === MachineOperation.SpawnCitizen) {
                setTimeout(() => this.building.populate(this.pos), 100)
            }
        }
    }

    // todo only snap when close enough? try to prevent some mis-clicks?
    snap(planet: Planet, pos: Vector = this.pos) {
        let bldg = planet.colony.closestBuildingByType(pos,
            // hmmm
            [SmallDome, MidDome, SmallRoomTwo, SmallRoomThree, MediumRoom, LargeRoom],
            // machines count < device slots count
            (bldg: Building) => {
                let hasSpace = bldg.hasPlaceForDevice()
                return hasSpace && bldg.structure.machines.some(Machine => this.machine instanceof Machine)

            }
        )

        if (bldg) {
            this.building = bldg;
            this.pos = this.building.nextDevicePlace().position
            //devicePlaces()[
            //    this.building.devices.length
            //]
        }

        return !!bldg;
    }

    finalize() {
        // this.building.devices.push(this)
    }
}