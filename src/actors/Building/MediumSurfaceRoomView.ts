import { Color, Vector } from "excalibur";
import { Building, DevicePlace } from "./Building";
import { Orientation } from "../../values/Orientation";
import { Slot } from "../../values/Slot";
import { Device } from "../Device";
import { DeviceSize, getVisibleDeviceSize } from "../../values/DeviceSize";
import { drawPatternedRect, drawRect, drawPatternedPoly, drawPoly } from "../../Painting";
import { measureDistance, eachCons } from "../../Util";
import { BackgroundPattern } from "./BackgroundPatterns";
// import { drawPatternedRect, drawRect } from "../../Util";

export class MediumSurfaceRoomView extends Building {
    hideBox = true
    showLabel = true
    // hideLabe

    devicePlaceSize = DeviceSize.Medium
    devicePlaceCount = 3
    get floorHeight() { return this.getHeight() / 6 }

   nodes(): Vector[] {
        let x = this.pos.x + this.getWidth()/2;
        let y = this.pos.y + this.getHeight() - 16
        return [
            new Vector(Math.floor(x), Math.floor(y))
        ];
    }
    devicePlaces() {
        let w = this.getWidth()/2
        let x = this.pos.x + w;
        let y = this.pos.y + this.getHeight() - this.floorHeight - 12 
        y -= getVisibleDeviceSize(this.devicePlaceSize) / 3.5

        let ds = [
            new Vector(x - w/2, y),
            ...(this.devicePlaceCount > 2 ? [new Vector(x,y)] : []),
            new Vector(x + w/2, y),
        ]

        return ds.map(d => new DevicePlace(d, this.devicePlaceSize)) 
    }

    //deviceInteractionPlaces() {

    //}

    graph(sg) {
        let g = super.graph(sg)
        let find = (s: Vector) => g.findOrCreate(s, measureDistance)
        let slots: Vector[] = this.slots().map(s => s.pos)
        // draw from left slot to each device place to right slot?
        let devices = this.deviceInteractionPlaces().map(p => find(p)) //d.position))
        eachCons(devices, 2).forEach(([left, right]) => g.edge(left, right))

        if (this.isGroundFloor) {
            let leftSlot = find(slots[0]), rightSlot = find(slots[slots.length - 1])
            g.edge(leftSlot, devices[0])
            g.edge(devices[devices.length - 1], rightSlot)
        } else {
            let topSlot = find(slots[1])
            g.edge(devices[1], topSlot)
        }

        let node = this.nodes()[0]
        devices.forEach(device => g.edge(device, find(node)))
        // g.edge(devices[1], find(slots[1]))

        return g
    }


    slots() {
        let theSlots: Slot[] = []
        let slotY = this.getHeight() - this.floorHeight;

        if (this.isGroundFloor) {
            theSlots.push(
                this.buildSlot(
                    this.pos.x, this.pos.y + slotY,
                    Orientation.Left
                )
            )
        }

        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth() / 2,
                this.pos.y + this.getHeight(), // + (2*this.floorHeight),
                Orientation.Down
            )
        )

        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth() / 2,
                this.pos.y - 1, // + this.getHeight(),
                Orientation.Up
            )
        )


        if (this.isGroundFloor) {
            theSlots.push(
                this.buildSlot(
                    this.pos.x + this.getWidth(),
                    this.pos.y + slotY,
                    Orientation.Right
                )
            )
        }


        return theSlots;
    }

    get isGroundFloor() {
        return !this.parentSlot || !(this.parentSlot.parent instanceof MediumSurfaceRoomView)
    }

    constrainCursor(cursor: Vector): Vector {
        if (this.planet.colony.buildings.length === 0) {
            cursor.y = this.planet.getTop();
        } // else {
            // this.alignToSlot(cursor)
        // }
        return cursor;
    }

    reshape(cursor: Vector) {
        if (this.planet.colony.buildings.length === 0) {
            this.pos = cursor
            this.pos.y -= this.getHeight() - 2 - this.floorHeight // hm
        } else {
            this.alignToSlot(cursor)

        }
    }


    draw(ctx: CanvasRenderingContext2D, delta: number) {
        let color = this.mainColor()

        ctx.fillStyle = color.toRGBA()

        // ctx.fillRect(this.pos.x, this.pos.y, this.getWidth(), this.getHeight())
        // let rect = 
            // { x: this.pos.x, y: this.pos.y, width: this.getWidth(), height: this.getHeight() };
        drawPatternedPoly(
            ctx,
            this.angledRoofPoly(),
            this.backgroundPattern,
            this.mainColor()
        )


        if (!this.isActive) {
            // draw overlay rect that darkens
            let c = Color.Black.clone()
            c.a = 0.6
            drawPoly(ctx, this.angledRoofPoly(), c)
        }

        // floor
        let floorColor = this.planet.color.darken(0.6)
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
              0,
              floorColor
        )

        // a little flag :)
        let flagpoleHeight = 18
        let flagX = this.pos.x + 3 * (this.getWidth() / 4)
        let flagY = this.pos.y - flagpoleHeight

        ctx.fillStyle = Color.Black.fillStyle()
        ctx.fillRect(flagX, flagY-1, 1, flagpoleHeight+1)
        drawPatternedRect(
            ctx,
            { x: flagX, y: flagY, width: 10, height: 6 },
            BackgroundPattern.USSF
        )
        // ctx.fillRect(flagX, flagY, 10, 5)

        super.draw(ctx, delta)
    }

    colorBase() { return Color.White.clone(); }
}