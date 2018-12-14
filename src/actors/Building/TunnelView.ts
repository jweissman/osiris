import { Vector } from "excalibur";
import { Building } from "./Building";
import { MissionControl } from "../../models/Structure";
import { range, eachCons, measureDistance } from "../../Util";
import { Slot } from "../../values/Slot";
import { Orientation, flip } from "../../values/Orientation";
import { Graph } from "../../values/Graph";

export class TunnelView extends Building {
    pickingOrigin: boolean = true

    nodes(): Vector[] {
        let x = this.pos.x + this.getWidth()/2;
        let y = this.pos.y // + this.getHeight()
        return [
            new Vector(Math.floor(x), y) //, Math.floor(y)-4)
        ];
    }

    graph(supergraph: Graph<Vector> = new Graph()): Graph<Vector> {
        let g = supergraph;
        // super.graph(g)
        // okay, so we need to connect our 'line' of nodes together
        // we don't necessarily need to care if there IS a child node there

        let halfWidth = this.getWidth()/2
        let x = this.pos.x + halfWidth

        // connect node to first slot...
        let root = g.findOrCreate(this.nodes()[0], measureDistance)
        let first = g.findOrCreate(new Vector(x,this.slotHeights()[0]), measureDistance)
        g.edge(root,first)

        eachCons(this.slotHeights(), 2).forEach(([y0,y1]: [number,number]) => {
            let top = g.findOrCreate(new Vector(x,y0), measureDistance)
            let btm = g.findOrCreate(new Vector(x,y1), measureDistance)
            g.edge(top, btm)
        })
        this.slotHeights().forEach(y1 => {
            let btm = g.findOrCreate(new Vector(x,y1), measureDistance)

            let left = g.findOrCreate(new Vector(x-halfWidth,y1), measureDistance)
            g.edge(left,btm)

            let right = g.findOrCreate(new Vector(x+halfWidth,y1), measureDistance)
            g.edge(btm,right)
        });

        for (let child of this.childrenBuildings) {
            let slot = g.findOrCreate(child.parentSlot.pos, measureDistance)
            let childNode = g.findOrCreate(child.nodes()[0], measureDistance)
            g.edge(childNode, slot)

            child.graph(g)
        }
        //  this.s

        return g;
    }

    private slotHeights() {
        let slotSize = 40
        let slotCount = Math.floor((this.getHeight()-60) / slotSize)
        let heights = []
        for (let i of range(slotCount)) {
            heights.push(
                100 + this.pos.y + i * slotSize,
            )
        }
        return heights
    }

    slots() {
        // let slotSize = 40
        // let slotCount = Math.floor((this.getHeight()-60) / slotSize)
        let theSlots: Slot[] = []

        // one at the top pointing up??
        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth()/2,
                this.pos.y,
                Orientation.Up
            )
        )

        for (let y of this.slotHeights()) { //range(slotCount)) {
            theSlots.push(
                this.buildSlot(
                    this.pos.x, y,
                    // 100 + this.pos.y + i * slotSize,
                    Orientation.Left
                )
            )

            theSlots.push(
                this.buildSlot(
                    this.pos.x + this.getWidth(),
                    y,
                    // 100 + this.pos.y + i * slotSize,
                    Orientation.Right,
                )
            )
        }
        // console.log({theSlots})
        return theSlots;
    } 

    validConnectingStructures() { return [ MissionControl ] }

    handleClick(cursor: Vector) {
        // pick nearest mission ctrl as origin
        if (this.pickingOrigin) {
            //let theSlot = this.findSlot(cursor);
            ////let lastCtrl: Building = this.planet.closestBuildingByType(
            ////    this.pos, MissionControl // 'Mission Control'
            ////)
            //if (theSlot) {
            //    this.pos = theSlot.pos
            //    // let missionControlWidth = new MissionControl().width
            //    // this.pos.x = slot.pos.x + missionControlWidth / 2 - this.getWidth() / 2 //[0].x
            //    let matchingSlot = this.slots().find(s => s.facing == flip(theSlot.facing))
            //    if (matchingSlot) {
            //        let offset = this.pos.sub(matchingSlot.pos)
            //        this.pos.addEqual(offset)

                    this.pickingOrigin = false;
                    return false;
            //    }
            //}
        }
        return true;
    }

    // picking a depth for a tunnel first?
    constrainCursor(cursor: Vector): Vector {
        if (this.pickingOrigin) {

            this.alignToSlot(cursor)
            //let theSlot = this.findSlot(cursor);
            //if (theSlot) {
            //    this.pos = theSlot.pos
            //}
            // snap to nearest mission ctrl?
            //let lastCtrl: Building = this.planet.closestBuildingByType(
            //    cursor, MissionControl //'Mission Control'
            //)
            //this.pos.x = lastCtrl.x + lastCtrl.getWidth() / 2 - this.getWidth() / 2 //[0].x

        } else {
            // we're determining depth of tunnel
            cursor.y = Math.max(this.planet.getTop() + 100, cursor.y)
        }
        return cursor;
    }

    // expand
    reshape(cursor: Vector) {
        this.pos.y = this.planet.getTop() + 2
        if (!this.pickingOrigin) {
          this.setHeight(cursor.y - this.planet.getTop())
        }
    }

    // draw(ctx: CanvasRenderingContext2D) {
    //     let depth = this.getHeight()
    //     let width = this.getWidth()
    //     let edgeWidth = 4

    //     let edgeColor = this.edgeColor()
    //     let mainColor = this.mainColor()

    //     ctx.fillStyle = edgeColor.toRGBA()
    //     ctx.fillRect(this.x, this.y, width, depth)

    //     if (this.pickingOrigin) { mainColor.a = 0.5 }
    //     ctx.fillStyle = mainColor.toRGBA()
    //     ctx.fillRect(this.x + edgeWidth, this.y, width - edgeWidth*2, depth)
    // }

    colorBase() { return this.color.darken(0.2); }
}