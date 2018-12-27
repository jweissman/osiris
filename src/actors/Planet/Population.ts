import { Actor, Traits } from 'excalibur';
import { Citizen } from '../Citizen';
import { Planet } from './Planet';
import { Device } from '../Device';

export class Population extends Actor {
    citizens: Citizen[] = [];
    constructor(private planet: Planet) {
        super(0, -planet.getHeight() / 2, 0, 0);
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling));
    }

    increase(home: Device) {
        let citizen = new Citizen(home, this.planet);
        citizen.work();
        this.citizens.push(citizen);
        this.add(citizen);
    }
}
