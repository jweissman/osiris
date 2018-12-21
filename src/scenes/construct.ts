import { Scene, Input, UIActor, Label, Vector, LockCameraToActorStrategy } from "excalibur";
import { Game } from "../Game";
import { Planet } from "../actors/Planet/Planet";
import { Player } from "../actors/player";
import { Structure, MissionControl, MainTunnel, Dome, AccessTunnel, CommonArea, LivingQuarters, SurfaceRoad, Kitchen, Mess } from "../models/Structure";
import { Building, DomeView, AccessTunnelView, CommonAreaView, TunnelView, MissionControlView, LivingQuartersView } from "../actors/Building";
import { Hud } from "../actors/Hud";
import { SurfaceRoadView } from "../actors/Building/SurfaceRoadView";
import { LabView } from "../actors/Building/LabView";
import { MineView } from "../actors/Building/MineView";
import { MessView } from "../actors/Building/MessView";
import { KitchenView } from "../actors/Building/KitchenView";
import { PowerPlantView } from "../actors/Building/PowerPlantView";


export class Construct extends Scene {
    game: Game
    planet: Planet
    hud: Hud
    player: Player
    // buildings: Building[] = []
    // people: Citizen[] = []

    dragging: boolean = false
    dragOrigin: Vector

    // currentlyBuilding?: Building

    static structureViews: { [key: string]: typeof Building } = {
        TunnelView,
        MissionControlView, //: new MissionControlView()
        DomeView,
        AccessTunnelView,
        CommonAreaView,
        LivingQuartersView,
        SurfaceRoadView,
        LabView,
        MineView,
        KitchenView,
        MessView,
        PowerPlantView
    }
    ////
    static requiredStructureList: Array<typeof Structure> = [
        MissionControl,

        SurfaceRoad,
        Dome,
        MainTunnel,
        AccessTunnel,
        Kitchen,
        Mess,
        LivingQuarters,
        
        //CommonArea,
    ]

    public onInitialize(game: Game) {
        this.game = game


        this.hud = new Hud(game, 'hi', (structure) => {
            //if (this.currentlyBuilding) {
            //    this.remove(this.currentlyBuilding)
            //}
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
        // this.camera.y = 0 //-this.planet.depth/2
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
                    // constrain...
                    let constrained = currentBuilding.constrainCursor(this.player.pos)
                    this.player.pos = constrained

                    currentBuilding.reshape(this.player.pos)
                } else {
                    // show pluses where you could expand?
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
                    // console.log("placement valid?", { placementValid, currentBuilding })
                    if (currentBuilding && placementValid && currentBuilding.handleClick(e.pos)) {
                        // console.log("placed!")
                        this.planet.placeBuilding(currentBuilding)
                        this.planet.currentlyConstructing = null
                        this.prepareNextBuilding(e.pos)
                    } else {
                        // console.log("couldn't place?")
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


    get buildings() { return this.planet.buildings }


    private nextMissingRequiredStructure(): Structure {
        let requiredStructures: Structure[] = Construct.requiredStructureList.map(s => new s())
        let actualStructureNames: string[] = this.buildings.map(building => building.structure.name)

        // console.log({ actualStructureNames, requiredNames: requiredStructures.map(s => s.name) })
        return requiredStructures.find(structure => !actualStructureNames.includes(structure.name))
    }

    protected prepareNextBuilding(pos: Vector = new Vector(0,0)) {
        // let structure = Construct.structureList[this.currentBuildingListIndex % Construct.structureList.length]; 
        let structure = null;
        let nextMissing = this.nextMissingRequiredStructure();
        if (nextMissing) { structure = nextMissing; }
        // else { this.currentBuildingListIndex += 1 }
        if (structure) {
            this.startConstructing(structure, pos)
        } else {
            this.hud.message(`Welcome to OSIRIS`)
        }
    }

    startConstructing(structure: Structure, pos: Vector = new Vector(0, 0)) {
        structure.origin = pos
        this.hud.message(`Place ${structure.name}`)
        let theNextOne = this.spawnBuilding(structure)
        this.planet.currentlyConstructing = theNextOne
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
