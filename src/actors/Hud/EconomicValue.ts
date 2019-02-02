import { Label, Color, Actor } from "excalibur";
import { Game } from "../../Game";
export class EconomicValue extends Actor {
    private nameLabel: Label;
    private valueLabel: Label;
    constructor(name: string, x: number, y: number) {
        super(x, y, 0, 0);
        this.nameLabel = new Label(name, x, y, Game.font);
        this.nameLabel.fontSize = 10;
        this.nameLabel.color = Color.White.darken(0.2);
        this.add(this.nameLabel);

        this.valueLabel = new Label('0', x + 40, y, Game.font);
        this.valueLabel.fontSize = 10;
        this.valueLabel.color = Color.White.darken(0.2);
        this.add(this.valueLabel);
    }

    setCount(count: number) {
        this.valueLabel.text = `${count}`;
        let c = Color.Gray;
        if (count === Number.POSITIVE_INFINITY) {
            c = Color.Violet
            this.valueLabel.text = 'Infinite'
            // this.valueLabel.fon
        } else if (count > 0) {
            c = Color.Green;
        }
        else if (count < 0) {
            c = Color.Red;
        } else { 
            c = Color.DarkGray
        }

        this.valueLabel.color = c;
    }
}
