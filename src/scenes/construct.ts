import { Scene, Input, UIActor, Label, Vector, LockCameraToActorStrategy } from "excalibur";
import { Game } from "../Game";
import { Planet } from "../actors/Planet/Planet";
import { Player } from "../actors/player";
import { Structure, MissionControl, MainTunnel, Dome, Corridor, SurfaceRoad, Kitchen, CloneMatrix } from "../models/Structure";
import { Building, DomeView, CorridorView, CommonAreaView, TunnelView, MissionControlView, LadderView, MineView, LabView, } from "../actors/Building";
import { Hud } from "../actors/Hud/Hud";
import { SurfaceRoadView } from "../actors/Building/SurfaceRoadView";
import { KitchenView } from "../actors/Building/KitchenView";
import { PowerPlantView } from "../actors/Building/PowerPlantView";
import { StudyView } from "../actors/Building/StudyView";
import { RefineryView } from "../actors/Building/RefineryView";
import { ArcologyView } from "../actors/Building/ArcologyView";
import { CloneMatrixView } from "../actors/Building/CloneMatrixView";


export class Construct extends Scene {
    game: Game
    planet: Planet
    hud: Hud
    player: Player

    dragging: boolean = false
    dragOrigin: Vector

    static structureViews: { [key: string]: typeof Building } = {
        TunnelView,
        MissionControlView,
        DomeView,
        CorridorView,
        CommonAreaView,
        SurfaceRoadView,
        LabView,
        MineView,
        KitchenView,
        PowerPlantView,
        StudyView,
        RefineryView,

        ArcologyView,
        CloneMatrixView,

        LadderView,
    }
    ////
    static requiredStructureList: Array<typeof Structure> = [
        MissionControl,

        SurfaceRoad,
        Dome,
        MainTunnel,
        Corridor,
        Kitchen,
        CloneMatrix,
    ]

    public onInitialize(game: Game) {
        this.game = game


        this.hud = new Hud(game, 'hi', (structure) => {
            this.startConstructing(structure)
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

                let currentBuilding = this.planet.currentlyConstructing
                if (currentBuilding) {
                    let constrained = currentBuilding.constrainCursor(this.player.pos)
                    this.player.pos = constrained

                    currentBuilding.reshape(this.player.pos)
                }
            }
        })

        this.game.input.pointers.primary.on('up', (e: Input.PointerUpEvent) => {
            if (this.dragging) { this.dragging = false; }
        })

        this.game.input.pointers.primary.on('down', (e: Input.PointerDownEvent) => {
            if (e.button == Input.PointerButton.Left) {
                const currentBuilding: Building = this.planet.currentlyConstructing
                if (currentBuilding) {
                    let placementValid = !currentBuilding.overlapsAny()
                    if (currentBuilding && placementValid && currentBuilding.handleClick(e.pos)) {
                        this.planet.placeBuilding(currentBuilding)
                        this.planet.colony.currentlyConstructing = null
                        this.prepareNextBuilding(e.pos)
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
        } else {
            this.hud.message(`Welcome to OSIRIS!`)
        }
    }

    startConstructing(structure: Structure, pos: Vector = new Vector(0, 0)) {
        structure.origin = pos
        this.hud.message(`Place ${structure.name}`)
        let theNextOne = this.spawnBuilding(structure)
        this.planet.colony.currentlyConstructing = theNextOne
        this.camera.pos = theNextOne.pos
        this.camera.zoom(structure.zoom, 250)
    }

    protected spawnBuilding(structure: Structure): Building {
        let anotherBuilding = this.assembleBuildingFromStructure(structure)
        anotherBuilding.reshape(anotherBuilding.constrainCursor(anotherBuilding.pos))
        return anotherBuilding
    }
    
    private assembleBuildingFromStructure(structure: Structure): Building {
        let View = Construct.structureViews[structure.view]
        let building = new View(structure, this.planet)
        return building;
    }
} 
