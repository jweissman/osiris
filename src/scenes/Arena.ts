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

const noop = () => { }

class SpawnPalette extends Pane {
    constructor(x: number, y: number, spawnFriendly: () => any, spawnEnemy: () => any) {
        super("Spawn", x, y)
        this.makeRootElement()
        let goodGuy = assembleButton('Good guy', Color.Green)
        goodGuy.onclick = spawnFriendly
        this._element.appendChild(goodGuy)
        let badGuy = assembleButton('Bad guy', Color.Red)
        badGuy.onclick = spawnEnemy
        this._element.appendChild(badGuy)
    }
}

// arenaaaaa
export class Arena extends Scene {
    planet: Planet
    defenders: Citizen[] = []
    enemies: Citizen[] = []
    spawnPalette: SpawnPalette
    floorY: number

    // we may need to build a minimal colony just for things to work?
    public onInitialize(game: Game) {
        let world = new World()
        let hud = new Hud(game)
        this.planet = new Planet(world, hud, noop, noop) // () => {},)
        this.add(this.planet)

        this.floorY = this.planet.getTop() //game.halfCanvasHeight

        this.spawnFriendly()
        // let victor = new Citizen('Good Guy', new Vector(500, this.floorY), this.planet, true)
        // this.defenders = [ victor ]
        // this.defenders.forEach(defender => this.add(defender))

        this.spawnHostile()
        // let foxtrot = new Citizen('Bad Guy', new Vector(0, this.floorY), this.planet)
        // this.enemies = [
            // foxtrot
        // ]
        // this.enemies.forEach(enemy => this.add(enemy))

        // victor.engageHostile(foxtrot)
        // foxtrot.engageHostile(victor)

        this.camera.move(this.defenders[0].pos, 1000)
        // this.camera.addStrategy(new LockCameraToActorStrategy(victor))
        // this.camera.zoom(.5)

        this.spawnPalette = new SpawnPalette(100,100,
            this.spawnFriendly, 
            this.spawnHostile
        )
    }

    draw(ctx, delta) {
        super.draw(ctx,delta)

        this.spawnPalette.draw(ctx)
    }

    update(engine, delta) {
        super.update(engine, delta)

        let notKilled = c => !c.isKilled()
        this.defenders = this.defenders.filter(notKilled)
        this.enemies = this.enemies.filter(notKilled)

        let defender = this.defenders.find(notKilled)
        if (defender) {
            this.enemies.forEach(e => {
                if (!e.engagedInCombat) {
                    e.engageHostile(defender) //sample(this.defenders))
                }
            })
        }

        let enemy = this.enemies.find(notKilled)
        if (enemy) {
            this.defenders.forEach(d => {
                if (!d.engagedInCombat) {
                    d.engageHostile(enemy) //sample(this.enemies))
                }
            })
        }
    }

    spawnFriendly = () => {
        let friendly = new Citizen('Good Guy', new Vector((Math.random() * 200) + 800, this.floorY), this.planet, true)
        this.defenders.push(friendly)
        this.add(friendly)
        // let target = this.enemies.find(enemy => !enemy.isKilled())
        // if (target) {
        //     friendly.engageHostile(target)
        // }
    }

    spawnHostile = () => {
        let hostile = new Citizen('Bad Guy', new Vector((Math.random() * 200) - 100, this.floorY), this.planet, false, true)
        this.enemies.push(hostile)
        this.add(hostile)
        //let target = this.defenders.find(defender => !defender.isKilled())
        //if (target) {
        //    hostile.engageHostile(target)
        //}
    }
}