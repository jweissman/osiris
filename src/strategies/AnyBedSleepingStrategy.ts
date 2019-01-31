import { SleepingStrategy } from "./SleepingStrategy";
import { Bed } from "../models/Machine";
import { shuffle } from "../Util";

export class AnyBedSleepingStrategy extends SleepingStrategy {
    canApply(): boolean {
        if (!this.bed) {
            // no available beds..
            return false
        }

        if (this.planet.population.raiders.some(raider => raider.pos.distance(this.pawn.pos) < 1000)) {
            // you can't sleep now!
            return false
        }

        if (this.pawn.health < 100) {
            return true
        }

        if (!this.pawn.isTired) {
            return false
        }

        let bedtime = this.planet.hour > 21 || this.planet.hour < 4
        return bedtime
    }

    protected async apply() {
        // find a bed
        // let bed = shuffle(this.devices).find(d => d.machine instanceof Bed && !d.inUse)
        let bed = this.bed
        if (bed) {
            bed.inUse = true
            this.pawn.sleepingInBed = bed
            await this.visitDevice(bed)
        // }
            await this.pawn.takeRest() //1000 * 24)
        // if (bed) { 
            bed.inUse = false
        }
        return true
    }


    private get bed() {
        return shuffle(this.devices).find(d => d.machine instanceof Bed && !d.inUse)
    }
}