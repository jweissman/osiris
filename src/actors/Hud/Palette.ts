import { Color } from "excalibur";
import { EntityKind } from "../../values/Entity";
import { onlyUnique } from "../../Util";
import { Pane } from "./Pane";
import { assembleButton } from "../../Elemental";

export class Palette extends Pane {
    built: EntityKind[] = [];
    comprehended: EntityKind[] = [];
    omniscient: boolean = false

    constructor(
        name: string,
        x: number,
        y: number,
        private all: EntityKind[],
        private onButtonClick: (EntityKind) => any = null,
        private onButtonEnter: (EntityKind) => any = null,
        private comprehend = true 
    ) {
        super(name, x, y)
        this.makePalette();
    }

    restrictionsOff() {
        this.omniscient = true
    }

    updateBuilt(built: (EntityKind)[], unlocked: (EntityKind)[] = []) {
        this.built = built;
        if (this.omniscient) {
            this.comprehended = this.all
        } else if (this.comprehend) {
            let nowComprehended = this.all.filter((e: EntityKind) => {
                let s = new e();
                let prereqs: (EntityKind)[] = s.prereqs;
                return prereqs.every((prereq: EntityKind) => {
                    let built = this.built.some((s: EntityKind) => s === prereq);
                    return built;
                });
            });
            this.comprehended = [
                ...nowComprehended,
                ...unlocked
            ].filter(onlyUnique)
        } else {
            this.comprehended = [ ...this.built, ...unlocked ].filter(onlyUnique)
        }
        this.makePalette();
    }

    private makePalette() {

        this.makeRootElement()


        this.comprehended
            .map((elem: EntityKind) => new elem())
            .sort((a, b) => a.color > b.color ? -1 : 1)
            .forEach(elem => {
                if (elem.hide) { return }
                let label = elem.name;
                if (!this.built.map(m => new m().name).includes(elem.name)) {
                    label += ' *';
                }
                let clr = elem.color;
                let btn = assembleButton(label, clr);
                this._element.appendChild(btn);
                if (this.onButtonEnter) {
                    btn.onmouseenter = () => { this.onButtonEnter(elem); };
                }
                if (this.onButtonClick) {
                    btn.onclick = () => { this.onButtonClick(elem); };
                }
            });
    }

}
