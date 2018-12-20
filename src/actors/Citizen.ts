import { Actor, Color, Traits, Vector } from "excalibur";
import { Building } from "./Building";
import { Planet } from "./Planet/Planet";
import { Structure, MissionControl, Laboratory, Mine, Dome, Kitchen } from "../models/Structure";
import { ResourceBlock, blockColor } from "../models/Economy";

export class Citizen extends Actor {
    walkSpeed: number = 200
    carrying: ResourceBlock = null
    path: Vector[] = []

    constructor(building: Building, protected planet: Planet) {
        super(building.nodes()[0].x,building.nodes()[0].y,4,10,Color.White)
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling))
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)
        if (this.carrying) {
            ctx.fillStyle = blockColor(this.carrying).toRGBA()
            ctx.fillRect(this.x+4, this.y-3, 5, 5)
        }
    }

    carry(c: ResourceBlock) { //c: Color) {
        this.carrying = c;
    }

    drop() {
        if (this.carrying) {
            let c = this.carrying; //.clone();
            this.carrying = null;
            return c
        }
        return true
    }

    glideTo(pos: Vector) {
        return this.actions.moveTo(pos.x, pos.y, this.walkSpeed).asPromise()
    }

    async walkTo(building: Building, onArrival: (Building) => any) {
        // let building = this.planet.closestBuildingByType(this.pos, structure)

        let path = this.planet.pathBetween(this.pos.clone(), building)

        if (path.length > 0) {
            this.path = path
            await Promise.all(
                path.map(step => this.glideTo(step))
            )
            this.path = null
            onArrival(building);
        }

        return true;
    }


    async work() {
        if (this.carrying) {
            console.log("carrying", this.carrying)
            let item: ResourceBlock = this.carrying;
            let sinks = []
            if (ResourceBlock[item] === 'Food') {
                sinks = [Kitchen]
            } else {
                sinks = [MissionControl]
            }

            if (sinks.length > 0) {
                let theSink = this.planet.closestBuildingByType(this.pos, sinks)
                if (theSink) {
                    await this.walkTo(theSink, (b) => b.interact(this))
                    console.log("delivered to sink!")
                }
            } else {
                console.log("nowhere to deliver it", this.carrying)
            }
        } else {
            let source = this.planet.closestBuildingByType(this.pos,
                [Dome], //, Mine, Laboratory],
                (building) => building.product.length > 0
            )

            if (source) {
                await this.walkTo(source, (b) => b.interact(this))
                console.log("gathered from source!!")
            } else {
                console.log("i guess i can try again?")
            }
        }
        setTimeout(() => this.work(), 50)
    }
}