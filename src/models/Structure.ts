import { Color } from 'excalibur';
import { ResourceBlock } from './Economy';
import { Scale } from '../values/Scale';
import { Orientation } from '../values/Orientation';
import { Machine, Bookshelf, CommandCenter, CloningVat, OxygenExtractor, WaterCondensingMachine, Desk, AlgaeVat, Stove, Bed, Fridge, ResearchServer, Orchard, Cabin, SolarCell, Arbor, Megafabricator, MiningDrill, Preserve, Workstation, Houseplant, Fabricator, LogicCrystal, Microcity, allMachines } from './Machine';
import { SpaceFunction } from './SpaceFunction';
import { DeviceSize } from '../values/DeviceSize';

const { major, minor } = Scale

const smallMachines = allMachines.filter(machine => (new machine()).size === DeviceSize.Small)
const mediumMachines = allMachines.filter(machine => (new machine()).size === DeviceSize.Medium)
const largeMachines = allMachines.filter(machine => (new machine()).size === DeviceSize.Large)
const hugeMachines = allMachines.filter(machine => (new machine()).size === DeviceSize.Huge)

const smallDome = smallMachines.filter(machine => (new machine()).forDome)
const smallBelow = smallMachines.filter(machine => !(new machine()).forDome)

const midDome = mediumMachines.filter(machine => (new machine()).forDome)
const midBelow = mediumMachines.filter(machine => !(new machine()).forDome)

const largeDome = largeMachines.filter(machine => (new machine()).forDome)
const largeBelow = largeMachines.filter(machine => !(new machine()).forDome)

const hugeDome = hugeMachines.filter(machine => (new machine()).forDome)
const hugeBelow = hugeMachines.filter(machine => !(new machine()).forDome)

export class Structure {
    name: string = '(structure name)';
    description: string = '(structure description)';
    view: string = '<structure (room) view>';
    width: number = 10
    height: number = 10
    zoom: number = 1
    color: Color = Color.Gray
    infra: boolean = false

    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ Corridor ],
        [Orientation.Right]: [ Corridor ],
        [Orientation.Up]: [ Ladder ],
        [Orientation.Down]: [ Ladder ],
    }

    machines: (typeof Machine)[] = []
    prereqs: (typeof Structure)[] = []


    hide: boolean = false
}


export class MainTunnel extends Structure {
    name: string = 'Main Tunnel';
    description: string = 'Elevating';
    view: string = 'TunnelView';
    width: number = major.fifth
    height: number = major.eighth
    zoom = 0.25
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ Corridor ],
        [Orientation.Right]: [ Corridor ],
        [Orientation.Up]: [ MediumSurfaceRoom ],
        [Orientation.Down]: [ ],
    }
    infra = true
}


export class SurfaceRoad extends Structure {
    name: string = 'Road'
    description: string = 'go for a walk'
    view: string = 'SurfaceRoadView'
    width: number = minor.fifth
    height: number = minor.first
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ Dome, MediumSurfaceRoom ],
        [Orientation.Right]: [  Dome, MediumSurfaceRoom ],
        [Orientation.Up]: [ ],
        [Orientation.Down]: [ ],
    }
    infra = true
}

export class Corridor extends Structure {
    name: string = 'Corridor'
    description: string = 'in the hallway'
    view: string = 'CorridorView'
    width: number = minor.fifth
    height: number = minor.seventh
    zoom = 0.5
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [
            MainTunnel,
            CommonArea,
            Ladder,
        ],
        [Orientation.Right]: [
            MainTunnel,
            CommonArea,
            Ladder,
        ],
        [Orientation.Up]: [ ],
        [Orientation.Down]: [ ],
    }
    prereqs = [SurfaceRoad] //MainTunnel]
    infra = true
}

export class Ladder extends Structure {
    name = 'Ladder'
    description = 'connect vertically'
    view = 'LadderView'
    width = minor.sixth
    height = 20 + major.third
    zoom = 0.5
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Up]: [ CommonArea ],
        [Orientation.Down]: [ CommonArea ],
        [Orientation.Left]: [ ],
        [Orientation.Right]: [ ],
    }
    prereqs = [Corridor, SmallRoomThree]
    infra = true
}

// 'abstract' structure...

class Dome extends Structure {
    description: string = 'Biome sweet biome';

