import { Label, UIActor, Color } from "excalibur";
import { Structure, Corridor, SurfaceRoad, Ladder, SmallRoomThree, SmallRoomTwo, MediumRoom, MidDome, SmallDome, LargeRoom } from "../../models/Structure";
import { Game } from "../../Game";
import { ResourceBlock, emptyMarket } from "../../models/Economy";
import { ResourcesList } from "./ResourcesList";
import { Desk, Bookshelf, Machine, CloningVat, WaterCondensingMachine, OxygenExtractor, AlgaeVat, Stove, Bed, Fridge, ResearchServer, Cabin, Orchard, SolarCell, Megafabricator, Arbor, Fabricator, MiningDrill, Preserve, Workstation, Houseplant } from "../../models/Machine";
import { flatSingle } from "../../Util";
import { Colony } from "../Planet/Colony";

export class Hud extends UIActor {
    private messageLabel: Label


    private resources: ResourcesList

    private _structurePaletteElement: HTMLDivElement
    private _machinePaletteElement: HTMLDivElement

    static structuresForPalette = [
        // infra
        SurfaceRoad,
        Corridor,
        Ladder,

        // surface
        SmallDome,
        MidDome,

        // subsurface
        SmallRoomTwo,
        SmallRoomThree,
        MediumRoom,
        LargeRoom,

    ];

    comprehendedStructures: (typeof Structure)[] = []
    builtStructures: (typeof Structure)[] = []

    static machinesForPalette = [
        AlgaeVat,
        Arbor,
        Bed,
        Bookshelf,
        Cabin,
        CloningVat,
        Desk,
        Fabricator,
        Fridge,
        Houseplant,
        Megafabricator,
        MiningDrill,
        Orchard,
        OxygenExtractor,
        Preserve,
        ResearchServer,
        SolarCell,
        Stove,
        WaterCondensingMachine,
        Workstation,
    ]

    comprehendedMachines: (typeof Machine)[] = []
    builtMachines: (typeof Machine)[] = []

    constructor(private game: Game, protected onBuildingSelect = null, protected onMachineSelect = null) {
        super(0, 0, game.canvasWidth, game.canvasHeight);

        this.messageLabel = new Label('hi', 20, game.canvasHeight - 64, 'Verdana')
        this.messageLabel.fontSize = 24
        this.messageLabel.color = Color.White
        this.add(this.messageLabel)

        this._makeStructurePalette(onBuildingSelect)
        this._makeMachinePalette(onMachineSelect)

        this.resources = new ResourcesList(50, 40)
        this.add(this.resources)

        // this.add(this.status)

    }

    setMessage(text: string) { this.messageLabel.text = text }

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
            this._machinePaletteElement.style.left = `${left + this.game.canvasWidth - 180}px`;
            this._machinePaletteElement.style.top = `${top + 100}px`;
        }
    }

    resourceGathered(resource: ResourceBlock) {
        this.resources.increment(resource)

    }

    updatePalettes(colony: Colony) {
        this.updateBuildingPalette(colony)
        this.updateMachinePalette(colony)
    }

    private updateBuildingPalette(colony: Colony) { //bldgs: Building[]) {
        this.builtStructures = //bldgs
          Hud.structuresForPalette.filter((structure) => colony.buildings.some(b => b.structure instanceof structure))


        this.comprehendedStructures = Hud.structuresForPalette.filter((structure: typeof Structure) => {
            let s = new structure()
            let prereqs: (typeof Structure)[] = s.prereqs
            // console.log("can i build", { name: s.name, prereqs })
            return prereqs.every((prereq: (typeof Structure)) => {
                let built = this.builtStructures.some((s: (typeof Structure)) => s === prereq)
                // console.log("do i have any", { prereq, built })
                return built
            })
        })

        console.log("Built", { built: this.builtStructures, comprehended: this.comprehendedStructures })

          // rebuild palette with updated available buildings
        this._structurePaletteElement.parentElement.removeChild(this._structurePaletteElement)
          this._makeStructurePalette(this.onBuildingSelect)
    }

    private updateMachinePalette(colony: Colony) { //bldgs: Building[]) {
        let bldgs = colony.buildings
        let availableMachines = flatSingle(bldgs.map(b => b.structure.machines))
        let devices = colony.findAllDevices() //flatSingle(bldgs.map(b => b.devices))

        this.builtMachines = //flatSingle(bldg.map(b => b.devices))
        Hud.machinesForPalette.filter((machine) => devices.some(d => d.machine instanceof machine))
        // console.log("available machines", { availableMachines })
        this.comprehendedMachines = Hud.machinesForPalette.filter((machine: typeof Machine) => {
            let canBuild = availableMachines.includes(machine);
            // let m = new machine()
            return canBuild && (new machine()).prereqs.every((prereq: (typeof Machine)) => {
                return this.builtMachines.some((m: (typeof Machine)) => m === prereq)
            })

        }) //availableMachines
        this._machinePaletteElement.parentElement.removeChild(this._machinePaletteElement)
        this._makeMachinePalette(this.onMachineSelect)
    }


    protected _makeStructurePalette(fn: (Structure) => any) {
        this._structurePaletteElement = document.createElement('div') 
        // this._structurePaletteElement.id = '_thePalette'
        this._structurePaletteElement.style.position = 'absolute'
        this._structurePaletteElement.style.border = '1px solid white'
        document.body.appendChild(this._structurePaletteElement)

        this.comprehendedStructures
        .map(structure => new structure())
        // .sort((a,b) => a.dominantColor > b.dominantColor ? -1 : 1)
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
        paletteButton.style.fontSize = '12pt';

        paletteButton.style.fontFamily = 'Helvetica';
        paletteButton.style.fontWeight = '600';
        paletteButton.style.padding = '8px';
        paletteButton.style.width = '160px';
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