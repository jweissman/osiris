import { Actor, Vector, InitializeEvent, CollisionType, Color } from "excalibur";
import { Planet } from "./planet";
import { Structure } from "../models/Structure";
// import { OffscreenCulling } from "excalibur";
import * as ex from 'excalibur';

export class Building extends Actor {
    // isOffScreen() { return false; }

    // isOffScreen: boolean = false
    
    built: boolean = false
    // : boolean = false
    // pickOriginFirst: boolean = false
    // pickingOrigin: boolean = false
    // constrain: boolean = false

    constructor(public structure: Structure, protected planet: Planet) {
        super(structure.origin.x, structure.origin.y, structure.width, structure.height, planet.color)
        console.log(`CREATE NEW ${structure.name}`, { origin: structure.origin, width: structure.width, height: structure.height })
        this.setup(); //(structure, planet)
        // this.collisionType = CollisionType.Fixed
        this.traits = this.traits.filter(trait => !(trait instanceof ex.Traits.OffscreenCulling))
    }

    setup(): void {}

    constrainCursor(cursor: Vector): Vector {
        return cursor.clone();
    }

    reshape(cursor: Vector): void {
        // by default just follow the mouse?
        this.pos = cursor.clone()

    }

    // response is whether we're 'done'
    // (in general this would be true, unless you need special handling
    // -- multiple clicks for some reason...)
    handleClick(cursor: Vector): boolean { return true; }

    protected aabb() {
        return {
            x: this.pos.x,
            y: this.pos.y,
            width: this.getWidth(),
            height: this.getHeight()
        }
    }

    protected overlaps(other: Building): boolean {
        let rect1 = this.aabb(), rect2 = other.aabb();
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        )
    }

    public overlapsAny(): boolean {
        return !!this.planet.buildings.find(bldg => bldg !== this && this.overlaps(bldg))
    }

    protected edgeColor(): Color {
        let edge = this.processedColor().lighten(0.5); // : this.color.
        return edge;
    }

    protected mainColor(): Color { //} = this.color.darken(0.2)
        let main = this.processedColor().darken(0.08); // : this.color.
        return main;
    }

    protected colorBase(): Color {
        return this.color;
    }

    protected processedColor(): Color {
        let clr = this.colorBase();
        if (!this.built)  { 
            if (this.overlapsAny()) { clr = Color.Red }
            clr.a = 0.8
        }
        return clr;
    }
}