    view: string = 'DomeView';
    width: number  = 2 * major.sixth
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

    machines = []

    prereqs = [
    ]
}

export class SmallRoomTwo extends CommonArea {
    name = 'Sm. Room (2)'
    width = major.eighth
    height = major.fifth
    prereqs = [ SmallDome ]
    machines = smallBelow
}

export class SmallRoomThree extends CommonArea {
    name = 'Sm. Room (3)'
    prereqs = [SmallRoomTwo]
    view = 'SmallRoomThreeView'
    width = 2 * major.eighth
    height = major.eighth
    machines = smallBelow
}

export class MediumRoom extends CommonArea {
    name = 'Mid Room'
    prereqs = [ SmallRoomThree ]
    view = 'MediumRoomView'
    width = 2 * major.eighth
    machines = midBelow
}

export class MediumRoomThree extends CommonArea {
    name = 'Mid Room (3)'
    prereqs = [ MediumRoom ]
    view = 'MediumRoomThreeView'
    width = 3 * major.eighth
    height = major.eighth

    machines = midBelow
}

export class LargeRoom extends CommonArea {
    name = 'Lg. Room'
    view = 'LargeRoomView'
    prereqs = [ MediumRoom ]
    width = 4 * major.eighth
    height = 2*major.eighth
    machines = largeBelow
}

export class HugeRoom extends CommonArea {
    name = 'Huge Room'
    view = 'HugeRoomView'
    width = 10 * major.eighth
    height = 8 * major.eighth

    prereqs = [LargeRoom]
    machines = hugeBelow
}

/// surface bldgs

export class MediumSurfaceRoom extends Dome {
    name = 'Mid Surf Bldg'
    description = 'home away from home';

    view: string = 'MediumSurfaceRoomView';

    width: number = 4 * major.eighth
    height: number = major.fifth

    zoom = 0.1

    prereqs = [ SmallDome ]

    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ SurfaceRoad ],
        [Orientation.Right]: [ SurfaceRoad ],
        [Orientation.Up]: [ MainTunnel, MediumSurfaceRoom ],
        [Orientation.Down]: [ MainTunnel, MediumSurfaceRoom ],
    }

    machines = midBelow

    hide = false // need another one which cares about connecting to roads...
}

export class SmallDome extends Dome {
    name = 'Sm. Dome'
    width = major.eighth
    height = major.fourth
    machines = smallDome
}

export class SmallDomeThree extends Dome {
    name = 'Sm. Dome (3)'
    view = 'SmallDomeThreeView'
    width = 3 * major.fifth
    height = 2*major.fifth
    machines = smallDome
}

export class MidDome extends Dome {
    name = 'Mid Dome'
    view = 'MidDomeView'
    width = 3 * major.seventh
    height = 2 * major.seventh
    prereqs = [ SmallDome, MediumRoom ]
    machines = midDome
}

export class LargeDome extends Dome {
    name = 'Lg. Dome'
    view = 'BigDomeView'
    width = 4 * major.eighth
    height = 3 * major.eighth
    prereqs = [MidDome, LargeRoom]
    machines = largeDome
}

export class Arcology extends Dome {
    name = 'Arcology'
    view = 'ArcologyView'
    width = 12 * major.eighth
    height = 36 * major.eighth
    prereqs = [LargeDome, HugeRoom]
    machines = hugeDome

}

//////

// export class MissionControl extends Structure {
//     name: string = 'Mission Control';
//     description: string = 'Keeping everything on track';
//     view: string = 'MissionControlView';
//     width: number = 6 * major.eighth
//     height: number = 1 * major.sixth
//     zoom = 0.1
//     connections: { [key in Orientation]: (typeof Structure)[] } = {
//         [Orientation.Left]: [ SurfaceRoad ],
//         [Orientation.Right]: [ SurfaceRoad ],
//         [Orientation.Up]: [ MainTunnel ],
//         [Orientation.Down]: [ MainTunnel ],
//     }

//     machines = [ CommandCenter ]
// }

export const allStructures =
    [
        SmallDome,
        SmallDomeThree,
        MidDome,
        LargeDome,
        Arcology,
        MediumSurfaceRoom,

        SmallRoomTwo,
        SmallRoomThree,
        MediumRoom,
        MediumRoomThree,
        LargeRoom,
        HugeRoom,
    ]


