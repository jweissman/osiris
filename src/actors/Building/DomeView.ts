import { Color, Vector } from "excalibur";
import { Building, DevicePlace } from "./Building";
import { Orientation } from "../../values/Orientation";
import { DeviceSize, getVisibleDeviceSize } from "../../values/DeviceSize";
import { Graph } from "../../values/Graph";
import { measureDistance, eachCons } from "../../Util";

export class DomeView extends Building {
    hideBox = true
    showLabel = true

    graph(sg) {
        let g = super.graph(sg)
        let find = (s: Vector) => g.findOrCreate(s, measureDistance)

        let slots: Vector[] = this.slots().map(s => s.pos)
        let leftSlot = find(slots[0]), rightSlot = find(slots[slots.length-1])
        let devices = this.deviceInteractionPlaces().map(position => find(position))
        g.edge(leftSlot, devices[0])
        eachCons(devices, 2).forEach(([left, right]) => g.edge(left, right))
        g.edge(devices[devices.length-1], rightSlot)

        let node = this.nodes()[0]
        devices.forEach(device => g.edge(device, find(node)))

        return g

    }

    slots() {
        let theSlots = [];
        let slotY = this.getHeight();

        let buffer = this.getWidth() / 4


        theSlots.push(
            this.buildSlot(
                this.pos.x - buffer, this.pos.y + slotY,
                Orientation.Left
            )
        )

        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth() + buffer,
                this.pos.y + slotY,
                Orientation.Right
            )
        )

        return theSlots;
    } 

    //reshape(cursor: Vector) {
    //    this.alignToSlot(cursor)
    //}

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        let color: Color = this.mainColor()

        let h = this.getHeight() //getWidth()/2

        ctx.beginPath()
        ctx.arc(
            this.pos.x + this.getWidth()/2,
            this.pos.y + h, //this.getHeight(),
            this.getWidth()/1.5,
            0,
            Math.PI,
            true
        )
        ctx.closePath()
        ctx.fillStyle = color.toRGBA()
        ctx.fill()

        super.draw(ctx, delta)
    }

    colorBase() { return Color.White.clone().darken(0.05); } 

    deviceSize = DeviceSize.Small
    devicePlaceCount = 2
    devicePlaces() {
        let w = this.getWidth()/2
        let x = this.pos.x + w;
        let y = this.pos.y + this.getHeight() - getVisibleDeviceSize(this.deviceSize)/3 // - 16
        let ds = [
            new Vector(x - w/3, y),
            ...(this.devicePlaceCount === 3 ? [new Vector(x,y)] : []),
            new Vector(x + w/3, y),
        ]

        return ds.map(d => new DevicePlace(d, this.deviceSize)) // DeviceSize.Small))
    }
}