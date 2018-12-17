import { Graph } from './Graph'

describe('Graph', () => {
    describe('emptiness', () => {
        it('may be empty', () => {
            let graph = new Graph()
            expect(graph.isEmpty()).toBe(true)

            graph.node('hello')
            graph.node('world')
            expect(graph.isEmpty()).toBe(false)
        })
    })

    describe('adding nodes', () => {
        it('may add nodes', () => {
            let graph = new Graph()
            graph.node('hello')
            graph.node('there')
            graph.node('world')
            expect(graph.contains('hello')).toBe(true)
            expect(graph.contains('goodbye')).toBe(false)
        })
    })

    describe('connection', () => {
        it('may connect nodes with edges', () => {
            let graph = new Graph()
            graph.node('hello')
            graph.node('there')
            graph.node('world')
            graph.edge('hello', 'world')
            expect(graph.adjacent('hello')).toEqual(['world'])
            expect(graph.adjacent('world')).toEqual(['hello'])
            expect(graph.adjacent('there')).toEqual([])
        })
    })

    describe('union', () => {
        it('adds graphs together', () => {
            let graph = new Graph()
            graph.edge('hello', 'there')
            let anotherGraph = new Graph()
            anotherGraph.edge('there', 'world')
            graph.union(anotherGraph)
            expect(graph.edgeList()).toEqual([
                ['hello', 'there'],
                ['there', 'world']
            ])

        })
    })

    describe('measurements', () => {
        it('can count nodes', () => {
            let graph = new Graph()
            expect(graph.size).toEqual(0)
            graph.node('hello')
            graph.node('there')
            graph.node('world')
            expect(graph.size).toEqual(3)
        })

        it('can report all edges', () => {
            let graph = new Graph()
            graph.edge('a', 'b')
            graph.edge('a', 'c')
            graph.edge('c', 'd')
            expect(graph.edgeList()).toEqual([
                ['a', 'b'],
                ['a', 'c'],
                ['c', 'd']
            ])
        })
    })

    describe('traversal', () => {
        let graph: Graph<string> = new Graph();
        beforeEach(() => {
            //
            //  A ----> B -----> C ----> D
            //    ----> E -----> F ----> G
            //            -----> H ----> I
            //

            graph.edge('a', 'b')
            graph.edge('b', 'c')
            graph.edge('c', 'd')

            graph.edge('a', 'e')
            graph.edge('e', 'f')
            graph.edge('f', 'g')

            graph.edge('e', 'h')
            graph.edge('h', 'i')
        })

        it('can perform a dfs', () => {
            expect(graph.dfs()).toEqual([
                'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'
            ])
        })

        it('can perform a bfs', () => {
            expect(graph.bfs()).toEqual([
                'a', 
                'b', 'e',
                'c', 'f', 'h',
                'd', 'g', 'i'
            ])
        })

        it('can find the shortest path', () => {
            let path = graph.shortestPath('a', 'i'); 
            // console.log("path", { path })

            expect(path).toEqual(
                ['a', 'e', 'h', 'i']
            )
        })
    })
})