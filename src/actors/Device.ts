import { Actor, Label, Color, Vector } from "excalibur";
import { Machine, MachineOperation } from "../models/Machine";
import { Building } from "./Building";
import { ResourceBlock, blockColor } from "../models/Economy";
import { Citizen } from "./Citizen";

const bookshelfSvg = require('../images/bookshelf-plain.svg');
//import Book from '../images/bookshelf-plain.svg'
//
//const images = {
//    books
//}

export class Device extends Actor {
    product: ResourceBlock[] = []
    capacity: number = 4

    // private machine: typeof Machine
    nameLabel: Label

    image: any
    imageLoaded: boolean = false

    constructor(
        public building: Building, private machine: Machine, private initialPos: Vector
    ) {
        super(
            initialPos.x,
            initialPos.y,
            machine.width,
            machine.height,
            machine.color
        )

        this.nameLabel = new Label(this.machine.name, 0, 0, 'Helvetica')
        this.nameLabel.fontSize = 8
        this.nameLabel.color = Color.White

        this.image = new Image();
        this.image.onload = function () {
             this.imageLoaded = true
        }
        
        let path = "http://upload.wikimedia.org/wikipedia/commons/d/d2/Svg_example_square.svg";
        console.log({ desiredPath: bookshelfSvg })
        // debugger
        this.image.src = bookshelfSvg

    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        // if (this.imageLoaded) {
            ctx.save()
            ctx.translate(this.pos.x, this.pos.y)
            ctx.scale(0.1, 0.1)
            ctx.drawImage(
                this.image,
                0,0
            )
            ctx.restore()
        // }

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
        if (this.machine.behavior === MachineOperation.Work) {
            if (this.product.length > 0) {
                this.product.pop()
                await citizen.progressBar(200) //this.productionTime)
                citizen.carry(this.produces)
            } else {
                if (this.consumes && citizen.carrying === this.consumes) {
                    await citizen.progressBar(this.productionTime)
                    citizen.carry(this.produces)
                }
            }
        } else if (this.machine.behavior === MachineOperation.CollectResource) {
            // assume we are gathering a resource here?
            let resource = citizen.drop()
            if (resource) {
                this.building.redeem(resource) //planet.gather(resource)
            }
        }
    }

    public produce(step: number) {
        if (step % this.productionTime === 0) {
            if (this.machine.behavior === MachineOperation.Work) {

                if (this.produces && !this.consumes && this.product.length < this.capacity) {
                    this.product.push(this.produces)
                }
            } else if (this.machine.behavior === MachineOperation.SpawnCitizen) {
                setTimeout(() => this.building.populate(this.pos), 100)
            }
        }
    }

}