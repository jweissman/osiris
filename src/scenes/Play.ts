import { Scene, Timer, Engine, Actor } from "excalibur";
import { Planet } from "../actors/Planet/Planet";
import { Player } from "../actors/player";
import { Game } from "../Game";
import { CloneReception, Kitchen, Workshop, Archive, Refinery, Mine } from "../models/RoomRecipe";
import { Orientation } from "../values/Orientation";
import { GameController } from "../GameController";
import { Construction } from "../Construction";

export class Play extends Scene {
    private controller: GameController
    private planet: Planet
    private time: number = Game.startHour*60
    private construction: Construction

    public onInitialize(engine: Engine) {
        this.planet = new Planet(this)
        this.add(this.planet)
        this.construction = new Construction(this.planet, engine,
            "Welcome to the Colony, sir... "
            + "We are what is left of the crew of the Osiris. "
            + "Can you help us build a functioning society? "
            + "First, choose a location for the Command post. "
            + "Then we'll lay out some infrastructure."
        )
        this.addTimer(
            new Timer(() => { this.stepTime() }, this.timeStepIntervalMillis, true)
        )
        this.addTimer(
            new Timer(() => {
                this.planet.sendRaidingParty()
            }, Game.raidingPartyFrequency, true)
        )
    }

    public onActivate() {
        this.add(this.construction)
        this.controller = new GameController(this.engine, this.camera)
        this.construction.standup(this.controller)
        this.controller.activate()
        this.camera.zoom(0.25)
    }

    public onDeactivate() {
        this.construction.teardown()
        this.controller.deactivate()
    }

    timeStepIntervalMillis: number = 50
    private stepTime() { 
        this.time += this.timeStepIntervalMillis / Game.minuteTickMillis
        this.planet.setTime(this.time) 
    }
} 