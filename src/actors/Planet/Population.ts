import { Actor, Traits, Scene } from 'excalibur';
import { Citizen } from '../Citizen';
import { Planet } from './Planet';
import { Device } from '../Device';
import { World } from '../../models/World';

export class Population extends Actor {
    citizens: Citizen[] = []
    raiders: Citizen[] = []

    constructor(private planet: Planet, public scene: Scene) {
        super(0, -planet.getHeight() / 2, 0, 0);
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling));
        console.log("in pop ctor, scene is: ", { scene: this.scene })
    }

    update(engine, delta) {
        let notKilled = c => c.alive // && !c.isKilled()
        this.citizens = this.citizens.filter(notKilled)
        this.raiders = this.raiders.filter(notKilled)
    }

    increase(pos, elite: boolean = false) {
        let citizen = new Citizen(World.nameCitizen(), pos, this.planet, elite);
        citizen.work();
        this.citizens.push(citizen);
        // scene.add?
        if (this.scene) {
            this.scene.add(citizen);
        } else {
            console.warn("no scene to add citizen to!?!?")
        }
    }
}
