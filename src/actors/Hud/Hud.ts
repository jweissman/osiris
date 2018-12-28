import { Label, UIActor, Color, Actor } from "excalibur";
import { Dome, Structure, Corridor, CommonArea, SurfaceRoad, Mine, Laboratory, Kitchen, PowerPlant, Study, Refinery, CloneMatrix, Arcology, Ladder, OxygenAccumulator, SolarFarm } from "../../models/Structure";
import { Game } from "../../Game";
import { ResourceBlock, Economy, PureValue, emptyMarket } from "../../models/Economy";
import { ResourcesList } from "./ResourcesList";
import { Building } from "../Building";

class StatusAnalysisView extends Actor {
    private colonyStatusLabel: Label
    private powerStatusLabel: Label
    private atmosphereStatusLabel: Label
    private shelterStatusLabel: Label
    private automationStatusLabel: Label
    private continuityStatusLabel: Label

    constructor(market: Economy, x: number, y: number, w: number = 200, h: number = 100) {
        super(x+w/2, y-h/2, w, h, Color.DarkGray.darken(0.8))
        // this.colonyStatusLabel = new Label("Colony: Lost (no wealth/no knowledge/no starport)", x, y)
        // this.colonyStatusLabel.fontSize = 20
        // this.colonyStatusLabel.color = Color.White
        // this.add(this.colonyStatusLabel)

        let { demand: powerDemand, supply: powerSupply } = market['Power']

        // this.providence = new ProvidenceList()
        let powerStatus = powerDemand < powerSupply ? 'Up' : 'Down'
        this.powerStatusLabel = new Label(
            `Power: ${powerStatus} (${powerSupply}/${powerDemand})`,
            -80, -20
        )
        this.powerStatusLabel.fontSize = 20
        this.powerStatusLabel.color = Color.White
        this.add(this.powerStatusLabel)

        // this.shelterStatusLabel = new Label("Shelter: Inadequate (no housing demand/no housing supply)", x, y + 40)
        // this.shelterStatusLabel.fontSize = 20
        // this.shelterStatusLabel.color = Color.White
        // this.add(this.shelterStatusLabel)

        // this.atmosphereStatusLabel = new Label("Atmosphere: Toxic (no O2 demand/no O2 supply/no CO2 scrubbing)", x, y + 60)
        // this.atmosphereStatusLabel.fontSize = 20
        // this.atmosphereStatusLabel.color = Color.White
        // this.add(this.atmosphereStatusLabel)

        // this.automationStatusLabel = new Label("Automation: Primitive (no algorithmic demand/no algorithmic supply)", x, y + 80)
        // this.automationStatusLabel.fontSize = 20
        // this.automationStatusLabel.color = Color.White
        // this.add(this.automationStatusLabel)

        // this.continuityStatusLabel = new Label("Praxis Continuity: Mortal (no ghosts/no neural webs/no academies)", x, y + 100)
        // this.continuityStatusLabel.fontSize = 20
        // this.continuityStatusLabel.color = Color.White
        // this.add(this.continuityStatusLabel)
    }
}

export class Hud extends UIActor {
    private messageLabel: Label


    private resources: ResourcesList
    private status: StatusAnalysisView

    private _paletteElement: HTMLDivElement

    static structuresForPalette = [
        SurfaceRoad,
        Corridor, 
        Ladder,

        // LivingQuarters, 
        Dome, Kitchen,
        // Mess,

        Study, Laboratory,
        Mine, Refinery,
        PowerPlant,

        CloneMatrix,
        Arcology,

        OxygenAccumulator,
        SolarFarm

   // CommonArea,
    ];

    comprehendedStructures: (typeof Structure)[] = []

    constructor(game: Game, protected onBuildingSelect = null) {
        super(0, 0, game.canvasWidth, game.canvasHeight);

        this.messageLabel = new Label('hi', 20, game.canvasHeight - 64, 'Verdana')
        this.messageLabel.fontSize = 24
        this.messageLabel.color = Color.White
        this.add(this.messageLabel)

        this._makePalette(onBuildingSelect)

        this.resources = new ResourcesList(50, 40)
        this.add(this.resources)

        // start economy empty?
        let econ = emptyMarket
        let statusX = 20;
        let statusY = game.canvasHeight - 200
        this.status = new StatusAnalysisView(econ, statusX, statusY)
        // this.add(this.status)

    }

    setMessage(text: string) { this.messageLabel.text = text }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)

        if (this._paletteElement) {
            let left = ctx.canvas.offsetLeft;
            let top = ctx.canvas.offsetTop;
            this._paletteElement.style.left = `${left + 20}px`;
            this._paletteElement.style.top = `${top + 100}px`;
        }
    }

    resourceGathered(resource: ResourceBlock) {
        this.resources.increment(resource)
    }

    updatePalette(bldgs: Building[]) {
        let builtStructures: (typeof Structure[]) = //bldgs
          Hud.structuresForPalette.filter((structure) => bldgs.some(b => b.structure instanceof structure))


        this.comprehendedStructures = Hud.structuresForPalette.filter((structure: typeof Structure) => {
            let s = new structure()
            let prereqs: (typeof Structure)[] = s.prereqs
            console.log("can i build", { name: s.name, prereqs })
            return prereqs.every((prereq: (typeof Structure)) => {
                let built = builtStructures.some((s: (typeof Structure)) => s === prereq)
                console.log("do i have any", { prereq, built })
                return built
            })
        })

          console.log("Built", { builtStructures, comprehended: this.comprehendedStructures })

          // rebuild palette with updated available buildings
        this._paletteElement.parentElement.removeChild(this._paletteElement)
          this._makePalette(this.onBuildingSelect)
    }

    protected _makePalette(fn: (Structure) => any) {
        this._paletteElement = document.createElement('div') 
        this._paletteElement.id = '_thePalette'
        this._paletteElement.style.position = 'absolute'
        this._paletteElement.style.border = '1px solid white'
        document.body.appendChild(this._paletteElement)

        this.comprehendedStructures
        .map(structure => new structure())
        .sort((a,b) => a.dominantColor > b.dominantColor ? -1 : 1)
        .forEach((structure: Structure) => {
            let _paletteButton = this.buttonFactory(structure);
            this._paletteElement.appendChild(
                _paletteButton
            )
            _paletteButton.onclick = (e) => { fn(structure) }
        });
    }

    private buttonFactory(s: Structure) {
        let bg = s.dominantColor.darken(0.8) //.desaturate(0.25) //.toRGBA()
        bg.a = 0.6
        let fg = Color.Blue.lighten(0.8).desaturate(0.55) //.toRGBA()
        let paletteButton = document.createElement('button');
        paletteButton.textContent = `${s.name}`;
        paletteButton.style.display = 'block';
        paletteButton.style.fontSize = '10pt';

        paletteButton.style.fontFamily = 'Helvetica';
        paletteButton.style.fontWeight = '600';
        paletteButton.style.padding = '8px';
        paletteButton.style.width = '130px';
        paletteButton.style.textTransform = 'uppercase'
        paletteButton.style.border = 'none'

        paletteButton.style.background = bg.toRGBA();
        paletteButton.style.color = fg.toRGBA()
        paletteButton.onmouseover = () => {
            paletteButton.style.background = bg.lighten(0.4).toRGBA()
            paletteButton.style.color = fg.lighten(0.9).toRGBA()
        }
        paletteButton.onmouseleave = () => {
            paletteButton.style.background = bg.toRGBA()
            paletteButton.style.color = fg.toRGBA()
        }

        return paletteButton;
    }
}