import * as ex from 'excalibur';
import { Actor, Color, Vector, Util, EdgeArea } from 'excalibur';
import { Building } from '../Building';
import { minBy, range } from '../../Util';
import { Citizen } from '../Citizen';
import { Mountains } from './PlanetBackground';
import { Structure, MissionControl } from '../../models/Structure';
import { NavigationTree } from './NavigationTree';

export class Planet extends Actor {
    buildings: Building[] = []
    citizens: Citizen[]
    navTree: NavigationTree

    constructor(
        // public effectiveY: number,
        public color: Color,
        public width: number = 2000000,
        public depth: number = 100000,
        ) {
        super(0, depth/2, width, depth, color)
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

    draw(ctx: CanvasRenderingContext2D, delta) {
        super.draw(ctx, delta)
        // let navTree = this.buildNavTree()
        if (this.navTree) {
            let edges = this.navTree.graph.edgeList()
            // console.log("draw edges", { edges })
            edges.forEach((edge: [Vector, Vector]) => {
                let [a,b] = edge
                ctx.beginPath()
                ctx.moveTo(a.x,a.y)
                ctx.lineTo(b.x,b.y)
                ctx.stroke() //Color.White.toRGBA())
            })
        }
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

    pathBetween(origin: Vector, destination: Building): Vector[] {
        // okay, so we want the general graph of connections
        // we can start wtih mission control...
        // console.log({ navGraph: this.navTree })
        if (!this.navTree) { this.buildNavTree() }
        // navTree.edgeToClosest(origin)
        let srcNode = this.navTree.closestNode(origin)
        let dest = destination.nodes()[0]
        let destNode = this.navTree.closestNode(dest)
        // if (!dest) { throw new Error("Building does not ")}
        let path = this.navTree.seekPath(srcNode, destNode) //destination.nodes()[0])
        // console.log("PATH", { path })
        // path.unshift(s)
        // path.push(dest)
        return path

        // hopefully the dest node is in the tree?
        // navTree.shortestPath
        // navTree.shortestPath(source, destination)

    }

    private buildNavTree() {
        let ctrl = this.buildings.find(building => building.structure instanceof MissionControl);
        if (ctrl) {
        this.navTree = new NavigationTree(ctrl) //this._navTree
        // return navTree
        }
    }

}