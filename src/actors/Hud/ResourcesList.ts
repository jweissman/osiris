import { Color, Actor } from "excalibur";
import { ResourceBlock } from "../../models/Economy";
import { ResourceListEntry } from "./ResourceListEntry";
export class ResourcesList extends Actor {
    entries: {
        [block in ResourceBlock]: ResourceListEntry;
    } = {
            // non-accruable
            [ResourceBlock.Food]: null,
            [ResourceBlock.Hypothesis]: null,
            [ResourceBlock.Ore]: null,
            // displayed/accruable
            [ResourceBlock.Meal]: null,
            [ResourceBlock.Mineral]: null,
            [ResourceBlock.Data]: null,
        };

    constructor(x: number, y: number) {
        super(x, y, 60, 60, Color.DarkGray.darken(0.8));
        let rx0 = -8, ry0 = -10;
        let resources = [ResourceBlock.Meal, ResourceBlock.Data, ResourceBlock.Mineral];
        resources.forEach((resource, index) => {
            let rx = rx0, ry = ry0 + index * 10;
            let entry = new ResourceListEntry(rx, ry, resource, 0);
            this.add(entry);
            this.entries[resource] = entry;
        });
    }

    increment(resource: ResourceBlock) {
        console.log("INCREMENT", { resource })
        let res = this.entries[resource]
        if (res) {
            res.credit(1);
        }
    }
}
