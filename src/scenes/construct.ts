import { Scene, Input, Vector } from "excalibur";
import { Game } from "../Game";
import { Planet } from "../actors/Planet/Planet";
import { Player } from "../actors/player";
import { Structure, MainTunnel, Corridor, SurfaceRoad, SmallDome, SmallRoomThree, MediumRoomThree, LargeRoom, HugeRoom } from "../models/Structure";
import { Building, structureViews, } from "../actors/Building";
import { Hud } from "../actors/Hud/Hud";
import { Device } from "../actors/Device";
import { Machine } from "../models/Machine";
import { SpaceFunction, CloneMatrix, Kitchen, LivingQuarters, LifeSupportPod, Library, Archive, ComputerCore, MissionControl, SolarArray, CloneReception } from "../models/SpaceFunction";
import { flatSingle, zip } from "../Util";
import { DevicePlace } from "../actors/Building/Building";
import { DeviceSize } from "../values/DeviceSize";


export class Construct extends Scene {
    game: Game
    planet: Planet
    hud: Hud
    player: Player

    dragging: boolean = false
    dragOrigin: Vector

    defaultMessage: string = 'Welcome to the Colony, Commander.'

    placingFunction: SpaceFunction = null


    static requiredStructuresAndFunctions: (typeof SpaceFunction | typeof Structure)[] = [
        MissionControl,
        SurfaceRoad,
        SolarArray,
        // LifeSupportPod,
        MainTunnel,
        Corridor,
        LivingQuarters,
        // CloneMatrix,
        // CloneReception,
        // Kitchen,
        // Library,
        // Archive,
        // ComputerCore,
        
    ]

    update(engine, delta) {
        super.update(engine, delta)

        this.hud.updateDetails(this.planet, false)
    }

    public onInitialize(game: Game) {
        this.game = game

        let buildIt = (e) => this.startConstructing(e)

        this.hud = new Hud(game, buildIt, buildIt, buildIt)
        this.add(this.hud)

        this.planet = new Planet(
            this.hud,
            game.world.color,
            (b) => this.hud.showCard(b),
            (d) => this.hud.showCard(d)
        )

        this.add(this.planet)
  
        this.player = new Player()
        this.add(this.player)

        this.prepareNextBuilding()
        this.camera.zoom(0.001)
        this.camera.zoom(1.5, 10000)
        // this.camera.pos.y = this.planet.getTop()
    }

    public onActivate() {
        this.game.input.pointers.primary.on('move', (e: Input.PointerMoveEvent) => {
            if (this.dragging) {
                this.camera.pos = this.camera.pos.add(
                    this.dragOrigin.sub(e.pos)
                )
            } else {
                this.player.pos = e.pos

                let currentlyBuilding = this.planet.currentlyConstructing
                if (currentlyBuilding instanceof Building) {

                    let constrained = currentlyBuilding.constrainCursor(this.player.pos)
                    this.player.pos = constrained

                    currentlyBuilding.reshape(this.player.pos)
                } else if (currentlyBuilding instanceof Device) {
                    currentlyBuilding.snap(this.planet, this.player.pos)
                }
            }
        })

        this.game.input.pointers.primary.on('up', () => {
            if (this.dragging) { this.dragging = false; }
        })

        this.game.input.pointers.primary.on('down', (e: Input.PointerDownEvent) => {
            if (e.button == Input.PointerButton.Left) {
                const currentlyBuilding = this.planet.currentlyConstructing
                if (currentlyBuilding) {
                    if (currentlyBuilding instanceof Building) {
                        let buildingUnderConstruction = currentlyBuilding
                        let placementValid = !buildingUnderConstruction.overlapsAny()
                        if (buildingUnderConstruction && placementValid && buildingUnderConstruction.handleClick(e.pos)) {
                            this.planet.placeBuilding(buildingUnderConstruction)

                            if (this.placingFunction) {
                                let fn = this.placingFunction
                                console.log({ fn, bldg: buildingUnderConstruction })
                                zip(fn.machines, buildingUnderConstruction.devicePlaces()).forEach(([machine, place]: [typeof Machine, DevicePlace]) => {
                                    console.log("would add machine", { machine, place })
                                    let m = (new machine()).concretize()
                                    let device = new Device(m, place.position)
                                    buildingUnderConstruction.addDevice(device)
                                })
                                this.placingFunction = null
                            }

                            this.hud.setMessage(this.defaultMessage)
                            this.planet.colony.currentlyConstructing = null
                            this.prepareNextBuilding(e.pos)
                            this.hud.updateDetails(this.planet)
                        }
                    } else {
                        let deviceUnderConstruction = currentlyBuilding
                        if (deviceUnderConstruction.snap(this.planet)) {
                            let bldg = deviceUnderConstruction.building
                            bldg.addDevice(deviceUnderConstruction)
                            this.planet.colony.currentlyConstructing = null
                            this.hud.setMessage(this.defaultMessage)
                            this.hud.updateDetails(this.planet)
                        }
                    }
                }
            } else if (e.button === Input.PointerButton.Middle) {
                this.dragging = true;
                this.dragOrigin = e.pos
            }
        })

        this.game.input.pointers.primary.on('wheel', (e: Input.WheelEvent) => {
            let z = this.camera.getZoom()
            let step = 0.05
            let min = 0.05, max = 8
            if (e.deltaY < 0) {
                this.camera.zoom(Math.min(z + step, max))
            } else if (e.deltaY > 0) {
                this.camera.zoom(Math.max(z - step, min))
            }
        })

        this.game.input.keyboard.on('press', (e: Input.KeyEvent) => {
            if (e.key === Input.Keys.H) {
                if (this.buildings && this.buildings[0]) {
                    this.camera.move(this.buildings[0].pos, 500)
                    this.camera.zoom(0.5, 1000)
                }
            } else if (e.key === Input.Keys.Esc) {
                this.planet.colony.currentlyConstructing = null
                this.placingFunction = null
            }
        })
    }

