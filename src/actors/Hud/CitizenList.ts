import { Color } from "excalibur";
import { Pane } from "./Pane";
import { Citizen } from "../Citizen";
export class CitizenList extends Pane {
    citizens: Citizen[] = [];
    constructor(x: number, y: number, private onCitizenSelect: (Citizen) => any = null) {
        super("Citizens", x, y);
    }
    updateRoster(citizens: Citizen[]): any {
        this.citizens = citizens;
        this.makeRoster();
    }
    private makeRoster() {
        this.makeRootElement();
        this.citizens.forEach(citizen => {
            let btn = this.buttonFactory(citizen.name, Color.DarkGray);
            this._element.appendChild(btn);
            if (this.onCitizenSelect) {
                btn.onclick = () => { this.onCitizenSelect(citizen); };
            }
        });
    }
}
