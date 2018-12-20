import { Actor, Vector, CollisionType, Color, Label } from "excalibur";
import { Planet } from "../Planet/Planet";
import { Structure } from "../../models/Structure";
import * as ex from 'excalibur';
import { Slot } from "../../values/Slot";
import { Orientation, flip } from "../../values/Orientation";
import { Citizen } from "../Citizen";
import { Game } from "../../Game";
import { Rectangle } from "../../values/Rectangle";
import { closest, flatSingle, measureDistance } from "../../Util";
import { Graph } from "../../values/Graph";
import { ResourceBlock, blockColor } from "../../models/Economy";

export class Building extends Actor {
    label: Label
    built: boolean = false
    hover: boolean = false

    facing: Orientation = Orientation.Right
    edgeWidth: number = 4
    hideBox: boolean = false

    parentSlot: Slot
    childrenBuildings: Building[] = []

    // input: Color[] = []
    product: ResourceBlock[] = []

    capacity: number = 4

    // consumeColor: Color = null
    // productColor: Color = null
    productionTime: number = 500

    constructor(public structure: Structure, protected planet: Planet) {
        super(
          structure.origin.x, // + 20,
          structure.origin.y,
          structure.width,
          structure.height,
          planet.color
        )
        this.anchor = new ex.Vector(0,0)

        // console.log(`CREATE NEW ${structure.name}`, { origin: structure.origin, width: structure.width, height: structure.height })
        this.setup();
        this.traits = this.traits.filter(trait => !(trait instanceof ex.Traits.OffscreenCulling))

        this.on('pointerenter', () => {
            this.hover = true
        })

        this.on('pointerleave', () => {
            this.hover = false
        })

        this.collisionType = CollisionType.PreventCollision

        this.label = new Label(this.structure.name, 0, 0, 'Helvetica')
        this.label.color = Color.White
    }

    setup(): void {}

    constrainCursor(cursor: Vector): Vector {
        return cursor.clone();
    } 
    reshape(cursor: Vector): void {
        // by default just follow the mouse
        this.pos = cursor.clone()

    }

    afterConstruct(): void {}

    // response is whether we're 'done'
    // (in general this would be true, unless you need special handling
    // -- multiple clicks for some reason...)
    handleClick(cursor: Vector): boolean { return true; }

    slots(): Slot[] {
        return []
    }

    nodes(): Vector[] {
        let x = this.pos.x + this.getWidth()/2;
        let y = this.pos.y + this.getHeight()
        return [
            new Vector(Math.floor(x), Math.floor(y)-4)
        ];
    }

    graph(supergraph: Graph<Vector> = new Graph()): Graph<Vector> {
        let g = supergraph
        // assemble subgraph
        let nodes = this.nodes()
        let rootNode = g.findOrCreate(nodes[0], measureDistance)
        for (let child of this.childrenBuildings) {
            let slot = g.findOrCreate(child.parentSlot.pos, measureDistance)
            g.edge(rootNode, slot)

            let childNode = g.findOrCreate(child.nodes()[0], measureDistance)
            g.edge(slot, childNode)

            child.graph(g)
        }
        return g
    }

    get produces() { return this.structure.produces }
    get consumes() { return this.structure.consumes }

    async interact(citizen: Citizen) {
        console.log("interact!!!")
        // should we give this citizen an item?
        if (this.product.length > 0) {
            console.log("we have production to give away")
            citizen.carry(this.produces) //productColor.clone())
            this.product.pop()
            // return true
        } else {
            console.log("we check to see if we can consume", { consumes: this.consumes, carrying: citizen.carrying})
            // is the citizen carrying a raw material we can process?
            if (this.consumes && citizen.carrying === this.consumes) { //consumeColor) {
                // now we need to await this thing being processed
                await citizen.progressBar(4000)
                //  citizen.carrying

                // change it in place?
                citizen.carry(this.produces)
            }
        }
    }

