import { Actor, Vector, CollisionType, Color, Label, Traits, FontStyle } from "excalibur";
import { Planet } from "../Planet/Planet";
import { Structure, } from "../../models/Structure";
import { Slot } from "../../values/Slot";
import { Orientation, flip, compass } from "../../values/Orientation";
import { Game } from "../../Game";
import { Rectangle } from "../../values/Rectangle";
import { closest, measureDistance, deleteByValue, containsUniq, flatSingle } from "../../Util";
import { Graph } from "../../values/Graph";
import { ResourceBlock, emptyMarket, Economy, sumMarkets, equilibrium, allValues, availableCapacity } from "../../models/Economy";
import { Device } from "../Device";
import { allSpaceFunctions, RoomRecipe } from "../../models/RoomRecipe";
import { DeviceSize, getVisibleDeviceSize } from "../../values/DeviceSize";
import { World } from "../../models/World";
import { Machine, allMachines, CommandCenter, MissionLog, StudyMachine } from "../../models/Machine";
import { BackgroundPattern } from "./BackgroundPatterns";
import { EconomicValue } from "../Hud/EconomicValue";
import { drawRect, pathFromRect } from "../../Painting";
import { Scale } from "../../values/Scale";

export class DevicePlace {
    constructor(private pos: Vector, private size: DeviceSize) {}
    get position() { return this.pos }
    get visibleSize() { return getVisibleDeviceSize(this.size) }

}

export class Building extends Actor {
    edgeWidth: number = 0

    nameLabel: Label

    placed: boolean = false
    hover: boolean = false
    showLabel: boolean = false
    facing: Orientation = Orientation.Right
    hideBox: boolean = false
    parentSlot: Slot
    childrenBuildings: Building[] = []

    spaceFunction: RoomRecipe

    private devices: Device[] = []
    givenName: string


    private active: boolean = true
    // private built: boolean = false

