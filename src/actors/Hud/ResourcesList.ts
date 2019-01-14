import { Color, Actor } from "excalibur";
import { ResourceBlock } from "../../models/Economy";
import { ResourceListEntry } from "./ResourceListEntry";
import { eachCons, eachChunk } from "../../Util";
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
        super(x,y,0,0); // 200, 60, Color.Green.clone().darken(0.8));
        let rx0 = 0, ry0 = -5;
        let resources = [
            ResourceBlock.Meal,
            ResourceBlock.Bioplasma,

            ResourceBlock.Data,
            ResourceBlock.Algorithm,

            ResourceBlock.Mineral,
            ResourceBlock.Alloy,

            ResourceBlock.Argent,
            ResourceBlock.Aurum,
        ];

        eachChunk(resources, 2).forEach(([res1, res2], index) => {
            let rx = rx0 + index * 36, ry = ry0 + index * 0;
            this.addEntry(rx, ry, res1)
            this.addEntry(rx, ry + 14, res2)
        });
    }

    private addEntry(x: number, y: number, res: ResourceBlock) {
        let entry = new ResourceListEntry(x, y, res, 0);
        this.add(entry);
        this.entries[res] = entry;
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
