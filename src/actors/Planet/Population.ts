import { Actor, Traits, Scene } from 'excalibur';
import { Citizen } from '../Citizen';
import { Planet } from './Planet';
import { Device } from '../Device';
import { World } from '../../models/World';
import { closest } from '../../Util';

export class Population extends Actor {
    citizens: Citizen[] = []
    raiders: Citizen[] = []

    constructor(private planet: Planet, public scene: Scene) {
        super(0, -planet.getHeight() / 2, 0, 0);
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling));
        console.log("in pop ctor, scene is: ", { scene: this.scene })
    }

    update(engine, delta) {
        super.update(engine, delta)
        let notKilled = c => c.alive // && !c.isKilled()
        this.citizens = this.citizens.filter(notKilled) //.sort(c => c.hover ? -1 : 1)
        this.raiders = this.raiders.filter(notKilled) //.sort(c => c.hover ? -1 : 1)
        let pos = engine.input.pointers.primary.lastWorldPos
        let hoverables: (Citizen)[] = [
            // ...this.planet.colony.findAllDevices(),
            // ...this.planet.colony.buildings,
            ...this.citizens,
            ...this.raiders,
        ]
        if (hoverables.length > 0) {
            hoverables.forEach(h => { h.hover = false; h.z = 1 })
            let center = (d: Citizen) => {
                let pos = d.getWorldPos()
                // if (d instanceof Building) {
                    // pos.addEqual(new Vector(d.getWidth()/2, d.getHeight()/2))
                // }
                return pos
            }
            // .add( new Vector(d.getWidth() / 2, d.getHeight() / 2))
            let hoverable: Citizen = closest(
                pos,
                hoverables,
                center
            )
            if (hoverable && center(hoverable).distance(pos) < hoverable.getWidth()*2) {
                // console.log("HOVER ON", { hoverable })
                hoverable.hover = true
                hoverable.z = 1000
                // this.hud.showCard(hoverable)
            }
        }
    }

    // draw(ctx, delta) {
        // this.citizens.forEach(c => c.draw(ctx, delta))
        // this.raiders.forEach(c => c.draw(ctx, delta))
    // }

    increase(pos, elite: boolean = false) {
        let citizen = new Citizen(World.nameCitizen(), pos, this.planet, { elite });
        citizen.work();
        this.citizens.push(citizen);
        // scene.add?
        if (this.scene) {
            this.scene.add(citizen);
        } else {
            console.warn("no scene to add citizen to!?!?")
        }
    }

    tearDown() {
        this.citizens.forEach((c) => this.scene.remove(c))
        this.raiders.forEach((c) => this.scene.remove(c))
    }
}
