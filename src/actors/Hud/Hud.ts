import { UIActor, Label } from "excalibur";
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
import { Modal } from "./Modal";

export class Hud extends UIActor {
    // private hint: Label

    private hidePalettes: boolean = true
    private structurePalette: Palette
    private machinePalette: Palette
    private functionPalette: Palette
    private card: Card
    private status: StatusAnalysisView

    private modal: Modal = null

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

        this.status = new StatusAnalysisView(emptyMarket(), game.canvasWidth, 64);
        this.add(this.status)

        let displayInfo = (e) => this.showCard(e)
        this.machinePalette = new Palette('Machine', 20, 55, allMachines, onMachineSelect, displayInfo) // (e) => this.showCard(e))
        this.structurePalette = new Palette('Structure', 20, 300, Hud.structuresForPalette, onBuildingSelect, displayInfo)
        this.functionPalette = new Palette('Function', 20, 435, Hud.functionsForPalette, onFunctionSelect, displayInfo, false)

        this.card = new Card(null, 20, game.canvas.height - 200)
        this.add(this.card)


    }

    // breakingNews()
    // showModal: boolean = false
    // modal: { message: string, title: string } = null
    systemMessage(message: string, title: string = 'Commander, a message for you',
      buttons: { [intent: string]: () => any }) { //} = { dismiss: () => this.closeSystemMessage() }) {
        console.log("SET MODAL", { message })
        this.modal = new Modal(title, message, this.getWidth()/2, this.getHeight()/2)
        this.modal.addButtons(buttons)

        // this.showModal = true
        // this.modal = {
            // message, title
        // }
    }

    closeSystemMessage() {
        console.log("hide system message")
        this.modal.teardown()
        this.modal = null
    }


    showPalettes() {
        this.hidePalettes = false
    }

    setStatus(text: string) { this.status.setMessage(text) }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)
        if (!this.hidePalettes) {
            this.structurePalette.draw(ctx)
            this.machinePalette.draw(ctx)
            this.functionPalette.draw(ctx)
        }

        if (this.modal) {
            // console.log("okay, we have modal!!")
            this.modal.draw(ctx)
        } else {
            // console.log("no modal")
        }
        // if (this.showModal)
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
        if (!planet) { return }
        if (rebuildPalettes) {
            this.updatePalettes(planet.colony)
        }
        this.updateEconomy(planet)
        this.updateMaxPop(planet.economy[PureValue.Shelter].demand, planet.maxPop)

        this.status.setClock(time)
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
        if (!builtStructures.every(s => this.structurePalette.built.includes(s))) {
            this.structurePalette.updateBuilt(builtStructures)
        }
    }

    private updateMachinePalette(colony: Colony) {
        let devices = colony.findAllDevices()
        let builtMachines = Hud.machinesForPalette.filter((machine) => devices.some(d => d.machine instanceof machine && d.built))
        if (!builtMachines.every(machine => this.machinePalette.built.includes(machine))) {
            this.machinePalette.updateBuilt(builtMachines)
        }
    }

    private updateFunctionPalette(colony: Colony) {
        let builtReifiedFunctions = flatSingle(colony.buildings.map(b => b.spaceFunction))
        let builtFunctions = Hud.functionsForPalette.filter((fn) => builtReifiedFunctions.some(rf => rf instanceof fn))
        if (!builtFunctions.every(fn => this.functionPalette.built.includes(fn))) {
            this.functionPalette.updateBuilt(builtFunctions)
        }
    }

}