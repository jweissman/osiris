import { Label, Actor, FontStyle } from "excalibur";
import { Structure } from "../../models/Structure";
import { Machine } from "../../models/Machine";
import { PureValue } from "../../models/Economy";
import { SmallDomeThreeView } from "../Building/SmallDomeThreeView";

export class CardBody extends Actor {
    description: Label;
    values: Label

    constructor(private entity: Machine | Structure, x: number, y: number) {
        super(x, y, 0, 0)
        // resources / recipes

        this.values = new Label('')
        this.values.fontSize = 10
        this.add(this.values)

        this.description = new Label('description', 0, 50)
        this.description.fontSize = 14
        this.description.fontStyle = FontStyle.Italic
        this.add(this.description)


        this.show(entity)
    }

    show(entity: Machine | Structure) {
        if (entity) {
            this.description.text = entity.description;

            if (entity instanceof Machine) {
                let values = []
                let econ = entity.economy
                for (let value in PureValue) {
                    let { supply, demand } = econ[value]
                    let delta = supply - demand
                    if (delta > 0) {
                        values.push(`+${delta} ${value}`)
                    } else if (delta < 0) {
                        values.push(`${delta} ${value}`)
                    }
                }
                this.values.text = values.join(' | ')
            } else if (entity instanceof Structure) {
                this.values.text = ''
            }

        }
        // other bonuses? behaviors?
    }
}
