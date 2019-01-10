import { UIActor, Label, Color } from "excalibur";
import { Structure, Corridor, SurfaceRoad, Ladder, allStructures } from "../../models/Structure";
import { Game } from "../../Game";
import { ResourceBlock, emptyMarket, PureValue } from "../../models/Economy";
import { Machine, allMachines } from "../../models/Machine";
import { flatSingle } from "../../Util";
import { Colony } from "../Planet/Colony";
import { StatusAnalysisView } from "./StatusAnalysisView";
import { Device } from "../Device";
import { Planet } from "../Planet/Planet";
import { Card } from "./Card";
import { allSpaceFunctions, SpaceFunction } from "../../models/SpaceFunction";
import { Palette } from "./Palette";
import { Building } from "../Building";
import { Resources } from "../../Resources";
import { MusicPlayer } from "./MusicPlayer";

export class Hud extends UIActor {
    private musicPlayer: MusicPlayer
    private clock: Label

    private hidePalettes: boolean = true
    private structurePalette: Palette //<Structure> 
    private machinePalette: Palette //<Machine>
    private functionPalette: Palette
    private card: Card

    private status: StatusAnalysisView
    static structuresForPalette = [
        SurfaceRoad,
        Corridor,
        Ladder,
        ...allStructures
    ];
    static machinesForPalette = allMachines
    static functionsForPalette = allSpaceFunctions



    constructor(
        game: Game,
        protected onBuildingSelect = null,
        protected onMachineSelect = null,
        protected onFunctionSelect = null
    ) {
        super(0, 0, game.canvasWidth, game.canvasHeight);

        this.status = new StatusAnalysisView(emptyMarket());
        this.add(this.status)

        let displayInfo = (e) => this.showCard(e)
        this.structurePalette = new Palette('Structure', 20, 35, Hud.structuresForPalette, onBuildingSelect, displayInfo)
        this.machinePalette = new Palette('Machine', 20, 300, allMachines, onMachineSelect, displayInfo) // (e) => this.showCard(e))
        this.functionPalette = new Palette('Function', 220, 35, Hud.functionsForPalette, onFunctionSelect, displayInfo, false)

        this.card = new Card(null, 20, 800) // game.canvasHeight - 200)
        this.add(this.card)

        this.clock = new Label('current time', 1340, 15, 'Verdana')
        this.clock.color = Color.White // 'white'
        this.add(this.clock)

        this.musicPlayer = new MusicPlayer(1360, -2, {
            'Crater Rock': Resources.CraterRock,
            'Assembler': Resources.Assembler,
            'Indivision': Resources.Indivision,
            'Understanding': Resources.Understanding,
        })
        // this.add(this.musicPlayer)

    }

    showPalettes() {
        this.hidePalettes = false
    }

    setMessage(text: string) { this.status.setMessage(text) }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)
        this.musicPlayer.draw(ctx)
        if (!this.hidePalettes) {
            this.structurePalette.draw(ctx)
            this.machinePalette.draw(ctx)
            this.functionPalette.draw(ctx)
        }
    }

    update(game: Game, delta: number) {
        super.update(game, delta)
    }

    resourceGathered(resource: ResourceBlock) {
        this.status.incrementResource(resource)
    }

    resourceExpended(resource: ResourceBlock) {
        this.status.decrementResource(resource)
    }

    updateDetails(planet: Planet, rebuildPalettes: boolean = true, time: number = 0) {
        if (rebuildPalettes) {
            this.updatePalettes(planet.colony)
        }
        this.updateEconomy(planet)
        this.updateMaxPop(planet.economy[PureValue.Shelter].demand, planet.maxPop)

        let days = (Math.floor(time / (60 * 24))+1).toString()
        let hh = Math.floor(time / 60) % 24
        let hours = ((hh + 11) % 12 + 1).toString()
        let minutes = (time % 60).toString()
        let ampm = hh < 12 ? 'AM' : 'PM'
        this.clock.text = `Day ${days}. ${hours}:${minutes.padStart(2, '0')} ${ampm}`
    }

    showCard(entity: Machine | Structure | SpaceFunction | Building | Device) {
        this.card.present(entity)
    }

    private updateMaxPop(curr, cap) {
        this.status.showPopCap(curr, cap)
    }

    private updateEconomy(planet: Planet) {
        this.status.showEconomy(planet.economy)
    }

    private updatePalettes(colony: Colony) {
        this.updateBuildingPalette(colony)
        this.updateMachinePalette(colony)
        this.updateFunctionPalette(colony)
    }

    private updateBuildingPalette(colony: Colony) {
        let builtStructures =
            Hud.structuresForPalette.filter((structure) => colony.buildings.some(b => b.structure instanceof structure))

        this.structurePalette.updateBuilt(builtStructures)
    }

    private updateMachinePalette(colony: Colony) {
        let devices = colony.findAllDevices()
        let builtMachines = Hud.machinesForPalette.filter((machine) => devices.some(d => d.machine instanceof machine))
        this.machinePalette.updateBuilt(builtMachines)
    }

    private updateFunctionPalette(colony: Colony) {
        let builtReifiedFunctions = flatSingle(colony.buildings.map(b => b.spaceFunction))
        let builtFunctions = Hud.functionsForPalette.filter((fn) => builtReifiedFunctions.some(rf => rf instanceof fn))
        this.functionPalette.updateBuilt(builtFunctions)
    }

}