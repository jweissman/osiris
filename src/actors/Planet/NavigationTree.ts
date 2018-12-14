import { Graph } from "../../values/Graph";
import { Vector } from "excalibur";
import { Building } from "../Building";
import { minBy } from "../../Util";

export class NavigationTree {
   graph: Graph<Vector>

   constructor(root: Building) {
       this.graph = root.graph()
   }

   seekPath(origin: Vector, dest: Vector): Vector[] {
      return this.graph.shortestPath(origin, dest)
   }

   closestNode(testNode: Vector) {
       let nodes = this.graph.dfs()
       let closest = minBy(nodes,
           (node: Vector) => Math.abs(testNode.distance(node))
       )
       if (closest) {
           return closest
       }
       return false
   }
}