import { Color } from 'excalibur';
import { ResourceBlock } from './Economy';
import { Scale } from '../values/Scale';
import { Orientation } from '../values/Orientation';
import { Machine, Bookshelf, CommandCenter, CloningVat, OxygenExtractor, WaterCondensingMachine, Desk, AlgaeVat, Stove, Bed, Fridge, ResearchServer, Orchard, Cabin, SolarCell, Arbor, Megafabricator, MiningDrill, Preserve, Workstation, Houseplant, Fabricator } from './Machine';
import { SpaceFunction } from './SpaceFunction';

const { major, minor } = Scale

export class Structure {
    name: string = '(structure name)';
    description: string = '(structure description)';
    view: string = '<structure (room) view>';
    width: number = 10
    height: number = 10
    zoom: number = 1
    dominantColor: Color = Color.Gray

    consumes: ResourceBlock = null
    produces: ResourceBlock = null
    productionTime: number = 500

    // constructor(public origin: Vector = new Vector(0, 0)) { }

    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ Corridor ],
        [Orientation.Right]: [ Corridor ],
        [Orientation.Up]: [ Ladder ],
        [Orientation.Down]: [ Ladder ],
    }

    machines: (typeof Machine)[] = []

    prereqs: (typeof Structure)[] = []

    // slotSize
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


export class SurfaceRoad extends Structure {
    name: string = 'Road'
    description: string = 'go for a walk'
    view: string = 'SurfaceRoadView'
    width: number = minor.fifth
    height: number = minor.first
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ Dome, MissionControl ],
        [Orientation.Right]: [  Dome, MissionControl ],
        [Orientation.Up]: [ ],
        [Orientation.Down]: [ ],
    }
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
            CommonArea
        ],
        [Orientation.Right]: [
            MainTunnel,
            CommonArea
        ],
        [Orientation.Up]: [ ],
        [Orientation.Down]: [ ],
    }
    prereqs = [SurfaceRoad] //MainTunnel]
}

export class Ladder extends Structure {
    name = 'Ladder'
    description = 'connect vertically'
    view = 'LadderView'
    width = minor.third
    height = 100 + major.third
    zoom = 0.5
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Up]: [ CommonArea ],
        [Orientation.Down]: [ CommonArea ],
        [Orientation.Left]: [ ],
        [Orientation.Right]: [ ],
    }
    prereqs = [Corridor, SmallRoomThree]
}

// 'abstract' structure...

class Dome extends Structure {
    // name: string = 'Biodome';
    description: string = 'Biome sweet biome';
    // dominantColor = Color.Green

    view: string = 'DomeView';
    width: number  = 2 * major.eighth
    height: number = major.eighth
    zoom = 0.2
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ SurfaceRoad ],
        [Orientation.Right]: [ SurfaceRoad ],
        [Orientation.Up]: [ ],
        [Orientation.Down]: [ ],
    }

    machines = [
        SolarCell,
        OxygenExtractor, WaterCondensingMachine,
        // Cabin, CookingFire
    ]
}

// common subsurface room...
class CommonArea extends Structure {
    name: string = 'Commons'
    description: string = 'hallway cap'
    view: string = 'CommonAreaView'
    width: number = major.eighth
    height: number = major.fifth

    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [
            Corridor, CommonArea
            ],
        [Orientation.Right]: [
            Corridor,
            CommonArea,
        ],
        [Orientation.Up]: [ Ladder ],
        [Orientation.Down]: [ Ladder ],
    }

    machines = [
        Stove,
        Bed,
        Desk,
        Bookshelf,
        Fridge,
        Workstation,
        Houseplant,
    ]

    prereqs = [
        // Dome 
    ]
}

export class SmallRoomTwo extends CommonArea {
    name = 'Small Room (2)'
    width = major.eighth
    prereqs = [ SmallDome ]
    // two small slots
}

export class SmallRoomThree extends CommonArea {
    name = 'Small Room (3)'
    prereqs = [SmallRoomTwo]
    view = 'SmallRoomThreeView'
    width = 2 * major.eighth
}

export class MediumRoom extends CommonArea {
    name = 'Medium Room'
    prereqs = [ SmallRoomThree ]
    view: string = 'MediumRoomView'
    width = 3 * major.eighth
    height = 2 * major.third
    // two medium slots...
    machines = [
        ResearchServer,
        AlgaeVat,
        CloningVat,
        Fabricator,
    ]
}

export class LargeRoom extends CommonArea {
    name = 'Large Room'
    view = 'LargeRoomView'
    prereqs = [ MediumRoom ]
    width = 6 * major.eighth
    height = 4 * major.fifth

    // two big slots?
    machines = [
        MiningDrill,
        Megafabricator,
        Preserve,
    ]
}

/// surface bldgs

export class SmallDome extends Dome {
    name = 'Small Dome'
    width = 3 * major.eighth
    height = 2 * major.eighth
}

export class MidDome extends Dome {
    name = 'Mid Dome'
    view = 'MidDomeView'
    width = 4 * major.eighth
    height = 3 * major.eighth
    prereqs = [ SmallDome, MediumRoom ]
    machines = [
        Cabin,
        Orchard,
        Arbor,
        // Campfir
    ]
}

//////

export class MissionControl extends Structure {
    name: string = 'Mission Control';
    description: string = 'Keeping everything on track';
    view: string = 'MissionControlView';
    width: number = 6 * major.eighth
    height: number = 1 * major.sixth
    zoom = 0.1
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ SurfaceRoad ],
        [Orientation.Right]: [ SurfaceRoad ],
        [Orientation.Up]: [ MainTunnel ],
        [Orientation.Down]: [ MainTunnel ],
    }

    machines = [ CommandCenter ]
}
