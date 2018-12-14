import { minBy } from "../Util";

export class Graph<T> {
    private empty: boolean = true
    public nodes: T[] = []
    private edges: { [key: number]: number[] } = {}
    private edgesInverse: { [key: number]: number[] } = {}

    public isEmpty(): boolean {
        return this.empty;
    }

    public get size() { return this.nodes.length }

    public node(newNode: T) {
        this.empty = false;
        if (!this.contains(newNode)) {
            console.log("create new node", { newNode })
            this.nodes.push(newNode)
        }
    }

    public contains(testNode: T) {
        return this.nodes.includes(testNode)
    }

    public findOrCreate(testNode: T, measure: (a: T, b: T) => number, tolerance: number = 5): T {
        let nodes = this.dfs();
        let closest = minBy(nodes, (node: T) => measure(testNode, node))
        if (closest && measure(closest, testNode) < tolerance) {
            return closest;
        }
        return testNode;
    }

    public edge(src: T, dst: T) {
        console.log("edge from", { src, dst })
        this.node(src)
        this.node(dst)

        let s = this.indexOf(src), d = this.indexOf(dst)
        this.edges[s] = this.edges[s] || []
        this.edges[s].push(d)

        this.edgesInverse[d] = this.edgesInverse[d] || []
        this.edgesInverse[d].push(s)
    }

    public union(otherGraph: Graph<T>) {
    //    let g: Graph<T> = new Graph()
       otherGraph.edgeList().forEach(([a,b]) => this.edge(a,b))
    //    this.edgeList().forEach(([a,b]) => g.edge(a,b))
    }

    public edgeList(): [T,T][] {
        let theEdges = []
        for (let node of this.nodes) {
            let index = this.indexOf(node)
            if (this.edges[index]) {
                for (let otherIndex of this.edges[index]) {
                    let otherNode = this.nodes[otherIndex]
                    if (!theEdges.includes([otherNode, node])) {
                        theEdges.push([node, otherNode])
                    }
                }
            }
        }
        return theEdges
    }

    public adjacent(testNode: T): T[] {
        let index = this.indexOf(testNode)
        let vertex = this.adjacentIndices(index)
        return vertex.map((n) => this.nodes[n])
    }

    private adjacentIndices(testNodeIndex: number): number[] {
        let es = this.edges[testNodeIndex] || []
        let esInv = this.edgesInverse[testNodeIndex] || []
        let vertex = [...es, ...esInv ]
        return vertex
    }

    public dfs(root:T=null, visited=[]): T[] {
        let rIndex = root ? this.indexOf(root) : 0
        return this.dfsIndex(rIndex).map(n => this.nodes[n])
    }

    private dfsIndex(rootIndex:number=0, visited:number[]=[]) {
        visited.push(rootIndex)
        let children = this.adjacentIndices(rootIndex)
        children.forEach((childIndex: number) => {
            if (!visited.includes(childIndex)) {
                this.dfsIndex(childIndex, visited)
            }
        })

        return visited
    }

    public bfs(root:T=null, cb: (x: number,y: number)=>boolean = ()=>true): T[] {
        let rIndex = root ? this.indexOf(root) : 0
        return this.bfsIndex(rIndex, cb).map(n => this.nodes[n])
    }

    private bfsIndex(rootIndex:number=null, cb: (x: number, y: number) => boolean = () => true): number[] {
        let halt = false;
        let visited: number[] = []
        visited.push(rootIndex)
        while (visited.length < this.nodes.length) {
            for (let visitedNode of visited) {
                let adj: number[] = this.adjacentIndices(visitedNode)
                for (let adjacentNode of adj) {
                    if (!visited.includes(adjacentNode)) {
                        if (!cb(visitedNode, adjacentNode)) {
                            halt = true;
                            break;
                        }
                        visited.push(adjacentNode)
                    }
                }
                if (halt) break;
            }
            if (halt) break;
        }
        return visited
    }

    public shortestPath(src: T, dst: T, maxStep: number = 256): T[] {
        let prevStep = {}
        let dstIndex = this.indexOf(dst)
        this.bfs(src, (prev, curr) => {
            prevStep[curr] = prev;
            return curr !== dstIndex
        })
        let path = []
        let curr = dstIndex
        let steps = 0
        let srcIndex = this.indexOf(src)
        while (!path.includes(srcIndex) && steps < maxStep) {
            path.push(curr)
            curr = prevStep[curr]
            steps += 1
        }
        let pathNodes = path.map(n => this.nodes[n])
        return pathNodes.reverse()
    }

    private indexOf(node: T) {
        return this.nodes.indexOf(node)
    }

}