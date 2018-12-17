import { Actor, Color, Traits, Vector } from "excalibur";
import { Building } from "./Building";
import { Planet } from "./Planet/Planet";
import { Structure } from "../models/Structure";

export class Citizen extends Actor {
    walkSpeed: number = 250
    carrying: Color = null
    path: Vector[] = []

    constructor(building: Building, protected planet: Planet) {
        super(building.nodes()[0].x,building.nodes()[0].y,4,10,Color.White)
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling))
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)
        if (this.carrying) {
            ctx.fillStyle = this.carrying.toRGBA()
            ctx.fillRect(this.x+4, this.y-3, 5, 5)
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

    async patrol(structure: typeof Structure, otherStructure: typeof Structure, onArrival: (Building) => any) {
        await this.walkTo(structure, onArrival)
        await this.walkTo(otherStructure, onArrival)

        this.patrol(structure, otherStructure, onArrival)
    }

    work(workshop: typeof Structure, store: typeof Structure) {
        this.patrol(workshop, store, (building: Building) => {
            building.interact(this)
        })
    }
}