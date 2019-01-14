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
        super(x-5, y-5, 20, 10) //, Color.Blue); // 10,10,blockColor(resourceBlock))
        let icon = new Actor(5, 5, 10, 10, blockColor(resourceBlock)); //ResourceBlock.Meal))
        this.add(icon);
        this.count = new Label(`x${value}`, 15, 10, 'Helvetica');
        this.count.fontSize = 10;
        this.count.color = Color.White;
        this.add(this.count);

        this.tooltip = new Tooltip(0, 5, ResourceBlock[resourceBlock])
        this.tooltip.visible = false
        this.add(this.tooltip)


        this.on('pointerenter', () => {
            // console.log("HOVER ON",{ resourceBlock })
            // this.count.fontSize = 15
            // this.color = Color.Green
            // this.hovering = true
            this.tooltip.visible = true
            // this.tooltip.z = -1000 //setZIndex(-100)
        })

        this.on('pointerleave', () => {
            // this.hovering = false
            this.tooltip.visible = false
        })
    }

    // draw(ctx, delta) { 
    //     super.draw(ctx, delta)

    // }

    credit(amt: number) {
        this.value += amt;
        this.count.text = `x${this.value}`;
    }

    debit(amt: number) {
        this.value -= amt
        this.count.text = `x${this.value}`
    }
}
