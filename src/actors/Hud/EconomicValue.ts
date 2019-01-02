import { Label, Color, Actor } from "excalibur";
export class EconomicValue extends Actor {
    private nameLabel: Label;
    private valueLabel: Label;
    constructor(name: string, x: number, y: number) {
        super(x, y, 0, 0);
        this.nameLabel = new Label(name, x, y);
        this.nameLabel.fontSize = 10;
        this.nameLabel.color = Color.White.darken(0.2);
        this.add(this.nameLabel);
        this.valueLabel = new Label('0', x + 40, y);
        this.valueLabel.fontSize = 10;
        this.valueLabel.color = Color.White.darken(0.2);
        this.add(this.valueLabel);
    }
    setCount(count: number) {
        this.valueLabel.text = `${count}`;
        let c = Color.Gray;
        if (count > 0) {
            c = Color.Green;
        }
        else if (count < 0) {
            c = Color.Red;
        }
        this.valueLabel.color = c;
    }
}
