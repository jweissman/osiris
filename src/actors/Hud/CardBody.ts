import { Label, Actor, FontStyle } from "excalibur";
import { Structure } from "../../models/Structure";
import { Machine } from "../../models/Machine";
import { PureValue, Economy } from "../../models/Economy";
import { SmallDomeThreeView } from "../Building/SmallDomeThreeView";
import { SpaceFunction } from "../../models/SpaceFunction";
import { Building } from "../Building";
import { Device } from "../Device";

export class CardBody extends Actor {
    description: Label
    values: Label
    notes: Label

    constructor(private entity: Machine | Structure | SpaceFunction | Building | Device, x: number, y: number) {
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


    show(entity: Machine | Structure | SpaceFunction | Building | Device) {
        if (entity) {
            this.description.text = entity.description;

            if (entity instanceof Machine || entity instanceof Device) {
                //let values = []
                //let econ = entity.economy
                //for (let value in PureValue) {
                //    let { supply, demand } = econ[value]
                //    let delta = supply - demand
                //    if (delta > 0) {
                //        values.push(`+${delta} ${value}`)
                //    } else if (delta < 0) {
                //        values.push(`${delta} ${value}`)
                //    }
                //}
                this.values.text =  this.describeEconomy(entity.economy) //values.join(' | ')

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
            } else if (entity instanceof SpaceFunction) { //} if (entity instanceof Structure) {
                let { capacity, workSpeed } = entity.bonuses
                let bonusMessages = [];
                if (capacity > 0) {
                    bonusMessages.push(`+${capacity} cap`)
                }
                if (workSpeed > 1.0) {
                    bonusMessages.push(`+${Math.floor((workSpeed*100)-100)}% efficiency` )
                }
                this.values.text = bonusMessages.join('; ') //; 
                this.notes.text = entity.machines.map(m => (new m()).name).join(' + ')
            } else if (entity instanceof Building) {
                this.values.text =  this.describeEconomy(entity.economy(false)) //values.join(' | ')
                this.notes.text = entity.getDevices().map(d => d.machine.name).join(' + ')
            } else {
                this.values.text = ''
                this.notes.text = ''
            }

        }
        // other bonuses? behaviors?
    }

    private describeEconomy(e: Economy): string {
        let values = []
        let econ = e // entity.economy
        for (let value in PureValue) {
            let { supply, demand } = econ[value]
            let delta = supply - demand
            if (delta > 0) {
                values.push(`+${delta} ${value}`)
            } else if (delta < 0) {
                values.push(`${delta} ${value}`)
            }
        }
        return values.join(' | ')
    }
}