    protected produce(step: number) {
        if (this.produces && !this.consumes && step % this.productionTime === 0) {
            let shouldProduce = true;
            if (shouldProduce) {
                this.product.push(this.produces) //Color.Blue)
                console.log("PRODUCE", { produces: this.produces, product: this.product })
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        if (!this.hideBox) {
            this.drawRect(ctx, this.aabb(), this.edgeWidth)
        }

        this.product.forEach((produced, index) => {
            ctx.fillStyle = blockColor(produced).desaturate(0.3).lighten(0.2).toRGBA();
            ctx.fillRect(this.x + 20 * index, this.y - 20, 18, 18)
        })

        this.label.pos = this.getCenter()//this.label.getWidth() //ctx.measureText()
        this.label.pos.x -= ctx.measureText(this.structure.name).width / 2 //bthis.label.getWidth()
        this.label.draw(ctx, delta)

        let debug = true;
        if (debug) {
            if (this.slots().length > 0) {
                // draw slots
                this.slots().forEach((slot: Slot) => {
                    let rect: Rectangle = { x: slot.pos.x, y: slot.pos.y, width: 3, height: 3 }
                    this.drawRect(ctx, rect, 1, Color.Gray.lighten(0.5))
                })
            }
            if (this.nodes().length > 0) {
                // draw nodes
                this.nodes().forEach((node: Vector) => {
                    let rect: Rectangle = { x: node.x, y: node.y, width: 4, height: 4 }
                    this.drawRect(ctx, rect, 1, Color.Yellow.lighten(0.5))
                })
            }
        }
    }

    step: number = 0
    update(engine: Game, delta: number) {
        super.update(engine, delta)
        if (this.step % 10 === 0) {
            let tryProduce = this.built && this.produces && this.product.length < this.capacity;
            if (tryProduce) {
                this.produce(this.step);
            }
        }
        this.step += 1
    }


    protected drawRect(ctx: CanvasRenderingContext2D, rectangle: Rectangle, edgeWidth: number = 5, color: Color = null) {
        let { x, y, width, height } = rectangle;

        let edge = color || this.edgeColor();
        ctx.fillStyle = edge.toRGBA();
        ctx.fillRect(x, y, width, height)

        let main = color || this.mainColor();
        ctx.fillStyle = main.toRGBA();
        ctx.fillRect(
            x + edgeWidth,
            y + edgeWidth,
            width - edgeWidth*2,
            height - edgeWidth*2
        )
    }

    protected aabb(): Rectangle {
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
        return(!!doesOverlap);
    }

    public overlapsAny(): boolean {
        return !!this.planet.buildings.find(bldg => bldg !== this && this.overlaps(bldg))
    }

    protected edgeColor(): Color {
        let edge = this.processedColor().lighten(0.5);
        return edge;
    }

    protected mainColor(): Color {
        let main = this.processedColor().darken(0.08);
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

    protected validConnectingStructures(): (typeof Structure)[] {
        return [ ];
    }

    protected validConnectingDirections(): Orientation[] {
        return [
            Orientation.Up,
            Orientation.Down,
            Orientation.Left,
            Orientation.Right
        ]
    }

    protected findSlot(pos: Vector): Slot {
        let buildings = this.validConnectingStructures().map(structure =>
            this.planet.closestBuildingByType(pos, [structure])
        )
        let slotList = flatSingle(buildings.map(building => building ? building.slots() : []))


        // select slots that COULD match one of our faces (and do so 'legally'...)
        slotList = slotList.filter((slot: Slot) => 
            this.validConnectingDirections().includes(slot.facing) &&
              this.slots().some((ourSlot: Slot) => slot.facing === flip(ourSlot.facing))
        )
        if (slotList.length > 0) {
            return closest(pos, slotList, (slot) => slot.pos)
        }
    }

    protected alignToSlot(cursor: Vector) {
        let theSlot = this.findSlot(cursor)
        if (theSlot) {
            // position us so our slot lines up
            let matchingSlot = this.slots().find(s => s.facing == flip(theSlot.facing))
            if (matchingSlot) {
                let offset = theSlot.pos.sub(matchingSlot.pos)
                this.pos.addEqual(offset)

                this.parentSlot = theSlot;
                return theSlot;
            }
        }
    }

    protected buildSlot(x: number, y: number, facing: Orientation = Orientation.Right): Slot {
        return {
            pos: new Vector(x,y),
            facing,
            parent: this
        }
    }
}