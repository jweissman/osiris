import { Scene, Vector, LockCameraToActorStrategy, Color } from "excalibur";
import { Citizen } from "../actors/Citizen";
import { Game } from "../Game";
import { Planet } from "../actors/Planet/Planet";
import { World } from "../models/World";
import { Hud } from "../actors/Hud/Hud";
import { Pane } from "../actors/Hud/Pane";
import { assembleButton } from "../Elemental";
import { ENOTEMPTY } from "constants";
import { sample } from "../Util";
import { GameController } from "../GameController";

const noop = () => { }

class SpawnPalette extends Pane {
    constructor(x: number, y: number, buttons: { label: string, color: Color, cb: () => any }[]) { // spawnFriendly: () => any, spawnEnemy: () => any) {
        super("Spawn", x, y)
        this.makeRootElement()
        buttons.forEach(btn => {
            let { label, color, cb } = btn
            let theButton = assembleButton(label, color) //'Citizen', Color.Green)
            theButton.onclick = cb
            this._element.appendChild(theButton)
        })
        //let goodGuyCmdr = assembleButton('Commander', Color.Green)
        //goodGuyCmdr.onclick = spawnFriendlyCommander
        //this._element.appendChild(goodGuyCmdr)
        //let badGuy = assembleButton('Raider', Color.Red)
        //badGuy.onclick = spawnEnemy
        //this._element.appendChild(badGuy)
    }
}

// arenaaaaa
export class Arena extends Scene {
    planet: Planet
    // defenders: Citizen[] = []
    // enemies: Citizen[] = []
    spawnPalette: SpawnPalette
    floorY: number

    public onInitialize(game: Game) {

        let controller = new GameController(game, this.camera)
        controller.activate()

        let world = new World()
        let hud = new Hud(game)
        this.planet = new Planet(world, hud, noop, noop, 200000, 40000, this)
        this.add(this.planet)

        this.floorY = this.planet.getTop()

        this.spawnFriendly()


        this.spawnHostile()


        this.camera.move(this.planet.population.citizens[0].pos, 0)

        this.spawnPalette = new SpawnPalette(100,100,[
            { label: 'Citizen', color: Color.Green, cb: this.spawnFriendly }, 
            { label: 'Commander', color: Color.Green, cb: this.spawnFriendlyCommander }, 
            { label: 'Raider', color: Color.Red, cb: this.spawnHostile }, 
        ])
    }

    draw(ctx, delta) {
        super.draw(ctx,delta)
        this.spawnPalette.draw(ctx)
    }

    spawnFriendlyCommander = () => {
        let cmdrName = sample(['Spork', 'Kierkegon', 'Bolnes', 'Pickhard', 'Rilker', 'Krusha', 'Forage'])
        let friendly = new Citizen(cmdrName, new Vector((Math.random() * 200) + 800, this.floorY), this.planet, true)
        this.planet.population.citizens.push(friendly)
        this.add(friendly)
    }


    spawnFriendly = () => {
        let pawnName = sample(['Jones', 'Smith', 'Ford', 'Abel', 'Thomas'])
        let friendly = new Citizen(pawnName, new Vector((Math.random() * 200) + 800, this.floorY), this.planet, false)
        this.planet.population.citizens.push(friendly)
        this.add(friendly)
    }

    spawnHostile = () => {
        let hostile = new Citizen('Raider', new Vector((Math.random() * 200) - 100, this.floorY), this.planet, false, true)
        this.planet.population.raiders.push(hostile)
        this.add(hostile)

    }
}