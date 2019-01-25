import { Actor, Traits } from 'excalibur';
import { Citizen } from '../Citizen';
import { Planet } from './Planet';
import { Device } from '../Device';
import { World } from '../../models/World';

export class Population extends Actor {
    citizens: Citizen[] = [];
    constructor(private planet: Planet) {
        super(0, -planet.getHeight() / 2, 0, 0);
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling));
    }

    increase(pos, elite: boolean = false) {
        let citizen = new Citizen(World.nameCitizen(), pos, this.planet, elite);
        citizen.work();
        this.citizens.push(citizen);
        this.add(citizen);
    }
}
