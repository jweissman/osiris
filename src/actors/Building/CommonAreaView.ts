import { Building, DevicePlace } from "./Building";
import { Orientation } from "../../values/Orientation";
import { Slot } from "../../values/Slot";
import { Vector, Color } from "excalibur";
import { DeviceSize, getVisibleDeviceSize } from "../../values/DeviceSize";
// import { drawRect, drawPatternedRect } from "../../Util";
import { BackgroundPattern } from "./BackgroundPatterns";
import { drawPatternedRect, drawRect } from "../../Painting";
import { measureDistance, eachCons } from "../../Util";

export class CommonAreaView extends Building {
    get floorHeight() { return this.getHeight() / 6 }
    // floorHeight: number = 10
    edgeWidth: number = 0.5 //.1
    showLabel = true
    hideBox = true

    colorBase() { return this.color.darken(0.3); }

    draw(ctx: CanvasRenderingContext2D, delta: number) {

        // let wallColor = this.processedColor() //.darken(0.4)
        let floorColor = this.planet.color.darken(0.6) //Color.Violet.darken(0.92)

        // drawRect(ctx, this.aabb(), 0.5, wallColor)
        drawPatternedRect(ctx, this.aabb(), this.backgroundPattern)
        if (!this.isActive) {
            // draw overlay rect that darkens
            let c = Color.Black
            c.a = 0.6
            drawRect(ctx, this.aabb(), 0, c)
        }

        let floorEdgeHeight = 12 // 6
        let floorOff = -5
        drawRect(
            ctx,
            { x: this.x, y: this.y + this.getHeight() - this.floorHeight - floorEdgeHeight,
              width: this.getWidth(), height: floorEdgeHeight - floorOff },
              0,
              floorColor.lighten(0.4)
        )

        drawRect(
            ctx,
            { x: this.x, y: this.y + this.getHeight() - this.floorHeight - floorOff,
              width: this.getWidth(), height: this.floorHeight + floorOff },
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

    graph(sg) {
        let g = super.graph(sg)
        let slots: Slot[] = this.slots()
        let find = (s: Vector) => g.findOrCreate(s, measureDistance)
        // draw from left slot to each device place to right slot?
        let leftSlot = find(slots[0].pos), rightSlot = find(slots[1].pos)
        let devices = this.devicePlaces().map(d => find(d.position))
        g.edge(leftSlot, devices[0])
        eachCons(devices, 2).forEach(([left, right]) => g.edge(left, right))
        g.edge(devices[devices.length-1], rightSlot)

        let node = this.nodes()[0]
        devices.forEach(device => g.edge(device, find(node)))
        return g
    }
  
    reshape(cursor) {
        this.alignToSlot(cursor);
    }

    devicePlaces() {
        let w = this.getWidth()/2
        let x = this.pos.x + w;
        let y = this.pos.y + this.getHeight() - this.floorHeight // - 10 
        y -= getVisibleDeviceSize(this.devicePlaceSize) / 3.5 ///2

        let ds = [
            new Vector(x - w/2, y),
            ...(this.devicePlaceCount > 2 ? [new Vector(x,y)] : []),
            new Vector(x + w/2, y),
        ]

        return ds.map(d => new DevicePlace(d, this.devicePlaceSize)) 
        //DeviceSize.Small))
    }

    devicePlaceSize: DeviceSize = DeviceSize.Small
    devicePlaceCount: number = 2
}