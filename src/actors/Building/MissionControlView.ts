import { Color, Vector } from "excalibur";
import { Building, DevicePlace } from "./Building";
import { Orientation } from "../../values/Orientation";
import { Slot } from "../../values/Slot";
import { Device } from "../Device";
import { DeviceSize } from "../../values/DeviceSize";

export class MissionControlView extends Building {
    hideBox = true

    devicePlaces() {
        return this.nodes().map(n => {
            n.y -= 20
            return new DevicePlace(n, DeviceSize.Medium)
        }) 
    }

    afterConstruct() {
        // build devices?
        let { machines } = this.structure;
        if (machines && machines.length > 0) {
            let machine = new machines[0]();
            this.devicePlaces().forEach(place => {
                let theDevice = new Device(machine, place.position)
                this.addDevice(theDevice)
                // this.devices.push(theDevice)
                // theDevice.building = this;
                // this.add(theDevice)
            })
        }

    }

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
        this.pos.y -= this.getHeight() - 2 // + 1
    }

    //async interact(citizen: Citizen) {
    //}

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        let color = this.mainColor();

        ctx.fillStyle = color.toRGBA()
        // y is going to be surface height
        ctx.fillRect(this.pos.x, this.pos.y, this.getWidth(), this.getHeight())

        // could draw a little flag :)
        let flagpoleHeight = 18
        let flagX = this.pos.x + 3 * (this.getWidth() / 4)
        let flagY = this.pos.y - flagpoleHeight
        ctx.fillRect(flagX, flagY, 2, flagpoleHeight)
        ctx.fillRect(flagX, flagY, 10, 5)

        super.draw(ctx, delta)
    }

    colorBase() { return Color.White; }
}