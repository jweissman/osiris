import * as ex from 'excalibur';
import { Actor, Color, Vector, Util, EdgeArea } from 'excalibur';
import { Building } from '../Building';
import { minBy, range } from '../../Util';
import { Citizen } from '../Citizen';
import { Mountains } from './PlanetBackground';
import { Structure, MissionControl, LivingQuarters } from '../../models/Structure';
import { NavigationTree } from './NavigationTree';

export class Planet extends Actor {
    buildings: Building[] = []
    citizens: Citizen[] = []
    navTree: NavigationTree
    currentlyConstructing: Building = null

    constructor(
        // public effectiveY: number,
        public color: Color,
        public width: number = 2000000,
        public depth: number = 1000000,
        ) {
        super(0, depth/2, width, depth, color)
        this.traits = this.traits.filter(trait => !(trait instanceof ex.Traits.OffscreenCulling))

        let yBase = -depth/2 // effectiveY + size/2
        // crust
        let crustHeight = 20
        this.createLayer(yBase, crustHeight, this.color.lighten(0.25))


        let layerCount = 10
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

    draw(ctx: CanvasRenderingContext2D, delta) {
        super.draw(ctx, delta)
       if (this.currentlyConstructing) {
           this.currentlyConstructing.draw(ctx, delta)
       }
        this.buildings.forEach(building => building.draw(ctx, delta))

        this.citizens.forEach(citizen => citizen.draw(ctx, delta))
    }

    update(engine, delta) {
        super.update(engine, delta)

        this.buildings.forEach(building => building.update(engine, delta))
        this.citizens.forEach(citizen => citizen.update(engine, delta))
    }

    placeBuilding(building: Building) {
        building.built = true
        // whew
        if (building.parentSlot) {
            building.parentSlot.parent.childrenBuildings.push(building)
            // rebuild nav?
            this.buildNavTree()
        }
        this.buildings.push(building);
        building.afterConstruct()
    }

    populate(pos: Vector) {
        let home = this.closestBuildingByType(pos, [LivingQuarters])
        console.log("populating", { home })
        let citizen = new Citizen(home, this)
        citizen.work()
        this.citizens.push(citizen)
    }


    closestBuildingByType(cursor: Vector, structureTypes: (typeof Structure)[], predicate: (Building) => boolean = ()=>true): Building {
        let matching = this.buildings.filter(building => 
            structureTypes.some(structureType => (building.structure instanceof structureType)) &&
              predicate(building)
        )

        if (matching && matching.length > 0) {
            let distanceToCursor = (building) => cursor.distance(building.nodes()[0])
            return minBy(matching, distanceToCursor)
        }
    }

    pathBetween(origin: Vector, destination: Building): Vector[] {
        if (!this.navTree) { this.buildNavTree() }
        let srcNode = this.navTree.closestNode(origin)
        let dest = destination.nodes()[0]
        let destNode = this.navTree.closestNode(dest)
        let path = this.navTree.seekPath(srcNode, destNode)
        return path
    }

    private buildNavTree() {
        let ctrl = this.buildings.find(building => building.structure instanceof MissionControl);
        if (ctrl) {
            this.navTree = new NavigationTree(ctrl)
        }
    }

}