import { Label, UIActor, Color } from "excalibur";
import { Structure, Corridor, SurfaceRoad, Ladder, SmallRoomThree, SmallRoomTwo, MediumRoom, MidDome, SmallDome, LargeRoom, allStructures } from "../../models/Structure";
import { Game } from "../../Game";
import { ResourceBlock, emptyMarket } from "../../models/Economy";
import { ResourcesList } from "./ResourcesList";
import { Desk, Bookshelf, Machine, CloningVat, WaterCondensingMachine, OxygenExtractor, AlgaeVat, Stove, Bed, Fridge, ResearchServer, Cabin, Orchard, SolarCell, Megafabricator, Arbor, Fabricator, MiningDrill, Preserve, Workstation, Houseplant, allMachines } from "../../models/Machine";
import { flatSingle } from "../../Util";
import { Colony } from "../Planet/Colony";
import { StatusAnalysisView } from "./StatusAnalysisView";

export class Hud extends UIActor {
    private restrictConstruction: boolean = false


    // private resources: ResourcesList
    private status: StatusAnalysisView

    private _structurePaletteElement: HTMLDivElement
    private _machinePaletteElement: HTMLDivElement

    static structuresForPalette = [
        // infra
        SurfaceRoad,
        Corridor,
        Ladder,

        ...allStructures

    ];

    comprehendedStructures: (typeof Structure)[] = []
    builtStructures: (typeof Structure)[] = []

    static machinesForPalette = allMachines

    comprehendedMachines: (typeof Machine)[] = []
    builtMachines: (typeof Machine)[] = []

    constructor(private game: Game, protected onBuildingSelect = null, protected onMachineSelect = null) {
        super(0, 0, game.canvasWidth, game.canvasHeight);


        this._makeStructurePalette(onBuildingSelect)
        this._makeMachinePalette(onMachineSelect)

        // this.resources = new ResourcesList(50, 40)
        // this.add(this.resources)

        this.status = new StatusAnalysisView(emptyMarket, 0, 0,);
        this.add(this.status)

    }

    setMessage(text: string) { this.status.setMessage(text) }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)

        if (this._structurePaletteElement) {
            let left = ctx.canvas.offsetLeft;
            let top = ctx.canvas.offsetTop;
            this._structurePaletteElement.style.left = `${left + 20}px`;
            this._structurePaletteElement.style.top = `${top + 100}px`;
        }
        if (this._machinePaletteElement) {
            let left = ctx.canvas.offsetLeft;
            let top = ctx.canvas.offsetTop;
            this._machinePaletteElement.style.left = `${left + 20}px`;
            this._machinePaletteElement.style.top = `${top + 380}px`;
        }
    }

    resourceGathered(resource: ResourceBlock) {
        this.status.resources.increment(resource)

    }

    updatePalettes(colony: Colony) {
        this.updateBuildingPalette(colony)
        this.updateMachinePalette(colony)
    }

    private updateBuildingPalette(colony: Colony) {
        this.comprehendedStructures = Hud.structuresForPalette
        if (this.restrictConstruction) {
            this.builtStructures =
                Hud.structuresForPalette.filter((structure) => colony.buildings.some(b => b.structure instanceof structure))

            this.comprehendedStructures = this.comprehendedStructures.filter((structure: typeof Structure) => {
                let s = new structure()
                let prereqs: (typeof Structure)[] = s.prereqs
                return prereqs.every((prereq: (typeof Structure)) => {
                    let built = this.builtStructures.some((s: (typeof Structure)) => s === prereq)
                    return built
                })
            })
        }

        // console.log("Built", { built: this.builtStructures, comprehended: this.comprehendedStructures })

        this._structurePaletteElement.parentElement.removeChild(this._structurePaletteElement)
        this._makeStructurePalette(this.onBuildingSelect)
    }

    private updateMachinePalette(colony: Colony) {
        let bldgs = colony.buildings
        let availableMachines = flatSingle(bldgs.map(b => b.structure.machines))
        let devices = colony.findAllDevices()

        this.builtMachines = Hud.machinesForPalette.filter((machine) => devices.some(d => d.machine instanceof machine))
        this.comprehendedMachines = Hud.machinesForPalette.filter((machine: typeof Machine) => {
            let canBuild = availableMachines.includes(machine);
            return canBuild && (new machine()).prereqs.every((prereq: (typeof Machine)) => {
                return this.builtMachines.some((m: (typeof Machine)) => m === prereq)
            })

        })
        this._machinePaletteElement.parentElement.removeChild(this._machinePaletteElement)
        this._makeMachinePalette(this.onMachineSelect)
    }


    protected _makeStructurePalette(fn: (Structure) => any) {
        this._structurePaletteElement = document.createElement('div') 
        this._structurePaletteElement.style.position = 'absolute'
        this._structurePaletteElement.style.border = '1px solid white'
        document.body.appendChild(this._structurePaletteElement)

        this.comprehendedStructures
        .map(structure => new structure())
        .forEach((structure: Structure) => {
            let label = structure.name
            if (!this.builtStructures.map(s => new s().name).includes(structure.name)) {
                label += ' *';
            }
            let clr = structure.dominantColor
            let _paletteButton = this.buttonFactory(label, clr); //structure);
            this._structurePaletteElement.appendChild(
                _paletteButton
            )
            if (fn) {
                _paletteButton.onclick = () => { fn(structure) }
            }
        });
    }

    protected _makeMachinePalette(fn: (Machine) => any) {
        this._machinePaletteElement = document.createElement('div')
        // this._machinePaletteElement.id =
        this._machinePaletteElement.style.position = 'absolute'
        this._machinePaletteElement.style.border = '1px solid white'
        document.body.appendChild(this._machinePaletteElement)

        // Hud.machinesForPalette
        this.comprehendedMachines
            .map(Machine => new Machine())
            .sort((a,b) => a.color > b.color ? -1 : 1)
            .forEach(machine => {
                let label = machine.name
                if (!this.builtMachines.map(m => new m().name).includes(machine.name)) {
                    label += ' *'
                }
                let clr = machine.color
                let btn = this.buttonFactory(label, clr)
                this._machinePaletteElement.appendChild(btn)
                if (fn) {
                    btn.onclick = () => { fn(machine) }
                }
            })
        // this.machin

    }

    private buttonFactory(label: string, color: Color) { //s: Structure) {
        let bg = color.darken(0.6).desaturate(0.5).clone()
        bg.a = 0.8
        let fg = color.lighten(0.8).desaturate(0.4).clone()
        let paletteButton = document.createElement('button');

        paletteButton.textContent = label; // `${s.name}`;

        paletteButton.style.display = 'block';
        paletteButton.style.fontSize = '9pt';

        paletteButton.style.fontFamily = 'Helvetica';
        paletteButton.style.fontWeight = '600';
        paletteButton.style.padding = '3px';
        paletteButton.style.width = '180px';
        paletteButton.style.textTransform = 'uppercase'
        paletteButton.style.border = '1px solid rgba(255,255,255,0.08)'

        paletteButton.style.background = bg.toRGBA();
        paletteButton.style.color = fg.toRGBA()
        paletteButton.onmouseover = () => {
            paletteButton.style.background = bg.saturate(0.5).lighten(0.95).toRGBA()
            paletteButton.style.color = fg.lighten(0.9).toRGBA()
        }
        paletteButton.onmouseleave = () => {
            paletteButton.style.background = bg.toRGBA()
            paletteButton.style.color = fg.toRGBA()
        }

        return paletteButton;
    }
}