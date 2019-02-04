import { Scene, Vector, Color } from "excalibur";
import { Citizen } from "../actors/Citizen";
import { Game } from "../Game";
import { Planet } from "../actors/Planet/Planet";
import { Pane } from "../actors/Hud/Pane";
import { assembleButton } from "../Elemental";
import { sample } from "../Util";
import { GameController } from "../GameController";
import { Laser } from "../models/Machine";
import { Device } from "../actors/Device";
import { Orientation } from "../values/Orientation";
import { getVisibleDeviceSize } from "../values/DeviceSize";

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
    private planet: Planet
    private spawnPalette: SpawnPalette
    private floorY: number
    private controller: GameController
    private friendlySpawnX: number = 1000
    private hostileSpawnY: number = -1000
    private spawnDrift: number = 500

    private machines: Device[] = []

    public onInitialize(game: Game) {
        this.planet = new Planet(this)
        this.add(this.planet)
        this.planet.z = -100
        this.floorY = this.planet.getTop() - Game.mansheight/2 // - 15

        let canvasWidth = this.engine.canvasWidth / window.devicePixelRatio;
        let halfWidth = Math.floor(canvasWidth/2)


        this.spawnPalette = new SpawnPalette(halfWidth-100,20,[
            { label: 'Raider', color: Color.Red, cb: this.spawnHostile }, 
            { label: 'Citizen', color: Color.Green, cb: this.spawnFriendly }, 
            { label: 'Elite Raider', color: Color.Red, cb: this.spawnHostileCommander }, 
            { label: 'Commander', color: Color.Green, cb: this.spawnFriendlyCommander }, 
            { label: 'Big Raider', color: Color.Red, cb: this.spawnBigHostile }, 
            { label: 'Laser', color: Color.Green, cb: () => { this.spawnLaser() } }, 
            { label: 'Regen World', color: Color.White, cb: () => { this.regenerate() } }, 
            { label: 'Main Menu', color: Color.White, cb: () => { game.goToScene('menu') }}, 
        ])
    }

    onActivate() {
        this.controller = new GameController(this.engine, this.camera)
        this.controller.activate()
        this.spawnPalette.show()
        this.spawnInitialPair()

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

    regenerate() {
        this.machines.forEach(machine => {this.remove(machine);  machine.kill(); })
        // this.machines = []
        this.planet.teardown()
        this.remove(this.planet)
        this.planet = new Planet(this)
        this.planet.z = -100
        this.add(this.planet)
        this.spawnInitialPair()
    }

    spawnInitialPair() {
        if (this.planet.population.citizens.length === 0) {
            this.spawnFriendly()
        }
        if (this.planet.population.raiders.length === 0) {
            this.spawnHostile()
        }
    }


    spawnFriendlyCommander = () => {
        let elite = true
        let cmdrName = sample(['Spork', 'Kierkegon', 'Bolnes', 'Pickhard', 'Rilker', 'Krusha', 'Forage', 'Scorch', 'Hula', 'Checkmate', 'Gorf', 'Helen', 'Arg'])
        let friendly = new Citizen(cmdrName, new Vector((Math.random() * this.spawnDrift) + this.friendlySpawnX, this.floorY), this.planet, { elite })
        // friend
        this.planet.population.citizens.push(friendly)
        this.add(friendly)
        friendly.z = 1
    }

    spawnFriendly = () => {
        let pawnName = sample([
            'Jones', 'Smith', 'Ford', 'Abel', 'Thomas',
            'Frost', 'Amos', 'Sandra', 'Cheryl', 'Dominic',
            'Aomi', 'Cadence', 'Cree', 'Luri', 'Moon', 'Dean',
            'Sun', 'Lee', 'Fern', 'Tuck',
        ])
        let friendly = new Citizen(pawnName, this.spawnPoint(), this.planet)
        this.planet.population.citizens.push(friendly)
        this.add(friendly)
        friendly.z = 1
    }

    spawnHostile = () => {
        let evil = true
        let hostile = new Citizen('Raider', this.spawnPoint(false), this.planet, { evil })
        this.planet.population.raiders.push(hostile)
        this.add(hostile)
        hostile.z = 1
    }

    spawnBigHostile = () => {
        let evil = true
        let large = true
        let hostile = new Citizen('Heavy Raider', this.spawnPoint(false), this.planet, { evil, large })
        hostile.y -= hostile.getHeight()/4
        this.planet.population.raiders.push(hostile)
        this.add(hostile)
        hostile.z = 1
    }


    spawnHostileCommander = () => {
        let elite = true, evil = true
        let cmdrName = sample([ 'Conn', 'Drak', 'Tanoz', 'Queue', 'Morgosh', 'Umph'])
        let hostile = new Citizen(cmdrName, this.spawnPoint(false), this.planet, { elite, evil })
        this.planet.population.raiders.push(hostile)
        this.add(hostile)
        hostile.z = 1
    }

    spawnLaser() {
        // add a laser at the average position, minus a bit
        let pos = this.spawnPoint()
        pos.y = this.floorY // - getVisibleDeviceSize((new Laser()).size)/4 ///2
        let laser = new Device(new Laser(), pos) //this.spawnPoint())
        laser.orientation = Orientation.Left
        laser.built = true
        laser.placed = true
        // @ts-ignore
        laser.building = { planet: this.planet }
        this.add(laser)
        laser.z = 2
        // this.planet.colony.

        this.machines.push(laser)
    }

    private spawnPoint(friendly: boolean = true) {
        return new Vector((Math.random() * this.spawnDrift) + (friendly ? this.friendlySpawnX : this.hostileSpawnY), this.floorY)
    }
}