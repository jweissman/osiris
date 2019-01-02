import { Scene, Input, Vector } from "excalibur";
import { Game } from "../Game";
import { Planet } from "../actors/Planet/Planet";
import { Player } from "../actors/player";
import { Structure, MissionControl, MainTunnel, Corridor, SurfaceRoad, SmallDome, SmallRoomTwo, SmallDomeThree } from "../models/Structure";
import { Building, DomeView, CorridorView, CommonAreaView, TunnelView, MissionControlView, LadderView, ArcologyView, } from "../actors/Building";
import { Hud } from "../actors/Hud/Hud";
import { SurfaceRoadView } from "../actors/Building/SurfaceRoadView";
import { Device } from "../actors/Device";
import { Machine } from "../models/Machine";
import { SmallRoomThreeView } from "../actors/Building/SmallRoomThreeView";
import { MidDomeView } from "../actors/Building/MidDomeView";
import { MediumRoomView } from "../actors/Building/MediumRoomView";
import { LargeRoomView } from "../actors/Building/LargeRoomView";
import { HugeRoomView } from "../actors/Building/HugeRoomView";
import { BigDomeView } from "../actors/Building/BigDomeView";
import { SmallDomeThreeView } from "../actors/Building/SmallDomeThreeView";


export class Construct extends Scene {
    game: Game
    planet: Planet
    hud: Hud
    player: Player

    dragging: boolean = false
    dragOrigin: Vector

    defaultMessage: string = 'Welcome to the Colony, Commander.'

    static structureViews: { [key: string]: typeof Building } = {
        CorridorView,
        LadderView,
        TunnelView,
        SurfaceRoadView,

        DomeView, // small dome 2
        SmallDomeThreeView,
        MidDomeView,
        BigDomeView,

        MissionControlView,
        // SmallRoomTwoView, [ none, same as common area? ]
        SmallRoomThreeView,

        CommonAreaView,
        MediumRoomView,
        LargeRoomView,
        HugeRoomView,

        ArcologyView,
    }
    ////
    static requiredStructureList: Array<typeof Structure> = [
        MissionControl,
        SurfaceRoad,
        // SmallDome,
        SmallDomeThree,
        MainTunnel,
        Corridor,
        SmallRoomTwo,
    ]

    update(engine, delta) {
        super.update(engine, delta)

        this.hud.updateDetails(this.planet, false)
    }

    public onInitialize(game: Game) {
        this.game = game


        this.hud = new Hud(game, (structure) => {
            // console.log('would build', { structure })
            this.startConstructing(structure)
        }, (device) => {
            this.startConstructing(device)
        });
        this.add(this.hud)

        this.planet = new Planet(this.hud, game.world.color);
        this.add(this.planet)
  
        this.player = new Player()
        this.add(this.player)

        this.prepareNextBuilding()
        this.camera.zoom(0.001)
        this.camera.zoom(2, 10000)
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
                    // console.warn("would snap device in place!")
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
                // cancel building in progress?
                this.planet.colony.currentlyConstructing = null
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


    private nextMissingRequiredStructure(): Structure {
        let requiredStructures: Structure[] = Construct.requiredStructureList.map(s => new s())
        let actualStructureNames: string[] = this.buildings.map(building => building.structure.name)

        return requiredStructures.find(structure => !actualStructureNames.includes(structure.name))
    }

    protected prepareNextBuilding(pos: Vector = new Vector(0,0)) {
        let structure = null;
        let nextMissing = this.nextMissingRequiredStructure();
        if (nextMissing) { structure = nextMissing; }
        if (structure) {
            this.startConstructing(structure, pos)
        } //else {
            // this.hud.setMessage(`Welcome to OSIRIS!`)
        // }
    }

    startConstructing(structureOrMachine: Structure | Machine, pos: Vector = new Vector(0, 0)) {
        
        // console.log("START CONSTRUCTING", { structureOrMachine })
        let theNextOne = null
        if (structureOrMachine instanceof Structure) {
            let structure = structureOrMachine
            // structure.origin = pos // thread this out somehow??
            this.hud.setMessage(`Place ${structure.name} (${structure.description})`)
            theNextOne = this.spawnBuilding(structure, pos)
            this.camera.zoom(structure.zoom, 250)
        } else if (structureOrMachine instanceof Machine) {
            // setup machine?
            let machine = structureOrMachine
            // machine.origin = pos
            this.hud.setMessage(`Install ${machine.name} (${machine.description})`)

            theNextOne = this.spawnDevice(machine, pos)
            this.camera.zoom(1.5, 250)
        }

        this.planet.colony.currentlyConstructing = null
        if (theNextOne) {
            this.planet.colony.currentlyConstructing = theNextOne
            // console.warn("would start constructing", { theNextOne })
            this.camera.pos = theNextOne.pos
        }
    }

    protected spawnDevice(machine: Machine, pos: Vector): Device {
        let device = new Device(machine, pos)
        device.snap(this.planet)
        return device
    }

    protected spawnBuilding(structure: Structure, pos: Vector): Building {
        let anotherBuilding = this.assembleBuildingFromStructure(structure, pos)
        anotherBuilding.reshape(anotherBuilding.constrainCursor(anotherBuilding.pos))
        return anotherBuilding
    }
    
    private assembleBuildingFromStructure(structure: Structure, pos: Vector): Building {
        let View = Construct.structureViews[structure.view]
        let building = new View(pos, structure, this.planet)
        return building;
    }
} 
