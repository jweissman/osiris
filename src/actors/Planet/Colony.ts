import { Actor, Vector, Traits } from 'excalibur';
import { Building } from '../Building';
import { minBy } from '../../Util';
import { Structure, MissionControl } from '../../models/Structure';
import { NavigationTree } from './NavigationTree';
export class Colony extends Actor {
    navTree: NavigationTree;
    buildings: Building[] = [];
    currentlyConstructing: Building = null;
    constructor(x: number, y: number) {
        super(x, y, 100, 100);
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling));
    }
    draw(ctx, delta) {
        super.draw(ctx, delta);
        // console.log("DRAW COLONY", { colony: this });
        // if (this.currentlyConstructing) {
        //     this.currentlyConstructing.draw(ctx, delta)
        // }
    }
    placeBuilding(building: Building) {
        building.built = true;
        if (building.parentSlot) {
            building.parentSlot.parent.childrenBuildings.push(building);
            this.buildNavTree();
        }
        this.buildings.push(building);
        building.afterConstruct();
        this.add(building);
    }
    closestBuildingByType(cursor: Vector, structureTypes: (typeof Structure)[], predicate: (Building) => boolean = () => true): Building {
        let matching = this.buildings.filter(building => structureTypes.some(structureType => (building.structure instanceof structureType)) &&
            predicate(building));
        if (matching && matching.length > 0) {
            let distanceToCursor = (building) => cursor.distance(building.nodes()[0]);
            return minBy(matching, distanceToCursor);
        }
    }
    pathBetween(origin: Vector, destination: Building): Vector[] {
        if (!this.navTree) {
            this.buildNavTree();
        }
        let srcNode = this.navTree.closestNode(origin);
        let dest = destination.nodes()[0];
        let destNode = this.navTree.closestNode(dest);
        let path = this.navTree.seekPath(srcNode, destNode);
        return path;
    }
    private buildNavTree() {
        let ctrl = this.buildings.find(building => building.structure instanceof MissionControl);
        if (ctrl) {
            this.navTree = new NavigationTree(ctrl);
        }
    }
}
