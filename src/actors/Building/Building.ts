import { Actor, Vector, InitializeEvent, CollisionType, Color, Label } from "excalibur";
import { Planet } from "../Planet/Planet";
import { Structure } from "../../models/Structure";
// import { OffscreenCulling } from "excalibur";
import * as ex from 'excalibur';
import { Slot } from "../../values/Slot";
import { Orientation } from "../../values/Orientation";
import { Citizen } from "../Citizen";
import { Game } from "../../Game";
import { Hud } from "../Hud";

type Rectangle = {
    x: number
    y: number
    width: number
    height: number
}

// type WorkResult =  | StoreResource

export class Building extends Actor {
    // isOffScreen() { return false; }

    // isOffScreen: boolean = false

    built: boolean = false
    hover: boolean = false
    // : boolean = false
    // pickOriginFirst: boolean = false
    // pickingOrigin: boolean = false
    // constrain: boolean = false
    facing: Orientation = Orientation.Right
    edgeWidth: number = 4

    constructor(public structure: Structure, protected planet: Planet) {
        super(
          structure.origin.x, // + 20,
          structure.origin.y,
          structure.width,
          structure.height,
          planet.color
        )
        this.anchor = new ex.Vector(0,0)

        console.log(`CREATE NEW ${structure.name}`, { origin: structure.origin, width: structure.width, height: structure.height })
        this.setup(); //(structure, planet)
        // this.collisionType = CollisionType.Fixed
        this.traits = this.traits.filter(trait => !(trait instanceof ex.Traits.OffscreenCulling))

        this.on('pointerenter', () => {
            this.hover = true
            //this.baseColor = DomeView.basicColor.clone()
            //this.baseColor.a = 0.5
        })

        this.on('pointerleave', () => {
            this.hover = false
            //this.baseColor = DomeView.basicColor.clone()
        })

        this.collisionType = CollisionType.PreventCollision

        this.add(new Label(this.structure.name))
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

    slots(): Slot[] {
        return []
    }

    interact(citizen: Citizen) {
        // should we give this citizen an item?
        // should we get a resource?
        // etc
        return true
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        // super.draw(ctx, delta)
        //let debugBoxes = true;
        //if (debugBoxes) {
        this.drawRect(ctx, this.aabb(), this.edgeWidth)
        //}
    }

    step: number = 0
    update(engine: Game, delta: number) {
        super.update(engine, delta)

        if (this.built && this.step % 10 === 0 && this.product.length < this.capacity) {
            this.produce(this.step);
        }
        this.step += 1
    }

    protected product: Color[] = []
    protected capacity: number = 4
    protected produce(step: number) {}

    protected drawRect(ctx: CanvasRenderingContext2D, rectangle: Rectangle, edgeWidth: number = 5) {
        let { x, y, width, height } = rectangle;

        let edge = this.edgeColor();
        ctx.fillStyle = edge.toRGBA();
        ctx.fillRect(x, y, width, height) // this.getWidth(), this.getHeight())

        let main = this.mainColor();
        ctx.fillStyle = main.toRGBA();
        ctx.fillRect(
            x + edgeWidth,
            y + edgeWidth,
            width - edgeWidth*2,
            height - edgeWidth*2
        )
    }

    protected aabb(): Rectangle {
        // this.getGeometry()
        return {
            x: this.pos.x,
            y: this.pos.y,
            width: this.getWidth(),
            height: this.getHeight()
        }
    }

    protected overlaps(other: Building): boolean {
        let rect1 = this.aabb(), rect2 = other.aabb();
        let doesOverlap = (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        )
        // console.log('overlaps?', { rect1, rect2, doesOverlap })
        return(!!doesOverlap);
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
        let clr = this.colorBase().clone();
        if (!this.built)  { 
            if (this.overlapsAny()) { clr = Color.Red }
            clr.a = 0.8
        }
        if (this.hover) { clr.a = 0.5 }
        return clr;
    }
}