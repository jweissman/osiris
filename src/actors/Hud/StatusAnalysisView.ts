import { Label, Color, Actor } from "excalibur";
import { Economy } from "../../models/Economy";
export class StatusAnalysisView extends Actor {
    private colonyStatusLabel: Label;
    private powerStatusLabel: Label;
    private atmosphereStatusLabel: Label;
    private shelterStatusLabel: Label;
    private automationStatusLabel: Label;
    private continuityStatusLabel: Label;
    constructor(market: Economy, x: number, y: number, w: number = 200, h: number = 100) {
        super(x + w / 2, y - h / 2, w, h, Color.DarkGray.darken(0.8));
        // this.colonyStatusLabel = new Label("Colony: Lost (no wealth/no knowledge/no starport)", x, y)
        // this.colonyStatusLabel.fontSize = 20
        // this.colonyStatusLabel.color = Color.White
        // this.add(this.colonyStatusLabel)
        let { demand: powerDemand, supply: powerSupply } = market['Power'];
        // this.providence = new ProvidenceList()
        let powerStatus = powerDemand < powerSupply ? 'Up' : 'Down';
        this.powerStatusLabel = new Label(`Power: ${powerStatus} (${powerSupply}/${powerDemand})`, -80, -20);
        this.powerStatusLabel.fontSize = 20;
        this.powerStatusLabel.color = Color.White;
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
    }
}
