import { Label, Color, Actor, FontStyle, FontUnit } from "excalibur";
import { Economy, ResourceBlock, PureValue } from "../../models/Economy";
import { ResourcesList } from "./ResourcesList";
import { EconomyView } from "./EconomyView";
import { MusicPlayer } from "./MusicPlayer";
import { Resources } from "../../Resources";
import { drawRect } from "../../Painting";

export class StatusAnalysisView extends Actor {
    private messageLabel: Label
    private popLabel: Label

    private resources: ResourcesList
    private economy: EconomyView

    private musicPlayer: MusicPlayer
    private clock: Label

    constructor(market: Economy, w: number, h: number) {
        super(0,0, w*2,h, Color.DarkGray.clone().darken(0.92));

        let ty = 14

        let brand = new Label("OSIRIS", 5, ty+18)
        brand.fontSize = 28
        brand.color = Color.Gray
        brand.fontStyle = FontStyle.Italic
        this.add(brand)

        let version = new Label("v0.1", 100, ty + 14)
        version.fontSize = 7
        version.color = Color.Gray.darken(0.4)
        this.add(version)


        this.resources = new ResourcesList(160, ty)
        this.add(this.resources)

        this.economy = new EconomyView(market, 320, ty)
        this.add(this.economy)

        this.clock = new Label('current time', 650, ty, 'Verdana')
        this.clock.color = Color.White // 'white'
        this.add(this.clock)

        this.popLabel = new Label("", 650, ty + 14, 'Verdana')
        this.popLabel.fontSize = 10
        this.popLabel.color = Color.White
        this.add(this.popLabel)

        this.messageLabel = new Label('hi', 780, ty, 'Verdana')
        this.messageLabel.fontSize = 10
        this.messageLabel.color = Color.White
        this.messageLabel.fontStyle = FontStyle.Italic
        this.add(this.messageLabel)

        this.musicPlayer = new MusicPlayer(756, 12, {
            'Crater Rock': Resources.CraterRock,
            'Indivision': Resources.Indivision,
            'Future Tense': Resources.FutureTense,
            // 'Isomer': Resources.Isomer,
            'Understanding': Resources.Understanding,
            // 'Outbound': Resources.Outbound,
            'Assembler': Resources.Assembler,
        })
// // enable propagating pointer events
// this.enableCapturePointer = true;
// // // enable move events, warning: performance intensive!
// this.capturePointer.captureMoveEvents = true;
//         this.on('pointerenter', () => { alert('hover!')})
    }

    draw(ctx, delta) {
        super.draw(ctx, delta)
        this.musicPlayer.draw(ctx)
        // drawRect(
        //     ctx,
        //     {x: this.x, y: this.y, width: this.getWidth(), height: this.getHeight() },
        //     0,
        //     Color.Magenta
        // )
    }

    incrementResource(res: ResourceBlock) {
        this.resources.increment(res)
    }

    decrementResource(res: ResourceBlock) {
        this.resources.decrement(res)
    }

    setMessage(text: string) { this.messageLabel.text = text }

    showEconomy(updatedEconomy: Economy): any {
        this.economy.updateView(updatedEconomy)
    }

    showPopCap(curr: any, cap: any): any {
        this.popLabel.text = `Pop: ${curr}/${cap}`
    }

    setClock(time: number = 0) {
        let days = (Math.floor(time / (60 * 24))+1).toString()
        let hh = Math.floor(time / 60) % 24
        let hours = Math.floor((hh + 11) % 12 + 1).toString()
        let minutes = Math.floor(time % 60).toString()
        let ampm = hh < 12 ? 'AM' : 'PM'
        this.clock.text = `Day ${days}. ${hours}:${minutes.padStart(2, '0')} ${ampm}`
    }
    
}
