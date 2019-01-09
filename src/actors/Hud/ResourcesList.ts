import { Color, Actor } from "excalibur";
import { ResourceBlock } from "../../models/Economy";
import { ResourceListEntry } from "./ResourceListEntry";
export class ResourcesList extends Actor {
    entries: {
        [block in ResourceBlock]: ResourceListEntry;
    } = {
            [ResourceBlock.Biomass]: null,
            [ResourceBlock.Idea]: null,
            [ResourceBlock.Ore]: null,
            [ResourceBlock.Meal]: null,
            [ResourceBlock.Mineral]: null,
            [ResourceBlock.Data]: null,
            [ResourceBlock.Alloy]: null,
            [ResourceBlock.Bioplasma]: null,
            [ResourceBlock.Algorithm]: null,
            [ResourceBlock.Argent]: null,
            [ResourceBlock.Aurum]: null,
            [ResourceBlock.Omnium]: null,
        };

    constructor(x: number, y: number) {
        super(x, y, 0, 0, Color.DarkGray.darken(0.8));
        let rx0 = 0, ry0 = -2.5;
        let resources = [
            ResourceBlock.Meal,
            ResourceBlock.Data,
            ResourceBlock.Mineral,

            ResourceBlock.Bioplasma,
            ResourceBlock.Alloy,
            ResourceBlock.Algorithm,

            ResourceBlock.Argent,
            ResourceBlock.Aurum,
        ];
        resources.forEach((resource, index) => {
            let rx = rx0 + index * 18, ry = ry0 + index * 0;
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

    decrement(resource: ResourceBlock) {
        let res = this.entries[resource]
        if (res) {
            res.debit(1)
        }
    }
}
