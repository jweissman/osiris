import { CommonAreaView } from '.'
import { Color, Vector } from 'excalibur';
import { ResourceBlock } from '../../models/Economy';
import { AccessTunnel, Refinery, Mine } from '../../models/Structure';

export class MineView extends CommonAreaView {
    floorHeight = 150

    nodes(): Vector[] {
        let x = this.pos.x + this.getWidth()/2;
        let y = this.pos.y + this.getHeight() - this.floorHeight
        return [
            new Vector(Math.floor(x), Math.floor(y)-4)
        ];
    }

    validConnectingStructures() { return [ AccessTunnel, Mine, Refinery ]}
}