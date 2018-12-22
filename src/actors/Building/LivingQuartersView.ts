import { CommonAreaView } from ".";
import { range } from "../../Util";

export class LivingQuartersView extends CommonAreaView {
    afterConstruct() {
        this.spawnCitizen()
    }

    protected spawnCitizen() {
        setTimeout(() => this.planet.populate(this.pos), 100)
    }


    levelUp() {
        super.levelUp()
        for (let i in range(this.level)) {
            this.spawnCitizen()
        }
    }


}