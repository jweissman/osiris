export class Graph<T> {
    private empty: boolean = true
    private nodes: T[] = []
    private edges: { [key: number]: number[] } = {}

    public isEmpty(): boolean {
        return this.empty;
    }

    public get size() { return this.nodes.length }

    public node(newNode: T) {
        this.empty = false;
        if (!this.contains(newNode)) {
            this.nodes.push(newNode)
        }
    }

    public contains(testNode: T) {
        return this.nodes.includes(testNode)
    }

    public edge(src: T, dst: T) {
        this.node(src)
        this.node(dst)

        let s = this.indexOf(src), d = this.indexOf(dst)
        this.edges[s] = this.edges[s] || []
        this.edges[s].push(d)

        this.edges[d] = this.edges[d] || []
        this.edges[d].push(s)
    }

    public adjacent(testNode: T): T[] {
        let vertex = this.edges[this.indexOf(testNode)] || []
        return vertex.map((index) => this.nodes[index])
    }

    private adjacentIndices(testNodeIndex: number): number[] {
        let vertex = this.edges[testNodeIndex] || []
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

    public shortestPath(src: T, dst: T): T[] {
        let prevStep = {}
        let dstIndex = this.indexOf(dst)
        this.bfs(src, (prev, curr) => {
            prevStep[curr] = prev;
            return curr !== dstIndex
        })
        let path = []
        let curr = dstIndex
        let steps = 0, maxStep = 128
        while (!path.includes(this.indexOf(src)) && steps < maxStep) {
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