    constructor(pos: Vector, public structure: Structure, public planet: Planet) {
        super(
          pos.x,
          pos.y,
          structure.width,
          structure.height,
          structure.infra ? planet.color.darken(0.3) : Color.Transparent
        )
        this.anchor = new Vector(0,0)

        this.setup();
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling))

        // this.on('pointerenter', () => {
        //     this.hover = true
        //     if (!this.devices.some(d => d.hover)) {
        //         this.planet.currentlyViewing = this
        //     }
        // })


        // this.on('pointerdown', () => {
        //     // console.log("CLICKED BUILDING", { building: this })
        //     this.toggleActive();
        // })

        // this.on('pointerleave', () => {
        //     this.hover = false
        // })

        this.collisionType = CollisionType.Passive

        this.nameLabel = new Label(this.structure.name, 0, 0, Game.font) // 'Helvetica')
        this.nameLabel.fontSize = 9
        // this.nameLabel.fontStyle = FontStyle.Italic
        this.nameLabel.color = Color.White


        if (this.structure.infra) { this.active = true }
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        if (!this.hideBox) {
            drawRect(ctx, this.aabb(), this.processedColor())
        }
        super.draw(ctx, delta)

        if (this.showLabel && this.spaceFunction) {
            this.nameLabel.pos = this.pos.add(
                new Vector(this.getWidth()/2 - this.nameLabel.getTextWidth(ctx)/2, 0)
            )
            this.nameLabel.draw(ctx, delta)
        }

        if (this.debugGraph) {
            if (this.slots().length > 0) {
                // draw slots
                this.slots().forEach((slot: Slot) => {
                    let rect: Rectangle = { x: slot.pos.x, y: slot.pos.y, width: 3, height: 3 }
                    drawRect(ctx, rect, Color.Gray.lighten(0.5))
                })
            }
            if (this.nodes().length > 0) {
                // draw nodes
                this.nodes().forEach((node: Vector) => {
                    let rect: Rectangle = { x: node.x, y: node.y, width: 4, height: 4 }
                    drawRect(ctx, rect, Color.Yellow.lighten(0.5))
                })
            }
        }

        let showDevicePlaces = this.debugGraph
        if (showDevicePlaces && this.devicePlaces().length > 0 && this.devices.length < this.devicePlaces().length) {
            this.devicePlaces().forEach(p => {
                let place = p.position
                let sz = p.visibleSize
                drawRect(ctx,
                    { x: place.x - sz/2, y: place.y - sz/2, width: sz, height: sz },
                    // 0.1,
                    Color.White,
                    false,
                    true
                )
            })
        }
    }


    debugGraph: boolean = false
    step: number = 0
    update(engine: Game, delta: number) {
        super.update(engine, delta)

        let tryProduce = this.placed;
        if (tryProduce) {
            this.devices.forEach(device => {
                device.tryProduce(this.step)
                if(device.tinyDevices.length > 0) {
                    device.tinyDevices.forEach(tinyDevice => tinyDevice.tryProduce(this.step))
                }
            });

        }

        this.step += 1

        if (engine.debugMode) {
            this.debugGraph = true
        } else {
            this.debugGraph = false
        }
    }


    poly() { return this.aabbPoly() }


    get name() {
        if (this.spaceFunction) {
            return this.spaceFunction.name
        } else {
            return this.structure.name
        }
    }

    get description() {
        if (this.spaceFunction) {
            return this.spaceFunction.description
        } else {
            return this.structure.description
        }
    }

    get floorY() {
        return this.pos.y + this.getHeight() //().y
    }

    economy(emptyUnlessActive: boolean = true): Economy {
        if (emptyUnlessActive && !this.isActive) {
            return emptyMarket()
        } else {
            let machineEconomies = this.devices.map(d => d.economy)
            //machine.economy)

            let buildingEconomy = {
                ...emptyMarket(),
                Oxygen: { demand: 1, supply: 0 }, // structural demand
                // Water: { demand: 0.1, supply: 0 },
            }

            let aggregate = [...machineEconomies, buildingEconomy]
                .reduce(sumMarkets, emptyMarket())

            return aggregate
        }
    }

    // private toggleActive() {
    //     if (!this.structure.infra) {
    //         if (this.active) {
    //             if (this.devices.some(d => d.inUse)) { return }
    //             let wasEquil = equilibrium(this.planet.economy)
    //             this.active = false
    //             if (wasEquil) {
    //                 if (!equilibrium(this.planet.economy)) {
    //                     this.active = true
    //                     // return
    //                 }
    //                 // this.active = true
    //             } else {
    //                 // we weren't at equilibrium previously
    //                 // permit it, if we don't have any supply that would go negative without us?
    //                 // console.log("can we toggle?")
    //                 for (let value of allValues) {
    //                     let localCap = availableCapacity(this.economy(false), value)
    //                     let globalCap = availableCapacity(this.planet.economy, value)
    //                     // console.log("value", { value, localCap, globalCap})
    //                     if (localCap > 0 && globalCap < 0) {
    //                         // don't permit it to be turned off
    //                         this.active = true
    //                     }
    //                 }
    //             }
    //         } else { // this.active is false now
    //             let agg = [
    //                 this.planet.economy,
    //                 this.economy(false)
    //             ].reduce(sumMarkets, emptyMarket())

    //             if (equilibrium(agg)) {
    //                 this.active = true
    //             }
    //         }
    //     }
    // }

    get isActive() { return !!this.active }


    setup(): void { }

    constrainCursor(cursor: Vector): Vector {
        return cursor.clone();
    }
    reshape(cursor: Vector): void {
        // this.pos = cursor.clone()
        this.alignToSlot(cursor)
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
            new Vector(Math.floor(x), Math.floor(y))
        ];
    }

    devicePlaces(): DevicePlace[] {
        return []; //this.nodes();
    }

    deviceInteractionPlaces(): Vector[] {
        return this.devicePlaces().map(place => {
            place.position.y += (place.visibleSize/2)
            return place.position
        })
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

    public debit(res: ResourceBlock) {
        this.planet.spend(res)
    }

    public populate(pos: Vector, elite: boolean = false) {
        this.planet.populate(pos, elite) //this.pos)
    }

    protected aabb(): Rectangle {
        return {
            x: this.pos.x,
            y: this.pos.y,
            width: this.getWidth(),
            height: this.getHeight()
        }
    }

    protected aabbPoly(): {x:number,y:number}[] {
        return pathFromRect(this.aabb());

    }

    protected angledRoofPoly(): {x: number, y: number}[] {
        let angleStartY = 1 * (this.getHeight() / 3) - 3
        let angleStartX = (Scale.major.first) // 1 * (this.getWidth() / 10)
        return [
            // bottom-left
            { x: this.pos.x, y: this.pos.y + this.getHeight() },

            // upper-left
            { x: this.pos.x, y: this.pos.y + angleStartY },
            { x: this.pos.x + angleStartX, y: this.pos.y },

            // upper-right
            { x: this.pos.x + this.getWidth() - angleStartX, y: this.pos.y },
            { x: this.pos.x + this.getWidth(), y: this.pos.y + angleStartY },

            // bottom-right
            { x: this.pos.x + this.getWidth(), y: this.pos.y + this.getHeight() },
        ]
            
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
        if (!this.placed)  { 
            if (this.overlapsAny()) { clr = Color.Red }
            clr.a = 0.8
        }
        if (!this.active) {
            clr = clr.darken(0.8)
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
            // console.warn('no conecting structures found')
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
        // device.finalize()
        if (device.building !== this) {
            device.building = this
        }
        this.devices.push(device)
        device.pos.subEqual(this.pos) // = this.devicePlaces()[0].position
        // console.log("DEVICE IS AT", { pos: device.pos })
        this.add(device)
        this.updateFunction()
        device.machine.onPlacement(device)
        // this.toggleActive()

        device.placed = true
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
        return [ ...this.devices, ...flatSingle(this.devices.map(d => d.tinyDevices)) ]
    }

    public updateFunction() {
        let allTheMachines = [ StudyMachine, ...allMachines, CommandCenter, MissionLog ]
        let machines = this.devices.map(
            d => allTheMachines.find((m: typeof Machine) => d.machine instanceof m)
        )
        let fn = allSpaceFunctions.find(spaceFn => {
            let sf = new spaceFn()

            return containsUniq(
              machines,
              sf.machines
            );
        })
        if (fn) {
            // console.log("Determined building function", { fn })
            let sf = new fn()
            this.spaceFunction = sf
            this.nameLabel.text = sf.name
        } else {
            // console.warn("Could not identify function!")
        }
    }

    get backgroundPattern() {
        if (this.spaceFunction) {
            return this.spaceFunction.background
        } else {
            return BackgroundPattern.Grid
        }
    }
}