import { Scene, Input, UIActor, Label, Vector } from "excalibur";
import { Game } from "../Game";
import { Planet } from "../actors/planet";
import { Player } from "../actors/player";
import { TunnelView } from "../actors/TunnelView";
import { MissionControlView } from "../actors/MissionControlView";
import { Structure, MissionControl, MainTunnel, Dome, AccessTunnel, CommonArea } from "../models/Structure";
import { Building } from "../actors/Building";
import { Hud } from "../actors/Hud";
import { DomeView } from "../actors/DomeView";
import { AccessTunnelView } from "../actors/AccessTunnelView";
import { CommonAreaView } from "../actors/CommonAreaView";
import { Buttons } from "excalibur/dist/Input";

export class Construct extends Scene {
    private currentBuildingListIndex: number = 0

 

    game: Game
    planet: Planet
    hud: Hud
    player: Player
    buildings: Building[] = []

    dragging: boolean = false
    dragOrigin: Vector

    currentlyBuilding?: Building

    public onInitialize(game: Game) {
        this.game = game

        this.planet = new Planet(game.world.color);
        this.add(this.planet)

        // let { structures } = this.game.world.colony
        // console.log("building structures...")
        // structures.forEach((structure: Structure) => this.spawnBuilding(structure))

        this.player = new Player()
        this.add(this.player)

        this.hud = new Hud();
        this.add(this.hud)


        this.prepareNextBuilding()
        // this.camera.zoom(2, 500)
        // conso
        this.camera.zoom(0.5)
        this.camera.y = -this.planet.depth/2 //+ this.game.halfCanvasHeight
    }

    public onActivate() {
        this.game.input.pointers.primary.on('move', (e: Input.PointerMoveEvent) => {
            if (this.dragging) {
                this.camera.pos = this.camera.pos.add(
                    this.dragOrigin.sub(e.pos)
                )
            } else {
                this.player.pos = e.pos

                let currentBuilding = this.currentlyBuilding
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
                const currentBuilding: Building = this.currentlyBuilding
                let placementValid = !currentBuilding.overlapsAny()
                if (currentBuilding && placementValid && currentBuilding.handleClick(e.pos)) {
                    console.log("BUILD", { currentBuilding })
                    this.planet.placeBuilding(currentBuilding)
                    // this.hud.message(`built the ${currentBuilding.structure.name}`)
                    this.prepareNextBuilding(e.pos)
                }
            } else if (e.button === Input.PointerButton.Middle) {
                // we could try to drag the camera around
                this.dragging = true;
                this.dragOrigin = e.pos
            }
        })

        this.game.input.pointers.primary.on('wheel', (e: Input.WheelEvent) => {
            // console.log("wheel")
            let z = this.camera.getZoom()
            let step = 0.25
            let min = 0.25, max = 8
            let vec = new Vector(e.x, e.y)
            if (e.deltaY < 0) {
                this.camera.zoom(Math.min(z + step, max))
                // this.camera.move(vec, 250)
            } else if (e.deltaY > 0) {
                this.camera.zoom(Math.max(z - step, min))
                // this.camera.pos = vec
            }
        })

        this.game.input.keyboard.on('press', (e: Input.KeyEvent) => {
            if (e.key === Input.Keys.H) {
                if (this.planet.buildings && this.planet.buildings[0]) {
                    this.camera.move(this.planet.buildings[0].pos, 500)
                }
                // this.game.goToScene('simulate')
            }
        })
    }

    public onDeactivate() {
        this.game.input.pointers.primary.off('move')
        this.game.input.pointers.primary.off('down')
        this.game.input.pointers.primary.off('up')
        this.game.input.pointers.primary.off('wheel')
    }

    ////
    static firstStructure = new MissionControl();
    static secondStructure = new MainTunnel();

    static requiredStructureList: Structure[] = [
        new MissionControl(),
        new MainTunnel(),
    ]

    static structureList: Structure[] = [
        new AccessTunnel(),
        new CommonArea(),
        new Dome(),
    ]

    private nextMissingRequiredStructure(): Structure {
        let requiredStructures: Structure[] = Construct.requiredStructureList
        let actualStructureNames: string[] = this.buildings.map(building => building.structure.name)

        console.log({ actualStructureNames, requiredNames: requiredStructures.map(s => s.name) })
        return requiredStructures.find(structure => !actualStructureNames.includes(structure.name))
    }

    protected prepareNextBuilding(pos: Vector = new Vector(0,0)) {
        let structure = Construct.structureList[this.currentBuildingListIndex % Construct.structureList.length]; 
        let nextMissing = this.nextMissingRequiredStructure();
        if (nextMissing) { structure = nextMissing; }
        structure.origin = pos
        this.hud.message(`Place ${structure.name}`)
        let theNextOne = this.spawnBuilding(structure)
        this.currentlyBuilding = theNextOne
        this.currentBuildingListIndex += 1
    }

    static structureViews: { [key: string]: typeof Building } = {
        TunnelView,
        MissionControlView, //: new MissionControlView()
        DomeView,
        AccessTunnelView,
        CommonAreaView
    }

    protected spawnBuilding(structure: Structure): Building {
        console.log("spawn", { structure })
        let anotherBuilding = this.assembleBuildingFromStructure(structure)
        this.add(anotherBuilding)
        this.buildings.push(anotherBuilding)
        return anotherBuilding
    }
    
    private assembleBuildingFromStructure(structure: Structure): Building {
        let View = Construct.structureViews[structure.view]
        let building = new View(structure, this.planet)
        return building;
    }
}