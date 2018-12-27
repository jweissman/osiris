import { Actor, Label, Color } from "excalibur";
import { Machine } from "../models/Machine";
import { Building } from "./Building";
import { ResourceBlock, blockColor } from "../models/Economy";
import { Citizen } from "./Citizen";

export class Device extends Actor {
    product: ResourceBlock[] = []
    capacity: number = 4

    // private machine: typeof Machine
    nameLabel: Label

    constructor(public building: Building, private machine: Machine) {
        super(
            building.devicePlaces()[0].x, // - building.pos.x,
            building.devicePlaces()[0].y, // - building.pos.y,
            machine.width,
            machine.height,
            machine.color
        )

        this.nameLabel = new Label(this.machine.name, 0, 0, 'Helvetica')
        this.nameLabel.fontSize = 8
        this.nameLabel.color = Color.White
    }

    draw(ctx, delta) {
        super.draw(ctx, delta)

        let showLabel = true
        if (showLabel) {
            this.nameLabel.pos = this.getCenter()
            this.nameLabel.pos.x -= ctx.measureText(this.machine.name).width / 2
            this.nameLabel.pos.y -= 20
            this.nameLabel.draw(ctx, delta)
        }

        let bx = this.x - this.getWidth()/2, by = this.y - 10
        let blockSize = 5
        this.product.forEach((produced, index) => {
            ctx.fillStyle = blockColor(produced).desaturate(0.3).lighten(0.2).toRGBA();
            ctx.fillRect(bx + blockSize * index, by - blockSize, blockSize-1, blockSize-1)
        })


    }
    get produces()       { return this.machine.produces }
    get consumes()       { return this.machine.consumes }
    get productionTime() { return this.machine.productionTime }


    async interact(citizen: Citizen) {
        if (this.product.length > 0) {
            citizen.carry(this.produces)
            this.product.pop()
        } else {
            if (this.consumes && citizen.carrying === this.consumes) {
                await citizen.progressBar(this.productionTime)
                citizen.carry(this.produces)
            } else {
                // assume we are gathering a resource here?
                let resource = citizen.drop()
                if (resource) {
                    this.building.redeem(resource) //planet.gather(resource)
                }
            }
        }
    }

    public produce(step: number) {
        if (this.produces && !this.consumes && step % this.productionTime === 0) {
            let shouldProduce = true;
            if (shouldProduce && this.product.length < this.capacity) {
                this.product.push(this.produces)
                console.log("PRODUCE", { produces: this.produces, product: this.product })
            }
        }
    }

}