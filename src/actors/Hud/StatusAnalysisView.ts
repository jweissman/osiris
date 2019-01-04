import { Label, Color, Actor, FontStyle, FontUnit } from "excalibur";
import { Economy, ResourceBlock, PureValue } from "../../models/Economy";
import { ResourcesList } from "./ResourcesList";
import { EconomyView } from "./EconomyView";

export class StatusAnalysisView extends Actor {
    private messageLabel: Label
    private popLabel: Label

    private resources: ResourcesList
    private economy: EconomyView


    constructor(market: Economy, w: number = 10000, h: number = 36) {
        super(0,0, w, h, Color.DarkGray.darken(0.8));

        let ty = 14

        let brand = new Label("OSIRIS", 5, ty+2)
        brand.fontSize = 12
        brand.color = Color.Gray
        brand.fontStyle = FontStyle.Italic
        this.add(brand)

        let version = new Label("v0.0.1", 48, ty + 2)
        version.fontSize = 7
        version.color = Color.Gray.darken(0.4)
        this.add(version)


        this.resources = new ResourcesList(80, ty)
        this.add(this.resources)

        this.economy = new EconomyView(market, 200, ty)
        this.add(this.economy)

        this.popLabel = new Label("", 900, ty, 'Helvetica')
        this.popLabel.fontSize = 10
        this.popLabel.color = Color.White
        this.add(this.popLabel)

        this.messageLabel = new Label('hi', 1000, ty, 'Helvetica')
        this.messageLabel.fontSize = 10
        this.messageLabel.color = Color.White
        this.messageLabel.fontStyle = FontStyle.Italic
        this.add(this.messageLabel)
    }

    incrementResource(res: ResourceBlock) {
        this.resources.increment(res)
    }

    setMessage(text: string) { this.messageLabel.text = text }

    showEconomy(updatedEconomy: Economy): any {
        this.economy.updateView(updatedEconomy)
    }

    showPopCap(curr: any, cap: any): any {
        this.popLabel.text = `Pop: ${curr}/${cap}`
    }
    
}
