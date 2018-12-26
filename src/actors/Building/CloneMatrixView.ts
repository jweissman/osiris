import { Building, CommonAreaView } from ".";

export class CloneMatrixView extends CommonAreaView {
    afterConstruct() {
        this.spawnCitizen()
    }

    protected spawnCitizen() {
        setTimeout(() => this.planet.populate(this.pos), 100)
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta)
    }
}