import { CommonAreaView } from ".";

export class LivingQuartersView extends CommonAreaView {
    edgeWidth: number = 2
    afterConstruct() {
        console.log("AFTER CONSTRUCT LIVING QUARTERS")
        setTimeout(() => this.planet.populate(this.pos), 100)
    }

}