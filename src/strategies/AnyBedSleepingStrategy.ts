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
        this.pawn.log("try to sleep!")
        // find a bed
        // let bed = shuffle(this.devices).find(d => d.machine instanceof Bed && !d.inUse)
        let bed = this.bed
        if (bed) {
            this.pawn.log("found a bed!")
            bed.inUse = true
            this.pawn.sleepingInBed = bed
            this.pawn.log("going to bed!")
            await this.visitDevice(bed)
            this.pawn.log("taking a rest!")
            await this.pawn.takeRest()
            this.pawn.log("done resting!")
            bed.inUse = false
        }
        return true
    }


    private get bed() {
        return shuffle(this.devices).find(d => d.machine instanceof Bed && !d.inUse )
    }
}