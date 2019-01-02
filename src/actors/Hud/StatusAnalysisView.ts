import { Label, Color, Actor, FontStyle, FontUnit } from "excalibur";
import { Economy } from "../../models/Economy";
import { ResourcesList } from "./ResourcesList";

class EconomyView extends Actor {}

// class ResourcesView extends Actor { }

// top status bar
export class StatusAnalysisView extends Actor {
    private messageLabel: Label

    public resources: ResourcesList

    private colonyStatusLabel: Label;
    private powerStatusLabel: Label;
    private atmosphereStatusLabel: Label;
    private shelterStatusLabel: Label;
    private automationStatusLabel: Label;
    private continuityStatusLabel: Label;


    constructor(market: Economy, x: number, y: number, w: number = 10000, h: number = 28) {
        super(x, y, w, h, Color.DarkGray.darken(0.8));

        let ty = 12

        let brand = new Label("OSIRIS", 0, ty+2)
        brand.fontSize = 12
        brand.color = Color.White
        brand.fontStyle = FontStyle.Italic
        this.add(brand)


        this.resources = new ResourcesList(70, ty)
        this.add(this.resources)

        // this.colonyStatusLabel = new Label("Colony: Lost (no wealth/no knowledge/no starport)", x, y)
        // this.colonyStatusLabel.fontSize = 20
        // this.colonyStatusLabel.color = Color.White
        // this.add(this.colonyStatusLabel)
        let { demand: powerDemand, supply: powerSupply } = market['Power'];
        // this.providence = new ProvidenceList()
        let powerStatus = powerDemand < powerSupply ? 'Up' : 'Down';
        this.powerStatusLabel = new Label(`Power: ${powerStatus} (${powerSupply}/${powerDemand})`, 200, ty);
        this.powerStatusLabel.fontSize = 10;
        this.powerStatusLabel.color = Color.White.darken(0.2);
        this.add(this.powerStatusLabel);
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

        this.messageLabel = new Label('hi', 400, ty, 'Helvetica')
        this.messageLabel.fontSize = 10
        this.messageLabel.color = Color.White
        this.add(this.messageLabel)
    }

    setMessage(text: string) { this.messageLabel.text = text }
}
