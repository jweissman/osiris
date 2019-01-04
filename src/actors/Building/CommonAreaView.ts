import { Building, DevicePlace } from "./Building";
import { Orientation } from "../../values/Orientation";
import { Slot } from "../../values/Slot";
import { Vector } from "excalibur";
import { DeviceSize } from "../../values/DeviceSize";
import { drawRect } from "../../Util";

export class CommonAreaView extends Building {
    floorHeight: number = 12
    edgeWidth: number = 0.5 //.1
    showLabel = true
    hideBox = true

    colorBase() { return this.color.darken(0.3); }

    draw(ctx: CanvasRenderingContext2D, delta: number) {

        let wallColor = this.processedColor() //.darken(0.4)
        let floorColor = this.processedColor().darken(0.4)

        drawRect(ctx, this.aabb(), 0.5, wallColor)

        drawRect(
            ctx,
            { x: this.x, y: this.y + this.getHeight() - this.floorHeight,
              width: this.getWidth(), height: this.floorHeight },
              0.2,
              floorColor
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

        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth()/2,
                this.pos.y,
                Orientation.Up
            )
        )

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
            new Vector(Math.floor(x), Math.floor(y))
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
            new Vector(x + w/3, y),
        ]

        return ds.map(d => new DevicePlace(d, DeviceSize.Small))
    }
}