import { Scene, Engine } from "excalibur";
import { Planet } from "../actors/Planet/Planet";
import { GameController } from "../GameController";
import { Construction } from "../Construction";
import { Game } from "../Game";

export class Sandbox extends Scene {
    private controller: GameController
    private planet: Planet
    private construction: Construction

    public onInitialize(game: Game) {
        this.planet = new Planet(this)
        this.add(this.planet)
        this.construction = new Construction(this.planet, game,
            "Welcome to the Ad Astra sandbox. " +
            "All structures and devices are permitted here. " +
            "Go build whatever you are dreaming of! "
            )
        this.construction.restrictionsOff()
    }

    public onActivate() {
        this.add(this.construction)
        this.controller = new GameController(this.engine, this.camera)
        this.construction.standup(this.controller)
        this.controller.activate()
    }

    public onDeactivate() {
        this.construction.teardown()
        this.controller.deactivate()
    }
}