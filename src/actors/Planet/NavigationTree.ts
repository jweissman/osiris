import { Graph } from "../../values/Graph";
import { Vector } from "excalibur";
import { Building } from "../Building";
import { minBy } from "../../Util";
import { Scale } from "../../values/Scale";

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

   closestNodeAtSameYCoordinate(testNode: Vector, tol: number = Scale.major.fourth) {
       let nodes = this.graph.dfs()
       let closest = minBy(
           nodes.filter((node: Vector) => Math.abs(node.y - testNode.y) < tol),
           (node: Vector) => Math.abs(testNode.distance(node)),
       )
       if (closest) {
           return closest
       }
       return false
   }
}