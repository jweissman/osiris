import { Color, Vector } from "excalibur";
import { Building, DevicePlace } from "./Building";
import { Orientation } from "../../values/Orientation";
import { Slot } from "../../values/Slot";
import { Device } from "../Device";
import { DeviceSize, getVisibleDeviceSize } from "../../values/DeviceSize";
import { drawPatternedRect } from "../../Util";

export class MediumSurfaceRoomView extends Building {
    hideBox = true

    devicePlaceSize = DeviceSize.Medium
    devicePlaceCount = 3

    devicePlaces() {
        let w = this.getWidth()/2
        let x = this.pos.x + w;
        let y = this.pos.y + this.getHeight() //- this.floorHeight // - 10 
        y -= getVisibleDeviceSize(this.devicePlaceSize) / 3.5 ///2

        let ds = [
            new Vector(x - w/2, y),
            ...(this.devicePlaceCount > 2 ? [new Vector(x,y)] : []),
            new Vector(x + w/2, y),
        ]

        return ds.map(d => new DevicePlace(d, this.devicePlaceSize)) 
        //DeviceSize.Small))
    }

    // afterConstruct() {
    //     let { machines } = this.structure;
    //     if (machines && machines.length > 0) {
    //         let machine = new machines[0]();
    //         this.devicePlaces().forEach(place => {
    //             let theDevice = new Device(machine, place.position)
    //             this.addDevice(theDevice)
    //         })
    //     }

    // }

    slots() {
        let theSlots: Slot[] = []
        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth() / 2,
                this.pos.y + this.getHeight(),
                Orientation.Down
            )
        )

        let slotY = this.getHeight();
        theSlots.push(
            this.buildSlot(
                this.pos.x, this.pos.y + slotY,
                Orientation.Left
            )
        )

        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth(),
                this.pos.y + slotY,
                Orientation.Right
            )
        )


        return theSlots;
    }

    constrainCursor(cursor: Vector): Vector {
        cursor.y = this.planet.getTop();
        return cursor;
    }

    reshape(cursor: Vector) {
        this.pos = cursor
        this.pos.y -= this.getHeight() - 2
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        let color = this.mainColor()

        ctx.fillStyle = color.toRGBA()

        // ctx.fillRect(this.pos.x, this.pos.y, this.getWidth(), this.getHeight())
        // let rect = 
            // { x: this.pos.x, y: this.pos.y, width: this.getWidth(), height: this.getHeight() };
        drawPatternedRect(
            ctx,
            this.aabb(),
            this.backgroundPattern
        )

        // a little flag :)
        let flagpoleHeight = 18
        let flagX = this.pos.x + 3 * (this.getWidth() / 4)
        let flagY = this.pos.y - flagpoleHeight
        ctx.fillRect(flagX, flagY, 2, flagpoleHeight)
        ctx.fillRect(flagX, flagY, 10, 5)

        super.draw(ctx, delta)
    }

    colorBase() { return Color.White; }
}