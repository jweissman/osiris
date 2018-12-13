import * as ex from 'excalibur';
import { Actor, Color, Vector, Util, EdgeArea } from 'excalibur';
import { Building } from '../Building';
import { minBy, range } from '../../Util';
import { Citizen } from '../Citizen';
import { Game } from '../../Game';
import { Mountains } from './PlanetBackground';
import { Structure, MissionControl } from '../../models/Structure';


class NavigationTree {
   graph: Graph<Vector>

   constructor(root: Building) {
       // we take the root, add its nodes and follow
       // connections through slots...
       // this.root = root.nodes()[0]
       this.graph = new Graph()

       // we want to start adding nodes, exploring the building tree from here
       // let's grab the root node, and extend out from there?
       let nodes = root.nodes()
       // we'll assume the root building is simple, that we need to follow its slots
       // to find other subtrees?
       this.graph.node(nodes[0])
       this.graph.edge(nodes
   }

   //root() {
   //    this.root 
   //}

}

export class Planet extends Actor {
    buildings: Building[] = []
    citizens: Citizen[]

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

    placeBuilding(building: Building) {
        building.built = true
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

    pathBetween(source: Building, destination: Building) {
        // okay, so we want the general graph of connections
        // we can start wtih mission control...
        let ctrl = this.buildings.find(building => building.structure instanceof MissionControl);
        let navTree = new NavigationTree(ctrl) //this._navTree
        // navTree.shortestPath(source, destination)

    }

    // _navigationTree: NavigationTree
    // private get _navTree(): NavigationTree {
    //     // if (!this._navigationTree) {
    //         this._navigationTree = ctrl.tree() //new NavigationTree(ctrl); //ctrl)
    //         // this._navigationTree
    //     // }
    //     return this._navigationTree;
    // }

    //update(ctx, delta) {
    //    super.update(ctx, delta)
    //}
}