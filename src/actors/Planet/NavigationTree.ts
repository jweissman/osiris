import { Graph } from "../../values/Graph";
import { Vector } from "excalibur";
import { Building } from "../Building";
import { minBy } from "../../Util";

export class NavigationTree {
   graph: Graph<Vector>

   constructor(root: Building) {
       // we take the root, add its nodes and follow
       // connections through slots...
       // this.root = root.nodes()[0]
       this.graph = new Graph()
       this.buildNav(root)
       console.log('nav graph', { g: this.graph})
   }

   seekPath(origin: Vector, dest: Vector): Vector[] {
       console.log("i would try to seek a path between", { origin, dest })
       console.log("does the graph even have all the elements?", {graph: this.graph})
       console.log("has origin?", this.graph.contains(origin))
       console.log("has dest?", this.graph.contains(dest))
       // ...
      return this.graph.shortestPath(origin, dest)
       return []
   }

   closestNode(testNode: Vector) {
       // find the closest node to new node
       let nodes = this.graph.dfs()
       console.log("nodes in graph", { nodes })
    //    debugger;

       let closest = minBy(nodes, (node: Vector) => Math.abs(testNode.distance(node)))
       // edge to it!
       if (closest) {
        //    console.log("EDGE TO CLOSEST", { newNode, nodes, closest })
        //    this.graph.edge(newNode, closest)
           return closest
       }
       return false
   }

   buildNav(root: Building) {
       console.log("BUILD NAV FOR", { structure: root.structure.name })
        // does this building have a complex graph already?
        // we can just add it...
        let nodes = root.nodes()
        // we'll assume the root building is simple, that we need to follow its slots
        // to find other subtrees?
        let tolerance = 6
        let rootNode = nodes[0]
            let closeRoot = this.closestNode(rootNode)
            if (closeRoot && closeRoot.distance(rootNode) < tolerance) { rootNode = closeRoot; }
        // this.graph.node(rootNode) //nodes[0])
        for (let child of root.childrenBuildings) {

            // we need to know which slot they took, to draw the edge to the node
            let slot = child.parentSlot.pos
            let closeSlot = this.closestNode(slot)
            if (closeSlot && closeSlot.distance(slot) < tolerance) { slot = closeSlot; }
            this.graph.edge(rootNode, slot)

            // and then the slot to the child node
            let childNode = child.nodes()[0]
            this.graph.edge(slot, childNode)

            // and recurse for each child building?
            //    let childNode
            this.buildNav(child)

        }
    }

}