import { CommonAreaView } from '.'
import { Color, Vector } from 'excalibur';
import { ResourceBlock } from '../../models/Economy';

export class MineView extends CommonAreaView {
    produces = ResourceBlock.Ore
    // productColor = Color.Red
    productionTime = 1000
    floorHeight = 150

    nodes(): Vector[] {
        let x = this.pos.x + this.getWidth()/2;
        let y = this.pos.y + this.getHeight() - this.floorHeight
        return [
            new Vector(Math.floor(x), Math.floor(y)-4)
        ];
    }
}