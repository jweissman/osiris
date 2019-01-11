import { SleepingStrategy } from "./SleepingStrategy";
import { Bed } from "../models/Machine";
import { shuffle } from "../Util";

export class AnyBedSleepingStrategy extends SleepingStrategy {
    canApply(): boolean {
        if (this.pawn.isTired) { //energy > 95) {
            return false
        }

        let bedtime = this.planet.hour > 21 || this.planet.hour < 4
        return bedtime
    }

    protected async apply() {
        // find a bed
        let bed = shuffle(this.devices).find(d => d.machine instanceof Bed && !d.inUse)
        if (bed) {
            bed.inUse = true
            await this.visitDevice(bed)
        }
        await this.pawn.takeRest(1000 * 24)
        if (bed) { 
            bed.inUse = false
        }
        return true
    }

}