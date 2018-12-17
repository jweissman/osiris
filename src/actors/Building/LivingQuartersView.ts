import { CommonAreaView } from ".";
import { Vector } from "excalibur";
import { setupMaster } from "cluster";

export class LivingQuartersView extends CommonAreaView {
    edgeWidth: number = 2
    afterConstruct() {
        console.log("AFTER CONSTRUCT LIVING QUARTERS")
        setTimeout(() => this.planet.populate(), 1000)
    }

}