import { Scene, Input, UIActor, Label, Vector, LockCameraToActorStrategy } from "excalibur";
import { Game } from "../Game";
import { Planet } from "../actors/Planet/Planet";
import { Player } from "../actors/player";
import { Structure, MissionControl, MainTunnel, Dome, AccessTunnel, CommonArea, LivingQuarters, SurfaceRoad } from "../models/Structure";
import { Building, DomeView, AccessTunnelView, CommonAreaView, TunnelView, MissionControlView, LivingQuartersView } from "../actors/Building";
import { Hud } from "../actors/Hud";
import { Citizen } from "../actors/Citizen";
import { range } from "../Util";
import { SurfaceRoadView } from "../actors/Building/SurfaceRoadView";


export class Construct extends Scene {
    static structureViews: { [key: string]: typeof Building } = {
        TunnelView,
        MissionControlView, //: new MissionControlView()
        DomeView,
        AccessTunnelView,
        CommonAreaView,
        LivingQuartersView,
        SurfaceRoadView
    }
    private currentBuildingListIndex: number = 0

    game: Game
    planet: Planet
    hud: Hud
    player: Player
    buildings: Building[] = []
    people: Citizen[] = []

    dragging: boolean = false
    dragOrigin: Vector

    currentlyBuilding?: Building

    public onInitialize(game: Game) {
        this.game = game

        this.planet = new Planet(game.world.color);
        this.add(this.planet)
  
        this.player = new Player()
        this.add(this.player)

        this.hud = new Hud('hi', (structure) => {
            if (this.currentlyBuilding) {
                this.remove(this.currentlyBuilding)
            }
            this.startConstructing(structure)
        });
        this.add(this.hud)

        this.prepareNextBuilding()
        // this.camera.zoom(0.25)
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
                if (currentBuilding) {
                    let placementValid = !currentBuilding.overlapsAny()
                    // console.log("placement valid?", { placementValid, currentBuilding })
                    if (currentBuilding && placementValid && currentBuilding.handleClick(e.pos)) {
                        // console.log("placed!")
                        this.planet.placeBuilding(currentBuilding)
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
                if (this.planet.buildings && this.planet.buildings[0]) {
                    this.camera.move(this.planet.buildings[0].pos, 500)
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

    ////
    static firstStructure = new MissionControl();
    static secondStructure = new MainTunnel();

    static requiredStructureList: Structure[] = [
        new MissionControl(),

        new SurfaceRoad(),
        new Dome(),
        new MainTunnel(),
        new AccessTunnel(),
        new LivingQuarters(),
        // new CommonArea(),
    ]

    static structureList: Structure[] = [
        //new AccessTunnel(),
        //new LivingQuarters(),
        //new AccessTunnel(),
        //new CommonArea(),
    ]

    private nextMissingRequiredStructure(): Structure {
        let requiredStructures: Structure[] = Construct.requiredStructureList
        let actualStructureNames: string[] = this.buildings.map(building => building.structure.name)

        // console.log({ actualStructureNames, requiredNames: requiredStructures.map(s => s.name) })
        return requiredStructures.find(structure => !actualStructureNames.includes(structure.name))
    }

    protected prepareNextBuilding(pos: Vector = new Vector(0,0)) {
        let structure = Construct.structureList[this.currentBuildingListIndex % Construct.structureList.length]; 
        let nextMissing = this.nextMissingRequiredStructure();
        if (nextMissing) { structure = nextMissing; }
        else { this.currentBuildingListIndex += 1 }
        this.startConstructing(structure, pos)
    }

    startConstructing(structure: Structure, pos: Vector = new Vector(0,0)) {
        this.currentlyBuilding = null // ?
        if (structure) {
            structure.origin = pos
            this.hud.message(`Place ${structure.name}`)
            let theNextOne = this.spawnBuilding(structure)
            this.currentlyBuilding = theNextOne
            // this.camera.pos = theNextOne.constrainCursor(this.player.pos) //camera.pos)
            this.camera.pos = theNextOne.pos // move(theNextOne.pos, 250)
            this.camera.zoom(structure.zoom, 250)
        } else {
            this.hud.message(`Welcome to OSIRIS`)

            // spawn people?
            for(let i in range(1)) this.spawnCitizen()
            
            // this.camera.addStrategy(new LockCameraToActorStrategy(this.people[0]))
        }
    }

    protected spawnCitizen() {
        // let ctrl = this.planet.closestBuildingByType(this.player.pos, MissionControl) //bubuildings[0] //.pos
        // let dome = this.planet.closestBuildingByType(this.player.pos, Dome)
        let home = this.planet.closestBuildingByType(this.player.pos, LivingQuarters)
        //buildings[1]
        let citizen = new Citizen(home, this.planet) //ctrl.x, ctrl.y)
        citizen.work(Dome, MissionControl) // LivingQuarters)

        // citizen.y = this.planet.getTop() + citizen.getHeight() / 3
        this.people.push(citizen)
        this.add(citizen)
        // citizen.setZIndex(1000)
    }



    protected spawnBuilding(structure: Structure): Building {
        console.log("spawn", { structure })
        let anotherBuilding = this.assembleBuildingFromStructure(structure)
        anotherBuilding.reshape(anotherBuilding.constrainCursor(anotherBuilding.pos))
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
