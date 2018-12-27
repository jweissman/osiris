import { Vector } from 'excalibur';
import { ResourceBlock } from './Economy';
import { Scale } from '../values/Scale';
import { Orientation } from '../values/Orientation';
import { Machine, Orchard, ExperimentBench, Stove, MiningDrill, Bookshelf, MineralProcessor, CommandCenter } from './Machine';

const { major, minor } = Scale



export class Structure {
    name: string = '(structure name)';
    description: string = '(structure description)';
    view: string = '<structure (room) view>';
    width: number = 10
    height: number = 10
    zoom: number = 1

    consumes: ResourceBlock = null
    produces: ResourceBlock = null
    productionTime: number = 500

    constructor(public origin: Vector = new Vector(0, 0)) { }

    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ Corridor ],
        [Orientation.Right]: [ Corridor ],
        [Orientation.Up]: [ Ladder ],
        [Orientation.Down]: [ Ladder ],
    }

    machines: (typeof Machine)[] = []
}

export class MissionControl extends Structure {
    name: string = 'Mission Control';
    description: string = 'Keeping everything on track';
    view: string = 'MissionControlView';
    width: number = major.third
    height: number = minor.third
    zoom = 0.1
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ SurfaceRoad ],
        [Orientation.Right]: [ SurfaceRoad ],
        [Orientation.Up]: [ MainTunnel ],
        [Orientation.Down]: [ MainTunnel ],
    }

    machines = [ CommandCenter ]
}

export class MainTunnel extends Structure {
    name: string = 'Main Tunnel';
    description: string = 'Elevating';
    view: string = 'TunnelView';
    width: number = major.second
    height: number = major.eighth
    zoom = 0.25
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ Corridor ],
        [Orientation.Right]: [ Corridor ],
        [Orientation.Up]: [ MissionControl ],
        [Orientation.Down]: [ ],
    }
}

export class Dome extends Structure {
    name: string = 'Biodome';
    description: string = 'Biome sweet biome';
    produces = ResourceBlock.Food

    view: string = 'DomeView';
    width: number  = 2 * major.eighth
    height: number = 2 * major.fourth
    zoom = 0.2
    productionTime = 5000
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ SurfaceRoad ],
        [Orientation.Right]: [ SurfaceRoad ],
        [Orientation.Up]: [ ],
        [Orientation.Down]: [ ],
    }
    machines = [Orchard]
}

export class Corridor extends Structure {
    name: string = 'Corridor'
    description: string = 'in the hallway'
    view: string = 'CorridorView'
    width: number = minor.fifth
    height: number = minor.third
    zoom = 0.5
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [
            MainTunnel,
            Ladder,
            CloneMatrix, Kitchen, Laboratory, Study, CommonArea 
        ],
        [Orientation.Right]: [
            MainTunnel,
            Ladder,
            CloneMatrix, Kitchen, Laboratory, Study, CommonArea 
        ],
        [Orientation.Up]: [ ],
        [Orientation.Down]: [ ],
    }
}

export class CommonArea extends Structure {
    name: string = 'Commons'
    description: string = 'hallway cap'
    view: string = 'CommonAreaView'
    width: number = major.eighth
    height: number = major.fifth

    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ Corridor, CloneMatrix, Kitchen, Laboratory, Study, CommonArea ],
        [Orientation.Right]: [ Corridor, CloneMatrix, Kitchen, Laboratory, Study, CommonArea ],
        [Orientation.Up]: [ Ladder ],
        [Orientation.Down]: [ Ladder ],
    }
}

export class SurfaceRoad extends Structure {
    name: string = 'Road'
    description: string = 'go for a walk'
    view: string = 'SurfaceRoadView'
    width: number = minor.fifth
    height: number = minor.first
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ Arcology, Dome, MissionControl ],
        [Orientation.Right]: [ Arcology, Dome, MissionControl ],
        [Orientation.Up]: [ ],
        [Orientation.Down]: [ ],
    }
}

