import { Label, Color, Actor, FontStyle } from "excalibur";
import { Structure } from "../../models/Structure";
import { Machine } from "../../models/Machine";
import { DeviceSize } from "../../values/DeviceSize";
import { SpaceFunction } from "../../models/SpaceFunction";
import { Building } from "../Building";
import { Device } from "../Device";
export class CardTitle extends Actor {
    
    name: Label;
    type: Label;
    constructor(private entity: Machine | Structure | SpaceFunction | Building | Device, x: number, y: number) {
        super(x, y, 14, 32, entity && entity.color || Color.Gray);
        this.name = new Label(entity && entity.name || '..', 20, 16)
        this.name.fontSize = 28
        this.name.color = Color.Black
        this.add(this.name)

        this.type = new Label('..', 232, 16)
        this.type.fontSize = 10
        this.type.color = Color.Gray
        this.type.fontStyle = FontStyle.Italic
        this.add(this.type)

        if (entity) {
            this.announce(entity)
        }
    }

    announce(entity: Machine | Structure | SpaceFunction | Building | Device): any {
        this.name.text = entity.name
        this.color = entity.color.desaturate(0.5).darken(0.2)
        if (entity instanceof Machine) { this.type.text = `${DeviceSize[entity.size]} Machine` }
        if (entity instanceof Structure) { this.type.text = 'Structure' }
        if (entity instanceof SpaceFunction) { this.type.text = 'Function' }
        if (entity instanceof Building) { this.type.text = 'Building' }
        if (entity instanceof Device) { this.type.text = `${DeviceSize[entity.size]} Machine` }
    }
}
