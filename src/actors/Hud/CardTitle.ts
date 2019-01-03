import { Label, Color, Actor, FontStyle } from "excalibur";
import { Structure } from "../../models/Structure";
import { Machine } from "../../models/Machine";
export class CardTitle extends Actor {
    
    name: Label;
    type: Label;
    constructor(private entity: Machine | Structure, x: number, y: number) {
        super(x, y, 14, 32, entity && entity.color || Color.Gray);
        // console.log("TITLE FOR", { entity })
        this.name = new Label(entity && entity.name || '..', 20, 16)
        this.name.fontSize = 28
        this.name.color = Color.Black
        this.add(this.name)

        this.type = new Label('..', 240, 16)
        this.type.fontSize = 10
        this.type.color = Color.Gray
        this.type.fontStyle = FontStyle.Italic
        this.add(this.type)
    }

    announce(entity: Machine | Structure): any {
        this.name.text = entity.name
        this.color = entity.color.desaturate(0.5).darken(0.2)
        if (entity instanceof Machine) { this.type.text = 'Machine' }
        if (entity instanceof Structure) { this.type.text = 'Structure' }
    }
}