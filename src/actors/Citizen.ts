import { Actor, Color, Util, Traits } from "excalibur";
import { Game } from "../Game";
import { Building } from "./Building";
import { Planet } from "./Planet/Planet";
import { Structure } from "../models/Structure";

export class Citizen extends Actor {
    walkSpeed: number = 150

    carrying: Color

    constructor(building: Building, protected planet: Planet) {
        super(building.x + (Math.random()*10)-5,building.y,4,10,Color.White)
        this.pos.y -= this.getHeight()
        this.walkSpeed += (Math.random()*20)-10

        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling))
    }

    draw(ctx, delta) {
        // this.setZIndex(10)
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

    walkTo(structure: typeof Structure, onArrival: (Building) => any) {
        let building = this.planet.closestBuildingByType(this.pos, structure)
        return this.actions.moveTo(
            building.x + building.getWidth()/2, 0,
            this.walkSpeed
        ).asPromise().then(() => onArrival(building))
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