import { Actor, Vector, Traits, Color } from 'excalibur';
import { Building } from '../Building';
import { minBy, flatSingle } from '../../Util';
import { Structure, MissionControl } from '../../models/Structure';
import { NavigationTree } from './NavigationTree';
import { Machine } from '../../models/Machine';
import { Device } from '../Device';
export class Colony extends Actor {
    navTree: NavigationTree;
    buildings: Building[] = [];
    currentlyConstructing: Building | Device = null;

    constructor(x: number, y: number) {
        super(x, y, 0, 0); // 1000, 1000);
        this.traits = this.traits.filter(trait => !(trait instanceof Traits.OffscreenCulling));
    }

    draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta);

        let debugTree = false
        if (this.navTree && debugTree) {
            let edges = this.navTree.graph.edgeList();
            edges.forEach((edge) => {
                let [a,b] = edge;
                var gradient = ctx.createLinearGradient(a.x,a.y+this.pos.y,b.x,b.y+this.pos.y);

                gradient.addColorStop(0, 'green');
                gradient.addColorStop(1, 'blue');

                ctx.beginPath()
                ctx.moveTo(a.x, a.y + this.pos.y)
                ctx.lineTo(b.x, b.y + this.pos.y)
                ctx.closePath()
                ctx.strokeStyle = gradient
                ctx.lineWidth = 0.5
                ctx.stroke()
            })
        }

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

    closestBuildingByType(cursor: Vector, structureTypes: (typeof Structure)[] = [], predicate: (Building) => boolean = () => true): Building {
        let matching = this.buildings
        .filter(building => //predicate(building) &&
            (structureTypes.length > 0
            ? structureTypes.some(st => building.structure instanceof st)
            : true)
             && predicate(building)
        )

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

    closestDeviceByType(cursor: Vector, machineTypes: (typeof Machine)[] = [], predicate: (Device) => boolean = () => true) {
        let devices = this.findAllDevices()
        devices = devices.filter(d => 
            (machineTypes.length > 0 ? machineTypes.some(machine => d.machine instanceof machine) : true)
             && predicate(d)
        )

        if (devices && devices.length > 0) {
            let proximity = (d) => cursor.distance(d)
            return minBy(devices, proximity)
        }
    }

    private buildNavTree() {
        let ctrl = this.buildings.find(building => building.structure instanceof MissionControl);
        if (ctrl) {
            this.navTree = new NavigationTree(ctrl);
        }
    }

    findAllDevices() {
        return flatSingle(this.buildings.map(b => b.getDevices()))
    }
}
