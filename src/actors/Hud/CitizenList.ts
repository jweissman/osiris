import { Color } from "excalibur";
import { Pane } from "./Pane";
import { Citizen } from "../Citizen";
import { Game } from "../../Game";
import { assembleButton } from "../../Elemental";
import { CombatStrategy } from "../../strategies/CombatStrategy";

class CitizenLine {
    private _line: HTMLDivElement
    private button: HTMLButtonElement
    private task: HTMLSpanElement
    private sleepy: HTMLSpanElement
    private hunger: HTMLSpanElement
    // private fighting: HTMLSpanElement
    private busyRow: HTMLDivElement
    private followed: boolean = false
    // ...
    constructor(private citizen: Citizen, private onSelect: (Citizen) => any) {
        this.buildLine()
    }

    get root() { return this._line }

    update(isFollowed: boolean, hungry: boolean, tired: boolean) {
        if (isFollowed !== this.followed) {
            this.followed = isFollowed
            // rebuild button
            this._line.removeChild(this.button)
            this.button = this.makeButton()
            this._line.appendChild(this.button)
        // this.button.textContent = isFollowed ? 'Following' : 'Follow'
        // this.button.backg clr = Color.DarkGray // followed ? Color.Violet : Color.DarkGray
        }


        this.sleepy.style.display = tired || this.citizen.sleepingInBed ? 'inline' : 'none'
        if (this.citizen.sleepingInBed) {
            this.sleepy.textContent = 'SLEEPING'
        } else {
            this.sleepy.textContent = 'tired'
        }

        // this.sleepy.textContent = `tired (${this.citizen.energy.toFixed()})`
        this.hunger.style.display = hungry ? 'inline' : 'none'
        // this.hunger.textContent = `hungry (${this.citizen.hunger.toFixed()})`

        // this.fighting.style.display = this.citizen.engagedInCombat ? 'inline' : 'none'

        this.task.style.display = this.citizen.isPlanning ? 'inline' : 'none'
        if (this.citizen.lastChoice) {
            this.task.textContent = this.citizen.lastChoice.describe()
            if (this.citizen.lastChoice instanceof CombatStrategy) {
                this.task.style.color = Color.Red.toRGBA()
            } else {
                this.task.style.color = Color.LightGray.toRGBA()
            }
        }
    }

    buildLine() {
        this._line = document.createElement('div')
        this._line.style.fontFamily = Game.font
        this._line.style.color = 'white'
        this._line.style.backgroundColor = '#6a6a6a'
        this._line.style.display = 'flex'
        // this._line.style.width = '100%'
        // this._line.style.height = '40px'
        this._line.style.justifyContent = 'space-between'
        this._line.style.paddingLeft = '5px'
        this._line.style.fontSize = '6pt'

        let nameLabel = document.createElement('span')

        nameLabel.textContent = [this.citizen.title, this.citizen.name].join(' ')
        nameLabel.style.alignSelf = 'center'
        this._line.appendChild(nameLabel)

        this.busyRow = document.createElement('div')
        this.busyRow.style.display = 'flex'
        this.busyRow.style.flexDirection = 'column'
        this._line.appendChild(this.busyRow)

        this.task = document.createElement('span')
        this.task.textContent = ''
        this.task.style.color = 'white'
        this.task.style.padding = '2px'
        this.busyRow.appendChild(this.task)

        this.hunger = document.createElement('span')
        this.hunger.textContent = 'hungry'
        this.hunger.style.color = 'yellow'
        this.hunger.style.padding = '2px'
        this.busyRow.appendChild(this.hunger)

        this.sleepy = document.createElement('span')
        this.sleepy.textContent = 'sleepy'
        this.sleepy.style.color = 'blue'
        this.sleepy.style.padding = '2px'
        this.busyRow.appendChild(this.sleepy)

        this.button = this.makeButton()
        this._line.appendChild(this.button)
    }

    makeButton() {
        let msg = this.followed ? "Following" : "Follow"
        let clr = this.followed ? Color.Violet : Color.DarkGray
        let button = assembleButton(msg, clr)
        button.style.padding = '15px'
        if (this.onSelect) {
            button.onclick = () => {
                this.onSelect(this.citizen)
            }
        }
        return button
    }
}

export class CitizenList extends Pane {
    private _wrapper: HTMLDivElement
    private citizens: Citizen[] = []
    following: Citizen = null
    private citizenLines: Map<Citizen, CitizenLine> = new Map()

    constructor(
        x: number,
        y: number,
        private onCitizenSelect: (Citizen) => any = null
    ) {
        super("Colony Roster", x, y);
    }

    updateRoster(citizens: Citizen[], following: Citizen): any {
        let missingCitizens = citizens.some(c => !this.doesRosterInclude(c))
        let lostCitizens = this.citizens.some(c => !citizens.includes(c))
        if (missingCitizens || lostCitizens) { // rebuild
            this.citizens = citizens
            this.makeRoster()
        }
        // let followedChanged = following !== this.citizenList.following
        this.following = following
        this.updateRosterDetails()
    }

    updateRosterDetails() {
        this.citizens.forEach(citizen => {
            let line: CitizenLine = this.citizenLines.get(citizen)
            line.update(this.following === citizen, citizen.isHungry, citizen.isTired)
        })
    }

    doesRosterInclude(citizen) {
        return this.citizens.includes(citizen)
    }

    private makeRoster() {
        this.makeRootElement();
        this._element.style.height = '260px'
        this._wrapper = document.createElement('div')
        this._wrapper.style.overflow = 'auto'
        // this._wrapper.style.maxHeight = '480px'
        this._wrapper.style.height = '250px'
        this._wrapper.style.width = '100%'
        this._element.appendChild(this._wrapper)
        this.citizens.forEach(c => this.makeCitizenLine(c))
        // citizen => 
        // });
    }

    private makeCitizenLine(citizen: Citizen) {
        let line = new CitizenLine(citizen, this.onCitizenSelect)
        this.citizenLines.set(citizen, line)
        this._wrapper.appendChild(line.root);
    }
}
