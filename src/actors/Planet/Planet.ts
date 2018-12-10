import * as ex from 'excalibur';
import { Actor, Color, Vector, Util } from 'excalibur';
import { Building } from '../Building';
import { minBy, range } from '../../Util';
import { Citizen } from '../Citizen';
import { Game } from '../../Game';
import { Mountains } from './PlanetBackground';
import { Structure } from '../../models/Structure';

export class Planet extends Actor {
    buildings: Building[] = []
    citizens: Citizen[]

    constructor(
        // public effectiveY: number,
        public color: Color,
        public width: number = 2000000,
        public depth: number = 100000,
        ) {
        super(0, depth/2, width, depth, color) //effectiveY + size/2, size, size, color) //Color.Transparent)
            //0,0,0,Color.Transparent) 
        // this.visible = false
        this.traits = this.traits.filter(trait => !(trait instanceof ex.Traits.OffscreenCulling))

        let yBase = -depth/2 // effectiveY + size/2
        // crust
        let crustHeight = 20
        this.createLayer(yBase, crustHeight, this.color.lighten(0.25))


        let layerCount = 20
        let layerHeight = depth / layerCount 
        for (let i of range(layerCount)) {
            this.createLayer(
                yBase + crustHeight + (layerHeight/2) + (layerHeight * (i+1)),
                layerHeight,
                this.color.darken(0.05 + 0.01 * i)
            )
        }

        this.add(new Mountains(-depth/2, this.getWidth(), this.color.lighten(0.15)))
    }

    private createLayer(y: number, size: number, color: Color) {
        let theLayer = new Actor(0, y, this.getWidth(), size, color);
        this.add(theLayer);
    }

    placeBuilding(building: Building) {
        building.built = true
        this.buildings.push(building);

        // let citizen = new Citizen(building.x + 10, building.y + building.getHeight());
        // // citizen.setZIndex(10)
        // this.add(citizen)
        // citizen.z = 10
        // citizen.setZIndex(10)
    }


    closestBuildingByType(cursor: Vector, structureType: typeof Structure): Building {
        let matching = this.buildings.filter(building => 
            building.structure instanceof structureType //.name === structureName
        )

        if (matching && matching.length > 0) {
            let distanceToCursor = (vec) => cursor.distance(vec)
            return minBy(matching, distanceToCursor)
        }
    }

    //update(ctx, delta) {
    //    super.update(ctx, delta)
    //}
}