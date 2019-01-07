import { Label, Actor, FontStyle } from "excalibur";
import { Structure } from "../../models/Structure";
import { Machine } from "../../models/Machine";
import { PureValue } from "../../models/Economy";
import { SmallDomeThreeView } from "../Building/SmallDomeThreeView";
import { SpaceFunction } from "../../models/SpaceFunction";
import { Building } from "../Building";

export class CardBody extends Actor {
    description: Label
    values: Label
    notes: Label

    constructor(private entity: Machine | Structure | SpaceFunction | Building, x: number, y: number) {
        super(x, y, 0, 0)
        // resources / recipes

        this.values = new Label('')
        this.values.fontSize = 10
        this.add(this.values)

        this.notes = new Label('behavioral notes', 0, 30)
        this.notes.fontSize = 11
        this.add(this.notes)

        this.description = new Label('description', 0, 60)
        this.description.fontSize = 12
        this.description.fontStyle = FontStyle.Italic
        this.add(this.description)

        this.show(entity)
    }

    show(entity: Machine | Structure | SpaceFunction | Building) {
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

                // let theNotes = []
                this.notes.text = ''
                let op = entity.operation
                if (op) {
                    if (op.type === 'recipe') {
                        this.notes.text = `Turns ${op.consumes.join(' + ')} -> ${op.produces}.`
                    } else if (op.type === 'generator') {
                        this.notes.text = `Generates ${op.generates}.`
                    } else if (op.type === 'store') {
                        this.notes.text = `Stores ${op.stores.join(' + ')}`
                    } else if (op.type === 'spawn') {
                        this.notes.text = 'Decants clones.'
                    }
                }
                
                // if (entity.consumes && entity.produces) {
                //     this.notes.text = `Turns ${entity.consumes} into ${entity.produces}.`
                // } else if (entity.produces) {
                //     this.notes.text = `Generates ${entity.produces}.`
                // } // if entity.stores...?
            } else { //} if (entity instanceof Structure) {
                this.values.text = ''
                this.notes.text = ''
            }

        }
        // other bonuses? behaviors?
    }
}
