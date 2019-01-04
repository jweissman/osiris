import { Color, Actor } from "excalibur";
import { ResourceBlock } from "../../models/Economy";
import { ResourceListEntry } from "./ResourceListEntry";
export class ResourcesList extends Actor {
    entries: {
        [block in ResourceBlock]: ResourceListEntry;
    } = {
            [ResourceBlock.Food]: null,
            [ResourceBlock.Hypothesis]: null,
            [ResourceBlock.Ore]: null,
            [ResourceBlock.Meal]: null,
            [ResourceBlock.Mineral]: null,
            [ResourceBlock.Data]: null,
            [ResourceBlock.Alloy]: null,
        };

    constructor(x: number, y: number) {
        super(x, y, 0, 0, Color.DarkGray.darken(0.8));
        let rx0 = 0, ry0 = -2.5;
        let resources = [ResourceBlock.Meal, ResourceBlock.Data, ResourceBlock.Mineral];
        resources.forEach((resource, index) => {
            let rx = rx0 + index * 16, ry = ry0 + index * 0;
            let entry = new ResourceListEntry(rx, ry, resource, 0);
            this.add(entry);
            this.entries[resource] = entry;
        });
    }

    increment(resource: ResourceBlock) {
        let res = this.entries[resource]
        if (res) {
            res.credit(1);
        }
    }
}
