import { Actor, Vector, CollisionType, Color, Label, Traits } from "excalibur";
import { Planet } from "../Planet/Planet";
import { Structure, } from "../../models/Structure";
import { Slot } from "../../values/Slot";
import { Orientation, flip, compass } from "../../values/Orientation";
import { Game } from "../../Game";
import { Rectangle } from "../../values/Rectangle";
import { closest, measureDistance, drawRect, deleteByValue } from "../../Util";
import { Graph } from "../../values/Graph";
import { ResourceBlock } from "../../models/Economy";
import { Device } from "../Device";
import { allSpaceFunctions } from "../../models/SpaceFunction";
import { DeviceSize } from "../../values/DeviceSize";

export class DevicePlace {
    constructor(private pos: Vector, private size: DeviceSize) {}
    get position() { return this.pos }
    getVisibleSize(): number {
        let sz = 10;
        switch(this.size) {
            case DeviceSize.Small: sz = 15; break;
            case DeviceSize.Medium: sz = 25; break;
        }
        return sz;
    }
}

export class Building extends Actor {
    edgeWidth: number = 0 //.1

    nameLabel: Label
    levelLabel: Label

    built: boolean = false
    hover: boolean = false
    showLabel: boolean = false
    facing: Orientation = Orientation.Right
    hideBox: boolean = false
    parentSlot: Slot
    childrenBuildings: Building[] = []

    level: number = 1

    private devices: Device[] = []

    constructor(pos: Vector, public structure: Structure, protected planet: Planet) {
        super(
          pos.x,
          pos.y,
          structure.width,
          structure.height,
          planet.color
        )
        this.anchor = new Vector(0,0)

        this.setup();
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling))

        this.on('pointerenter', () => {
            this.hover = true
            console.log("HOVER ON", { building: this })
        })

        // this.on('pointerdown', () => {
        //     console.log("CLICKED BUILDING", { building: this })
        //     this.levelUp();
        // })

        this.on('pointerleave', () => {
            this.hover = false
        })

        this.collisionType = CollisionType.PreventCollision

        this.nameLabel = new Label(this.structure.name, 0, 0, 'Helvetica')
        // this.nameLabel.fontSize = 11
        this.nameLabel.color = Color.White

        this.levelLabel = new Label(`Lvl. ${this.level}`, 0, 0, 'Helvetica')
        this.levelLabel.fontSize = 6
        this.levelLabel.color = Color.White.darken(0.2)
    }

    levelUp() {
        this.level += 1
        this.levelLabel.text = `Lvl. ${this.level}`
    }


    draw(ctx: CanvasRenderingContext2D, delta: number) {
        if (!this.hideBox) {
            drawRect(ctx, this.aabb(), this.edgeWidth, this.processedColor())
        }
        this.devices.forEach(device => device.draw(ctx, delta))

        if (this.showLabel) {
            this.nameLabel.pos = this.getCenter()
            this.nameLabel.pos.x -= ctx.measureText(this.structure.name).width / 2
            this.nameLabel.draw(ctx, delta)

            // this.levelLabel.text = `Lvl. ${this.level}`
            // this.levelLabel.pos = this.getCenter()
            // this.levelLabel.pos.y += 10
            // this.levelLabel.pos.x -= ctx.measureText(this.structure.name).width / 4
            // this.levelLabel.draw(ctx, delta)
        }

        let debug = false;
        if (debug) {
            if (this.slots().length > 0) {
                // draw slots
                this.slots().forEach((slot: Slot) => {
                    let rect: Rectangle = { x: slot.pos.x, y: slot.pos.y, width: 3, height: 3 }
                    drawRect(ctx, rect, 1, Color.Gray.lighten(0.5))
                })
            }
         if (this.nodes().length > 0) {
                // draw nodes
                this.nodes().forEach((node: Vector) => {
                    let rect: Rectangle = { x: node.x, y: node.y, width: 4, height: 4 }
                    drawRect(ctx, rect, 1, Color.Yellow.lighten(0.5))
                })
            }

        }

        let showDevicePlaces = false
        if (showDevicePlaces && this.devicePlaces().length > 0) {
            this.devicePlaces().forEach(p => {
                let place = p.position
                let sz = p.getVisibleSize()
                drawRect(ctx,
                    { x: place.x, y: place.y, width: sz, height: sz },
                    1,
                    Color.White,
                    false
                )
            })
        }
    }

    step: number = 0
    update(engine: Game, delta: number) {
        super.update(engine, delta)
        let tryProduce = this.built;
        if (tryProduce) {
            this.devices.forEach(device => device.produce(this.step));
        }
        this.step += 1
    }

    setup(): void { }

    constrainCursor(cursor: Vector): Vector {
        return cursor.clone();
    }
    reshape(cursor: Vector): void {
        this.pos = cursor.clone()
    }

    afterConstruct(): void {}

    handleClick(_pos): boolean { return true; }

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

    devicePlaces(): DevicePlace[] {
        return []; //this.nodes();
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

    // just a patch through to planet -- but could animate something here?
    public redeem(res: ResourceBlock) {
        this.planet.gather(res)
    }

    public populate(pos: Vector) {
        this.planet.populate(pos) //this.pos)
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
        return !!this.planet.colony.buildings.find(bldg => bldg !== this && this.overlaps(bldg))
    }

    protected edgeColor(): Color {
        let edge = this.processedColor().lighten(0.85);
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

    get connections() {
        return this.structure.connections;
    }


    protected findSlot(
        pos: Vector,
        validConnections: { [key in Orientation]: (typeof Structure)[] } = this.connections
    ): Slot {
        let slotList = []
            for (let dir of compass) {
                const validStructures = validConnections[dir];
                let flipped = flip(dir)
                const buildings = validStructures.map(structure =>
                    this.planet.closestBuildingByType(pos, [structure])
                )
                buildings.forEach(building => {
                    if (building) {
                        let neighborSlots = building.slots()
                        neighborSlots.filter(slot => slot.facing === flipped)
                        .forEach(matchingSlot => {
                            slotList.push(matchingSlot)
                        })
                    }
                })
            }

        if (slotList.length > 0) {
            return closest(pos, slotList, (slot) => slot.pos)
        } else {
            console.warn('no conecting structures found')
        }
    }

    protected alignToSlot(
        cursor: Vector,
        validConnections: { [key in Orientation]: (typeof Structure)[] } = this.connections
    ) {
        let theSlot = this.findSlot(cursor, validConnections)
        if (theSlot) {
            let matchingSlot = this.slots()
                .find(s => s.facing == flip(theSlot.facing))
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

    public addDevice(device: Device) {
        device.finalize()
        if (device.building !== this) {
            device.building = this
        }
        this.devices.push(device)
        this.updateName()
    }

    public hasPlaceForDevice() {
        return this.devices.length < this.devicePlaces().length
    }

    public nextDevicePlace(): DevicePlace {
        // could throw an err if we have no place
        return this.devicePlaces()[
            this.devices.length
        ]
    }

    public getDevices() {
        return this.devices
    }

    private updateName() {
        let fn = allSpaceFunctions.find(spaceFn => {
            let matched = true;
            let unseenDevices = this.devices.slice() // clone?
            spaceFn.machines.forEach(machine => {
                let matchingDevice = unseenDevices.find(d => d.machine instanceof machine)
                if (!matchingDevice) { matched = false; }
                unseenDevices = deleteByValue(unseenDevices, matchingDevice)
            })
            return matched;
        })
        if (fn) {
            this.nameLabel.text = fn.label
        }
    }
}