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
       this.graph = root.graph() // this.buildNav(root) //new Graph()

    //    this.buildNav(root)
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
}