import { Vector } from "excalibur";
import { Building } from "./Building";
import { range, eachCons, measureDistance } from "../../Util";
import { Slot } from "../../values/Slot";
import { Orientation, flip } from "../../values/Orientation";
import { Graph } from "../../values/Graph";
import { drawRect } from "../../Painting";
import { Scale } from "../../values/Scale";

export class TunnelView extends Building {
    slotSize: number = Scale.major.third // + 10
    pickingOrigin: boolean = true
    hideBox = true

    colorBase() { return this.planet.color.darken(0.2); }

    draw(ctx, delta) {
        let rect = this.aabb()
        drawRect(ctx, rect, this.color.darken(0.1)) 

        let n = 5
        rect.x = rect.x + this.getWidth() / n
        rect.width -= (2) * (this.getWidth() / n)
        drawRect(ctx, rect, this.color.darken(0.2)) 
        // super.draw(ctx, delta)
    }

    nodes(): Vector[] {
        let x = this.pos.x + this.getWidth()/2;
        let y = this.pos.y
        return [
            new Vector(Math.floor(x), y)
        ];
    }

    graph(supergraph: Graph<Vector> = new Graph()): Graph<Vector> {
        let g = supergraph;

        let halfWidth = this.getWidth()/2
        let x = this.pos.x + halfWidth

        let root = g.findOrCreate(this.nodes()[0], measureDistance)
        let first = g.findOrCreate(new Vector(x,this.slotHeights()[0]), measureDistance)
        g.edge(root,first)

        let heights = this.slotHeights()

        eachCons(heights, 2).forEach(([y0,y1]: [number,number]) => {
            let top = g.findOrCreate(new Vector(x,y0), measureDistance)
            let btm = g.findOrCreate(new Vector(x,y1), measureDistance)
            g.edge(top, btm)
        })

        let btm = g.findOrCreate(new Vector(x, this.pos.y + this.getHeight()), measureDistance)
        let lst = g.findOrCreate(new Vector(x, heights[heights.length-1]), measureDistance)
        g.edge(btm,lst)

        heights.forEach(y1 => {
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
            g.edge(slot, childNode)

            child.graph(g)
        }

        return g;
    }

    private slotHeights() {
            // let minDepth = Scale.major.eighth + 50
            // let buffer = 20

        // let slotSize = Scale.major.eighth + 5 //minDepth + buffer
        let slotCount = Math.floor((this.getHeight()) / this.slotSize)
        let heights = []

        let y = this.pos.y // + minDepth + buffer

        if (slotCount > 0) {
            for (let i of range(slotCount)) {
                heights.push(
                    y + ((i+1) * this.slotSize),
                )
            }
        } else {
            heights.push(this.slotSize)
        }
        return heights
    }

    slots() {
        let theSlots: Slot[] = []

        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth()/2,
                this.pos.y,
                Orientation.Up
            )
        )

        for (let y of this.slotHeights()) {
            theSlots.push(
                this.buildSlot(
                    this.pos.x, y,
                    Orientation.Left
                )
            )

            theSlots.push(
                this.buildSlot(
                    this.pos.x + this.getWidth(),
                    y,
                    Orientation.Right,
                )
            )
        }

        theSlots.push(
            this.buildSlot(
                this.pos.x + this.getWidth()/2,
                this.pos.y + this.getHeight(),
                Orientation.Down
            )
        )
        return theSlots;
    } 

    handleClick(cursor: Vector) {
        if (this.pickingOrigin) {
            this.pickingOrigin = false;
            return false;
        }
        return true;
    }

    constrainCursor(cursor: Vector): Vector {
        if (this.pickingOrigin) {
            // this.alignToSlot(cursor)
        } else {
            // cursor.y = Math.max(this.planet.getTop() + 100, cursor.y)
        }
        return cursor;
    }

    reshape(cursor: Vector) {
        // this.pos.y = this.planet.getTop() + 2
        if (this.pickingOrigin) {
            this.alignToSlot(cursor)
        } // else {
            // min depth/height has to be at least 
            // let minDepth = Scale.major.eighth
            // let buffer = 100

            let depth = 
                (this.slotSize * Math.floor(Math.abs(cursor.y - this.planet.getTop()) / this.slotSize)) + 15

          this.setHeight(
              Math.max(depth, this.slotSize + 15)
          )
        // }
    }

}