export class Laboratory extends CommonArea {
    name: string = 'Lab'
    description: string = 'learn some things'
    consumes = ResourceBlock.Hypothesis
    produces = ResourceBlock.Data
    view: string = 'LabView'
    width: number = major.sixth
    height: number = major.fifth
    productionTime = 6500
    machines = [ExperimentBench]
}


export class Kitchen extends CommonArea {
    name: string = 'Kitchen'
    description: string = 'veg -> meals'
    consumes = ResourceBlock.Food
    produces = ResourceBlock.Meal
    view: string = 'KitchenView'
    width: number = major.fourth
    height: number = major.fifth
    productionTime = 2000
    machines = [Stove]
}

// a mine is maybe a wide structure that you
// can gradually dig deeper??
export class Mine extends Structure {
    name: string = 'Mine'
    description: string = 'ore else'
    produces = ResourceBlock.Ore
    productionTime = 20000
    view: string = 'MineView'
    width: number = major.eighth // 20 * majorUnit
    height: number = 3 * major.sixth //20 * majorUnit
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ Mine, Refinery, Corridor ],
        [Orientation.Right]: [ Mine, Refinery, Corridor ],
        [Orientation.Up]: [ Ladder ],
        [Orientation.Down]: [ Ladder ],
    }
    machines = [MiningDrill]
}

export class Study extends CommonArea {
    name: string = 'Study'
    description: string = 'reflect'
    view: string = 'StudyView'
    width = major.third
    height = major.fifth
    produces = ResourceBlock.Hypothesis
    productionTime = 2000
    machines = [Bookshelf]
}

export class Refinery extends Structure {
    name = 'Refinery'
    description = 'flotate'
    consumes = ResourceBlock.Ore
    produces = ResourceBlock.Mineral
    view = 'RefineryView'
    width = major.fifth
    height = major.fifth
    productionTime = 9000
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ Mine, Refinery, Corridor ],
        [Orientation.Right]: [ Mine, Refinery, Corridor ],
        [Orientation.Up]: [ Ladder ],
        [Orientation.Down]: [ Ladder ],
    }
    machines = [MineralProcessor]
}

export class Ladder extends Structure {
    name = 'Ladder'
    description = 'connect vertically'
    view = 'LadderView'
    width = minor.third
    height = 100 + major.third
    zoom = 0.5
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Up]: [ CloneMatrix, Kitchen, Laboratory, Study, CommonArea ],
        [Orientation.Down]: [ CloneMatrix, Kitchen, Laboratory, Study, CommonArea ],
        [Orientation.Left]: [ ],
        [Orientation.Right]: [ ],
    }
}

export class Arcology extends Structure {
    name = 'Arcology'
    description = 'megalith'
    view = 'ArcologyView'
    width = 12 * major.fifth
    height = 34 * major.fifth
    zoom = 0.01
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ SurfaceRoad ],
        [Orientation.Right]: [ SurfaceRoad ],
        [Orientation.Up]: [ ],
        [Orientation.Down]: [ ],
    }
}

export class CloneMatrix extends CommonArea {
    name = 'Clone Matrix'
    description = 'you seem familiar'
    view = 'CloneMatrixView'
    width = major.fifth
    height = major.eighth
}

// huge octagonal generating station with four 'slots'
// for sub-structures (add-ons) which auto-generate data/ore
// for the central 'power' slot ...
// ...you can build either...
// ...a mini black hole or mini sun
// (the sun takes ore and the hole takes data?)
export class PowerPlant extends Structure {
    name: string = 'Power Plant'
    description: string = 'sunny day'
    view: string = 'PowerPlantView'
    width: number = 2 * major.eighth //30 * majorUnit
    height: number = 2 * major.eighth // 30 * majorUnit

    //connections: {[key in Orientation]: (typeof Structure)[] } = {
    //    [Orientation.Left]: [ Corridor ],
    //    [Orientation.Right]: [ Corridor ],
    //    [Orientation.Up]: [ Ladder ],
    //    [Orientation.Down]: [ Ladder ],
    //}
}
