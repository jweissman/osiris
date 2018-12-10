import { Label, UIActor, Color } from "excalibur";

export class Hud extends UIActor {
    label: Label
    constructor(message='welcome to osiris') {
        super(0,0);
        this.label = new Label(message, 10, 32, 'Helvetica')
        this.label.fontSize = 32
        this.label.color = Color.White
        this.add(this.label)
    }

    message(text: string) { this.label.text = text }
}