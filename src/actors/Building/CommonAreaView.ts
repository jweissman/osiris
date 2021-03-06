import { Building, DevicePlace } from "./Building";
import { Orientation } from "../../values/Orientation";
import { Slot } from "../../values/Slot";
import { Vector, Color } from "excalibur";
import { DeviceSize, getVisibleDeviceSize } from "../../values/DeviceSize";
import { drawRect, drawPatternedPoly, drawPoly } from "../../Painting";
import { measureDistance, eachCons } from "../../Util";

export class CommonAreaView extends Building {
    get floorHeight() { return this.getHeight() / 6 }
    edgeWidth: number = 0
    showLabel = true
    hideBox = true

    colorBase() { return this.color.darken(0.3); }

    poly() { return this.aabbPoly() }

    get floorY() {
        return this.pos.y + this.getHeight() - this.floorHeight
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {


        drawPatternedPoly(
            ctx,
            this.poly(),
            this.backgroundPattern,
            this.mainColor()
        )

        if (!this.isActive) {
            let c = Color.Black.clone()
            c.a = 0.6
            drawPoly(ctx, this.poly(), c)
        }

        let floorEdgeHeight = 12 // 6
        let floorColor = this.planet.color.darken(0.6)
        let floorOff = -5
        drawRect(
            ctx,
            { x: this.x, y: this.y + this.getHeight() - this.floorHeight - floorEdgeHeight,
              width: this.getWidth(), height: floorEdgeHeight - floorOff },
            //   0,
              floorColor.lighten(0.4)
        )

        drawRect(
            ctx,
            { x: this.x, y: this.y + this.getHeight() - this.floorHeight - floorOff,
              width: this.getWidth(), height: this.floorHeight + floorOff },
            //   0,
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
        let leftSlot = find(slots[0].pos), rightSlot = find(slots[1].pos)
        let devices = this.deviceInteractionPlaces().map(p => find(p))
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
        let y = this.pos.y + this.getHeight() - this.floorHeight - 10 
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