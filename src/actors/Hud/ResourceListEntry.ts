import { Label, Color, Actor, UIActor } from "excalibur";
import { ResourceBlock, blockColor } from "../../models/Economy";
class Tooltip extends Actor {
    messageLabel: Label
    constructor(x: number, y: number, message: string) {
        super(x, y, 60, 16, Color.Black)
        this.messageLabel = new Label(message, -16, 6, 'Verdana')
        this.messageLabel.color = Color.White
        this.add(this.messageLabel)
    }
}

export class ResourceListEntry extends UIActor {
    icon: Actor;
    count: Label;
    hovering: boolean = false
    tooltip: Tooltip

    constructor(x: number, y: number, resourceBlock: ResourceBlock, protected value: number) {
        super(x-5, y-5, 20, 10)
        let icon = new Actor(5, 5, 10, 10, blockColor(resourceBlock));
        this.add(icon);
        this.count = new Label(`x${value}`, 15, 10, 'Helvetica');
        this.count.fontSize = 10;
        this.count.color = Color.White;
        this.add(this.count);

        this.tooltip = new Tooltip(0, 5, ResourceBlock[resourceBlock])
        this.tooltip.visible = false
        this.add(this.tooltip)


        this.on('pointerenter', () => {
            this.tooltip.visible = true
        })

        this.on('pointerleave', () => {
            this.tooltip.visible = false
        })
    }


    credit(amt: number) {
        this.value += amt;
        this.count.text = `x${this.value}`;
    }

    debit(amt: number) {
        this.value -= amt
        this.count.text = `x${this.value}`
    }
}