    public onDeactivate() {
        this.game.input.pointers.primary.off('move')
        this.game.input.pointers.primary.off('down')
        this.game.input.pointers.primary.off('up')
        this.game.input.pointers.primary.off('wheel')
    }

    get buildings() { return this.planet.colony.buildings }


    private nextMissingStructureOrFunction(): Structure | SpaceFunction {
        let reqs = Construct.requiredStructuresAndFunctions.map(req => new req())

        let actualStructureNames = this.buildings.map(building => building.structure.name)
        let actualFunctionNames = flatSingle(
            this.buildings.map(building => building.spaceFunction && building.spaceFunction.name)
        )
        let actualNames = [...actualStructureNames, ...actualFunctionNames]
        return reqs.find(req => !actualNames.includes(req.name))
    }

    protected prepareNextBuilding(pos: Vector = new Vector(0,0)) {
        let structure = null;
        let nextMissing = this.nextMissingStructureOrFunction() //this.nextMissingRequiredStructure();
        if (nextMissing) { structure = nextMissing; }
        if (structure) {
            this.startConstructing(structure, pos)
        } else {
            this.hud.showPalettes()
        }
    }

    firstBuilding: boolean = true
    startConstructing(structureOrMachine: Structure | Machine | SpaceFunction, pos: Vector = new Vector(0, 0)) {
        this.hud.showCard(structureOrMachine)
        
        let theNextOne = null
        if (structureOrMachine instanceof Structure) {
            let structure = structureOrMachine
            this.hud.setMessage(`Place ${structure.name} (${structure.description})`)
            theNextOne = this.spawnBuilding(structure, pos)
            if (this.firstBuilding) {
                this.camera.zoom(structure.zoom, 250)
                this.camera.pos = theNextOne.pos
                this.firstBuilding = false
            } 
        } else if (structureOrMachine instanceof Machine) {
            let machine = structureOrMachine
            this.hud.setMessage(`Install ${machine.name} (${machine.description})`)
            theNextOne = this.spawnDevice(machine, pos)
            // this.camera.zoom(1.5, 250)
        } else if (structureOrMachine instanceof SpaceFunction) {
            let fn: SpaceFunction = structureOrMachine
            this.hud.setMessage(`Place ${fn.name} (${fn.description})`)
            theNextOne = this.spawnFunction(fn, pos)
            this.placingFunction = fn

        }

        this.planet.colony.currentlyConstructing = null
        if (theNextOne) {
            this.planet.colony.currentlyConstructing = theNextOne
            // this.camera.pos = theNextOne.pos
        }
    }

    protected spawnDevice(machine: Machine, pos: Vector): Device {
        let device = new Device(machine, pos)
        if (device.snap(this.planet)) {
            this.camera.pos = device.pos
 
        }
        return device
    }

    protected spawnBuilding(structure: Structure, pos: Vector): Building {
        let anotherBuilding = this.assembleBuildingFromStructure(structure, pos)
        anotherBuilding.reshape(anotherBuilding.constrainCursor(pos))
        return anotherBuilding
    }
    
    private assembleBuildingFromStructure(structure: Structure, pos: Vector): Building {
        let View = structureViews[structure.view]
        let building = new View(pos, structure, this.planet)
        return building;
    }

    protected spawnFunction(fn: SpaceFunction, pos: Vector): Building {
        let theStructure: Structure = (fn.structure && new fn.structure()) // || new SmallRoomThree()
        if (!theStructure) {
            theStructure = new SmallRoomThree()
            let machines = fn.machines.map(m => new m())

            if (machines.some(m => m.size === DeviceSize.Medium)) {
                theStructure = new MediumRoomThree()
            }

            if (machines.some(m => m.size === DeviceSize.Large)) {
                theStructure = new LargeRoom()
            }

            if (machines.some(m => m.size === DeviceSize.Huge)) {
                theStructure = new HugeRoom()
            }

            if (machines.some(m => m.forDome)) {
                theStructure = new SmallDome()
            }
        }

        console.log("SPAWN FUNCTION", { fn, structure: theStructure })
        let building = this.assembleBuildingFromStructure(theStructure, pos)
        building.reshape(building.constrainCursor(building.pos))
        return building
    }
} 
