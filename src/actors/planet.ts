import * as ex from 'excalibur';
import { Actor, Color, Vector } from 'excalibur';
import { Building } from './Building';
import { minBy, range } from '../Util';

class Layer extends Actor {
    //constructor(public x: number, public y: number, public width: size, public width: number) {
    //    super(0, y + size, size, layerSize, color.darken(0.2))
    //}
}

export class Planet extends Actor {
    buildings: Building[] = []

    constructor(
        // public effectiveY: number,
        public color: Color,
        public width: number = 10000,
        public depth: number = 6000,
        ) {
        super(0, 0, width, depth, color) //effectiveY + size/2, size, size, color) //Color.Transparent)
            //0,0,0,Color.Transparent) 
        // this.visible = false
        this.traits = this.traits.filter(trait => !(trait instanceof ex.Traits.OffscreenCulling))

        let yBase = -depth/2 // effectiveY + size/2
        // crust
        let crustHeight = 15
        this.add(new Actor(0, yBase, width, crustHeight, color.lighten(0.2).saturate(0.5)))

        //let layerSize = 2000
        //let layerCount = size/layerSize
        //console.log("layers", { range: range(layerCount)})
        //for (let i of range(layerCount)) {
        //    this.add(new Actor(0, yBase + crustHeight + (1+(i * layerSize)), size, layerSize, color.darken(i*0.125)))
        //}

        //let layerCount = 6
        //let layerSize = this.size / layerCount
        //// this.add(new Actor(0, this.y + layerSize, size, layerSize, color.darken(0.2)))
        //    this.add(
        //        new Actor(0, yBase + (layerSize * i) - size/2, size, layerSize, color.darken(0.2*i))
        //    )
        //}
    }

    placeBuilding(building: Building) {
        building.built = true
        this.buildings.push(building);
    }


    closestBuildingByType(cursor: Vector, structureName: string): Building {
        let matching = this.buildings.filter(building => 
            building.structure.name === structureName
        )

        if (matching) {
            let distanceToCursor = (vec) => cursor.distance(vec)
            return minBy(matching, distanceToCursor)
        }
    }
}