import { CommonAreaView } from '.'
import { Color, Vector } from 'excalibur';

export class MineView extends CommonAreaView {
    productColor = Color.Red
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