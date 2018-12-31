import { Building, DevicePlace } from "./Building";
import { Orientation } from "../../values/Orientation";
import { Slot } from "../../values/Slot";
import { Vector } from "excalibur";
import { DeviceSize } from "../../values/DeviceSize";
import { drawRect } from "../../Util";

export class CommonAreaView extends Building {
    floorHeight: number = 8
    edgeWidth: number = 0.5 //.1
    showLabel = true
    hideBox = true
    // maybe you can set height AND width of common area view??
    // maybe just width...
    colorBase() { return this.color.darken(0.3); }

    draw(ctx: CanvasRenderingContext2D, delta: number) {


        drawRect(ctx, this.aabb(), 0.125, this.processedColor())

        drawRect(
            ctx,
            { x: this.x, y: this.y + this.getHeight() - this.floorHeight,
              width: this.getWidth(), height: this.floorHeight },
              0,
              this.colorBase().lighten(0.7)
        )

        super.draw(ctx, delta)
    }

    slots() {
        let theSlots = []
        let slotY = this.getHeight() - this.floorHeight
        let leftSlot: Slot = this.buildSlot(
            this.pos.x,
            this.pos.y + slotY,
            Orientation.Left,
        )
        theSlots.push(leftSlot)

        let rightSlot: Slot = this.buildSlot(
            this.pos.x + this.getWidth(),
            this.pos.y + slotY,
            Orientation.Right,
        )
        theSlots.push(rightSlot)

        // top slot
        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth()/2,
                this.pos.y,
                Orientation.Up
            )
        )

        // bottom slot
        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth()/2,
                this.pos.y + this.getHeight(),
                Orientation.Down
            )
        )
        return theSlots;
    }

    nodes(): Vector[] {
        let x = this.pos.x + this.getWidth()/2;
        let y = this.pos.y + this.getHeight()-this.floorHeight
        return [
            new Vector(Math.floor(x), Math.floor(y)) //-16)
        ];
    }
  
    reshape(cursor) {
        this.alignToSlot(cursor);
    }

    devicePlaces() {
        let w = this.getWidth()/2
        let x = this.pos.x + w;
        let y = this.pos.y + this.getHeight() - this.floorHeight - 10 
        let ds = [
            new Vector(x - w/3, y),
            // new Vector(x, y),
            new Vector(x + w/3, y),
        ]

        return ds.map(d => new DevicePlace(d, DeviceSize.Small))
    }
}