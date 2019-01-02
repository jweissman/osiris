import { Label, Color, Actor } from "excalibur";
import { ResourceBlock, blockColor } from "../../models/Economy";
export class ResourceListEntry extends Actor {
    icon: Actor;
    count: Label;
    constructor(x: number, y: number, resourceBlock: ResourceBlock, protected value: number) {
        super(x, y, 10, 10); // 10,10,blockColor(resourceBlock))
        let icon = new Actor(x, y, 10, 10, blockColor(resourceBlock)); //ResourceBlock.Meal))
        this.add(icon);
        this.count = new Label(`x${value}`, x + 10, y + 6, 'Helvetica');
        this.count.fontSize = 10;
        this.count.color = Color.White;
        this.add(this.count);
    }
    credit(amt: number) {
        this.value += amt;
        this.count.text = `x${this.value}`;
    }
}
