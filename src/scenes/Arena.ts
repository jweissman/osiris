import { Scene, Vector, Color } from "excalibur";
import { Citizen } from "../actors/Citizen";
import { Game } from "../Game";
import { Planet } from "../actors/Planet/Planet";
import { Pane } from "../actors/Hud/Pane";
import { assembleButton } from "../Elemental";
import { sample } from "../Util";
import { GameController } from "../GameController";

const noop = () => { }

class SpawnPalette extends Pane {
    constructor(x: number, y: number, buttons: { label: string, color: Color, cb: () => any }[]) {
        super("Summon", x, y)
        this.makeRootElement()
        buttons.forEach(btn => {
            let { label, color, cb } = btn
            let theButton = assembleButton(label, color)
            theButton.onclick = cb
            this._element.appendChild(theButton)
        })
    }
}

export class Arena extends Scene {
    planet: Planet
    spawnPalette: SpawnPalette
    floorY: number

    controller: GameController

    public onInitialize(game: Game) {
        this.planet = new Planet(this)
        this.add(this.planet)
        this.floorY = this.planet.getTop()
        this.spawnPalette = new SpawnPalette(100,100,[
            { label: 'Raider', color: Color.Red, cb: this.spawnHostile }, 
            { label: 'Citizen', color: Color.Green, cb: this.spawnFriendly }, 
            { label: 'Elite Raider', color: Color.Red, cb: this.spawnHostileCommander }, 
            { label: 'Commander', color: Color.Green, cb: this.spawnFriendlyCommander }, 
            { label: 'Main Menu', color: Color.White, cb: () => {
                game.goToScene('menu')
            }}, 
        ])
    }

    onActivate() {
        this.controller = new GameController(this.engine, this.camera)
        this.controller.activate()
        this.spawnPalette.show()
        if (this.planet.population.citizens.length === 0) {
            this.spawnFriendly()
        }
        if (this.planet.population.raiders.length === 0) {
            this.spawnHostile()
        }
        this.camera.move(this.planet.population.citizens[0].pos, 0)
    }

    onDeactivate() {
        this.spawnPalette.hide()
        this.controller.deactivate()
    }

    draw(ctx, delta) {
        super.draw(ctx,delta)
        this.spawnPalette.draw(ctx)
    }

    friendlySpawnX: number = 1000
    hostileSpawnY: number = -1000

    spawnDrift: number = 500

    spawnFriendlyCommander = () => {
        let cmdrName = sample(['Spork', 'Kierkegon', 'Bolnes', 'Pickhard', 'Rilker', 'Krusha', 'Forage', 'Scorch', 'Hula', 'Checkmate', 'Gorf', 'Helen', 'Arg'])
        let friendly = new Citizen(cmdrName, new Vector((Math.random() * this.spawnDrift) + this.friendlySpawnX, this.floorY), this.planet, true)
        this.planet.population.citizens.push(friendly)
        this.add(friendly)
    }

    spawnFriendly = () => {
        let pawnName = sample(['Jones', 'Smith', 'Ford', 'Abel', 'Thomas'])
        let friendly = new Citizen(pawnName, new Vector((Math.random() * this.spawnDrift) + this.friendlySpawnX, this.floorY), this.planet, false)
        this.planet.population.citizens.push(friendly)
        this.add(friendly)
    }

    spawnHostile = () => {
        let hostile = new Citizen('Raider', new Vector((Math.random() * this.spawnDrift) + this.hostileSpawnY, this.floorY), this.planet, false, true)
        this.planet.population.raiders.push(hostile)
        this.add(hostile)
    }

    spawnHostileCommander = () => {
        let cmdrName = sample([ 'Conn', 'Drak', 'Tanoz', 'Queue', 'Morgosh', 'Umph'])
        let hostile = new Citizen(cmdrName, new Vector((Math.random() * this.spawnDrift) + this.hostileSpawnY, this.floorY), this.planet, true, true)
        this.planet.population.raiders.push(hostile)
        this.add(hostile)
    }
}