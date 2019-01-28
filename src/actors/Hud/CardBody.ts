import { Label, Actor, FontStyle, Color } from "excalibur";
import { Structure } from "../../models/Structure";
import { Machine } from "../../models/Machine";
import { PureValue, Economy, ResourceBlock } from "../../models/Economy";
import { RoomRecipe } from "../../models/RoomRecipe";
import { Building } from "../Building";
import { Device } from "../Device";
import { countOccurrences, flatSingle } from "../../Util";
import { Game } from "../../Game";

export class CardBody extends Actor {
    description: Label
    values: Label
    notes: Label
    footer: Label

    constructor(private entity: Machine | Structure | RoomRecipe | Building | Device, x: number, y: number) {
        super(x, y, 0, 0)
        // resources / recipes

        this.values = new Label('', 0, 0, Game.font)
        this.values.fontSize = 10
        this.add(this.values)

        this.notes = new Label('behavioral notes', 0, 30, Game.font)
        this.notes.fontSize = 11
        this.add(this.notes)

        this.description = new Label('description', 0, 60, Game.font)
        this.description.fontSize = 12
        this.description.fontStyle = FontStyle.Italic
        this.description.color = Color.DarkGray
        this.add(this.description)

        this.footer = new Label('footer', 20, 80, Game.font)
        this.footer.fontSize = 10
        this.footer.fontStyle = FontStyle.Italic
        this.add(this.footer)

        this.show(entity)
    }

    describeResources = (arr: ResourceBlock[]) => {
        let freqs = countOccurrences(arr)
        return Object.keys(freqs)
            .map(elem => `${elem} x${freqs[elem]}`)
            .join(' + ')
    }

    show(entity: Machine | Structure | RoomRecipe | Building | Device) {
        if (entity) {
            this.description.text = entity.description;

            if (entity instanceof Machine || entity instanceof Device) {
                this.values.text =  this.describeEconomy(entity.economy)
                // let footerNotes = []
                let resourceDescription = entity instanceof Machine
                    ? `Cost: ${this.describeResources(entity.cost)}`
                    : (entity.built ? this.describeResources(entity.product) : 'under construction')
                let forDome = entity instanceof Machine ? entity.forDome : entity.machine.forDome
                let domeStatus = `For Dome: ${forDome ? 'Yes' : 'No'}`
                this.footer.text = resourceDescription === ''
                    ? domeStatus
                    : [resourceDescription, domeStatus].join(' | ') 
                this.notes.text = '' //
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
            } else if (entity instanceof RoomRecipe) {
                let { capacity, workSpeed } = entity.bonuses
                let bonusMessages = [];
                if (capacity > 0) {
                    bonusMessages.push(`+${capacity} cap`)
                }
                if (workSpeed > 1.0) {
                    bonusMessages.push(`+${Math.floor((workSpeed*100)-100)}% efficiency` )
                }
                this.values.text = bonusMessages.join('; ') 
                this.notes.text = entity.machines.map(m => (new m()).name).join(' + ')
                this.footer.text = ''
            } else if (entity instanceof Building) {
                this.values.text =  this.describeEconomy(entity.economy(false))
                this.notes.text = entity.getDevices().map(d => d.machine.name).join(' + ')

                let product = entity.getDevices()
                    .map(d => d.product)
                    .reduce((a, b) => a.concat(b), [])
                this.footer.text = product.length > 0
                    ? "Currently contains: " + this.describeResources(product)
                    : ''
            } else {
                this.values.text = ''
                this.notes.text = ''
                this.footer.text = ''
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
                values.push(`+${delta.toFixed()} ${value}`)
            } else if (delta < 0) {
                values.push(`${delta.toFixed()} ${value}`)
            }
        }
        return values.join(' | ')
    }
}
