import { UIActor, Label, Engine, Color } from "excalibur";
import { Structure, Corridor, SurfaceRoad, Ladder, allStructures } from "../../models/Structure";
import { Game } from "../../Game";
import { ResourceBlock, emptyMarket, PureValue } from "../../models/Economy";
import { Machine, allMachines, PersonnelRegistry } from "../../models/Machine";
import { flatSingle } from "../../Util";
import { Colony } from "../Planet/Colony";
import { StatusAnalysisView } from "./StatusAnalysisView";
import { Device } from "../Device";
import { Planet } from "../Planet/Planet";
import { Card } from "./Card";
import { allSpaceFunctions, RoomRecipe } from "../../models/RoomRecipe";
import { Palette } from "./Palette";
import { Building } from "../Building";
import { Modal } from "./Modal";
import { TechTree } from "../../models/TechTree";
import { CitizenList } from "./CitizenList";
import { Citizen } from "../Citizen";
import { assembleButton } from "../../Elemental";
import { Pane } from "./Pane";

class ActionList extends Pane {

    setup(btns: { label: string, action: () => any }[]) { //}, engine: Engine) {
        btns.forEach(btn => {
            let theButton = assembleButton(btn.label, Color.White)
            theButton.onclick = () => {
                btn.action()
                // engine.goToScene(btn.scene)
            }
            this._element.appendChild(theButton)
        })
    }

}



export class Hud extends UIActor {

    private hidePalettes: boolean = true
    private structurePalette: Palette
    private machinePalette: Palette
    private functionPalette: Palette

    private showCitizenList: boolean = true
    private citizenList: CitizenList

    private actionList: ActionList


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
        private game: Engine,
        private onBuildingSelect = null,
        private onMachineSelect = null,
        private onFunctionSelect = null,
        private onCitizenSelect = null,
    ) {
        super(0, 0, game.canvasWidth, game.canvasHeight);
        let canvasHeight = game.canvasHeight / window.devicePixelRatio;
        let canvasWidth = game.canvasWidth / window.devicePixelRatio;

        this.status = new StatusAnalysisView(emptyMarket(), game.canvasWidth, 64);
        this.add(this.status)

        let displayInfo = (e) => this.showCard(e)
        this.machinePalette = new Palette('Machine', 20, 55, allMachines, onMachineSelect, displayInfo) // (e) => this.showCard(e))
        this.structurePalette = new Palette('Structure', 20, 300, Hud.structuresForPalette, onBuildingSelect, displayInfo)
        this.functionPalette = new Palette('Room Recipe', 20, 435, Hud.functionsForPalette, onFunctionSelect, displayInfo, false)

        this.citizenList = new CitizenList(canvasWidth - 220, 55, onCitizenSelect) //, (citizen) => {})

        this.card = new Card(null, 20, canvasHeight - 200)
        this.add(this.card)

        this.actionList = new ActionList('Actions', canvasWidth - 220, canvasHeight - 100)
        this.actionList.setup([
            { label: 'Main Menu', action: () => {game.goToScene('menu')} },
            // { label: 'Main Menu', action: () => {game.goToScene('menu')} }
        ])
    }

    hide() {
        this.machinePalette.hide()
        this.structurePalette.hide()
        this.functionPalette.hide()
        this.citizenList.hide()
        this.actionList.hide()

        this.status.hide()
    }

    show() {
        this.machinePalette.show()
        this.structurePalette.show()
        this.functionPalette.show()
        this.citizenList.show()
        this.actionList.show()
    }

    systemMessage(
        message: string,
        title: string = 'Commander...',
        buttons: { [intent: string]: () => any },
    ): Modal {

        let canvasHeight = this.game.canvasHeight / window.devicePixelRatio;
        let canvasWidth = this.game.canvasWidth / window.devicePixelRatio;
        this.modal = new Modal(
            title,
            message,
            canvasWidth/2,
            canvasHeight/2,
        ) 
        this.modal.addButtons(buttons)
        return this.modal
    }


    closeSystemMessage() {
        console.log("hide system message")
        if (this.modal) {
            this.modal.teardown()
            this.modal = null
        }
    }


    showPalettes() {
        this.hidePalettes = false
    }

    setStatus(text: string) { this.status.setMessage(text) }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)
        if (!this.hidePalettes) {
            this.structurePalette.draw(ctx)
            this.functionPalette.draw(ctx)

            if (this.machinePalette.comprehended.length > 0) {
                this.machinePalette.draw(ctx)
            }
        }

        if (this.modal) {
            this.modal.draw(ctx)
        }

        if (this.showCitizenList) {
            this.citizenList.draw(ctx)
        }

        this.actionList.draw(ctx)
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

    updateDetails(planet: Planet, techTree: TechTree, following: Citizen, rebuildPalettes: boolean = true, time: number = 0) {
        if (!planet) { return }
        if (rebuildPalettes) {
            this.updatePalettes(planet.colony, techTree)
        }
        this.updateEconomy(planet)
        this.updateMaxPop(planet.economy[PureValue.Shelter].demand, planet.maxPop)

        this.status.setClock(time)

        // let missingCitizens = planet.population.citizens.some(c => !this.citizenList.doesRosterInclude(c))
        // let followedChanged = following !== this.citizenList.following
        // if (missingCitizens || followedChanged) {
        this.citizenList.updateRoster(planet.population.citizens.filter(c => c.alive), following)
        // }

        if (!this.showCitizenList && planet.hasMachineKind(PersonnelRegistry)) {
            this.showCitizenList = true
        }
    }

    showCard(entity: Machine | Structure | RoomRecipe | Building | Device) {
        this.card.present(entity)
    }

    private updateMaxPop(curr, cap) {
        this.status.showPopCap(curr, cap)
    }

    private updateEconomy(planet: Planet) {
        this.status.showEconomy(planet.economy)
    }

    private updatePalettes(colony: Colony, techTree: TechTree) {
        this.updateBuildingPalette(colony)
        this.updateMachinePalette(colony, techTree)
        this.updateFunctionPalette(colony)
    }

    private updateBuildingPalette(colony: Colony) {
        let builtStructures =
            Hud.structuresForPalette.filter((structure) => colony.buildings.some(b => b.structure instanceof structure))
        if (!builtStructures.every(s => this.structurePalette.built.includes(s))) {
            this.structurePalette.updateBuilt(builtStructures)
        }
    }

    private updateMachinePalette(colony: Colony, techTree: TechTree) {
        let devices = colony.findAllDevices()
        let builtMachines = [
            ...Hud.machinesForPalette.filter((machine) => devices.some(d => d.machine instanceof machine && d.built)),
            // ...techTree.allUnlockedMachines()
        ]
        if (!builtMachines.every(machine => this.machinePalette.built.includes(machine))) {
            this.machinePalette.updateBuilt(builtMachines, techTree.allUnlockedMachines())
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