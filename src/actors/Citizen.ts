import { Actor, Color, Traits, Vector } from "excalibur";
import { Building } from "./Building";
import { Planet } from "./Planet/Planet";
import { Structure } from "../models/Structure";

export class Citizen extends Actor {
    walkSpeed: number = 150
    carrying: Color = null
    path: Vector[] = []

    constructor(building: Building, protected planet: Planet) {
        super(building.nodes()[0].x,building.nodes()[0].y,4,10,Color.White)
        // this.pos.y -= this.getHeight()
        // this.walkSpeed += (Math.random()*20)-10

        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling))
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)
        if (this.carrying) {
            ctx.fillStyle = this.carrying.toRGBA()
            ctx.fillRect(this.x+4, this.y-3, 5, 5)
        }
        if (this.path) {
            ctx.strokeStyle = Color.Blue.lighten(0.5).toRGBA()
            ctx.beginPath()
            ctx.moveTo(this.path[0].x, this.path[0].y)
            this.path.forEach((step) => {
                ctx.lineTo(step.x,step.y)
            })
            ctx.stroke()
        }
    }

    carry(c: Color) {
        this.carrying = c;
    }

    drop() {
        if (this.carrying) {
            let c = this.carrying.clone();
            this.carrying = null;
            return c
        }
        return true
    }

    glideTo(pos: Vector) {
        return this.actions.moveTo(pos.x, pos.y, this.walkSpeed).asPromise()
    }

    async walkTo(structure: typeof Structure, onArrival: (Building) => any) {
        let building = this.planet.closestBuildingByType(this.pos, structure)
        console.log("walking to", { building })

        let path = this.planet.pathBetween(this.pos.clone(), building)
        console.log("lookup path", path)

        // this.path = path;
        if (path.length > 0) {
            this.path = path
            await Promise.all(
                path.map(step => this.glideTo(step))
            )
            this.path = null
            onArrival(building);
        }

        return true;

        // await this.actions.moveTo(
        //     building.nodes()[0].x, // + building.getWidth() / 2,
        //     building.nodes()[0].y, // + building.getHeight() / 2,
        //     //  0, 
        //     this.walkSpeed
        // ).asPromise();

        // onArrival(building);
        // return true;
    }

    async patrol(structure: typeof Structure, otherStructure: typeof Structure, onArrival: (Building) => any) {
        await this.walkTo(structure, onArrival) //.then(() => onArrival)
        //(building) => {
        //    onArrival(building)
        //})
        await this.walkTo(otherStructure, onArrival) //.then(() => onArrival(otherBuilding))

        this.patrol(structure, otherStructure, onArrival)
        //this.walkTo(building).then(() => {
        //    onArrival(building);
        //    this.walkTo(otherBuilding, building, onArrival);
        //})
    }

    work(workshop: typeof Structure, store: typeof Structure) {
        this.patrol(workshop, store, (building: Building) => {
            console.log("arrived at", { building })
            building.interact(this)
            // return true
        })
    }
}