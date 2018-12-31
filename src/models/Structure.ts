import { Color } from 'excalibur';
import { ResourceBlock } from './Economy';
import { Scale } from '../values/Scale';
import { Orientation } from '../values/Orientation';
import { Machine, Bookshelf, CommandCenter, CloningVat, OxygenExtractor, WaterCondensingMachine, Desk, AlgaeVat, Stove, Bed } from './Machine';
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
    prereqs = [MainTunnel]
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
    prereqs = [CommonArea]
}

// 'abstract' structure...

export class Dome extends Structure {
    name: string = 'Biodome';
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
        OxygenExtractor, WaterCondensingMachine,
        // Cabin, CookingFire
    ]
}

// two-slot...
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
        CloningVat,
        AlgaeVat,
        Stove,
        Bed,
        Desk,
        Bookshelf,
    ]

    prereqs = [
        Dome 
    ]
}

export class SmallRoom extends CommonArea {
    name = 'Small Room'
    // two small slots
}

export class MediumRoom extends CommonArea {
    name = 'Medium Room'
    prereqs = [ SmallRoom ]
    width = 4 * major.eighth
    height = 3 * major.fifth
    // two medium slots...
}

export class MidDome extends Dome {
    name = 'Mid Dome'
    width = 4 * major.eighth
    height = 3 * major.eighth
    prereqs = [ Dome, MediumRoom ]
}

//////

export class MissionControl extends Structure {
    name: string = 'Mission Control';
    description: string = 'Keeping everything on track';
    view: string = 'MissionControlView';
    width: number = 4 * major.third
    height: number = 4 * minor.third
    zoom = 0.1
    connections: { [key in Orientation]: (typeof Structure)[] } = {
        [Orientation.Left]: [ SurfaceRoad ],
        [Orientation.Right]: [ SurfaceRoad ],
        [Orientation.Up]: [ MainTunnel ],
        [Orientation.Down]: [ MainTunnel ],
    }

    machines = [ CommandCenter ]
}

//////



// export class Biodome extends Dome {
//     machines = [Orchard]
//     prereqs = [ Study, OxygenAccumulator ]
//     produces = ResourceBlock.Food
//     productionTime = 5000
// }
// 
// // let list = [ CloneMatrix ]
// 
// export class Corridor extends Structure {
//     name: string = 'Corridor'
//     description: string = 'in the hallway'
//     view: string = 'CorridorView'
//     width: number = minor.fifth
//     height: number = minor.third
//     zoom = 0.5
//     connections: { [key in Orientation]: (typeof Structure)[] } = {
//         [Orientation.Left]: [
//             MainTunnel,
//             Ladder,
//             CommonArea
//             // CloneMatrix, Kitchen, Laboratory, Study, CommonArea,
//             // Mine, Refinery,
//         ],
//         [Orientation.Right]: [
//             MainTunnel,
//             Ladder,
//             CommonArea
//             // CloneMatrix, Kitchen, Laboratory, Study, CommonArea ,
//             // Mine, Refinery,
//         ],
//         [Orientation.Up]: [ ],
//         [Orientation.Down]: [ ],
//     }
// }
// 
// class CommonArea extends Structure {
//     name: string = 'Commons'
//     description: string = 'hallway cap'
//     view: string = 'CommonAreaView'
//     width: number = major.eighth
//     height: number = major.fifth
// 
//     connections: { [key in Orientation]: (typeof Structure)[] } = {
//         [Orientation.Left]: [
//             Corridor, CommonArea
//             //  Corridor, CloneMatrix, Kitchen, Laboratory, Study, CommonArea
//             ],
//         [Orientation.Right]: [
//             Corridor,
//             CommonArea,
//             // CloneMatrix, Kitchen, Laboratory, Study, CommonArea ],
//         ],
//         [Orientation.Up]: [ Ladder ],
//         [Orientation.Down]: [ Ladder ],
//     }
// }
// 

// 
// export class Laboratory extends CommonArea {
//     name: string = 'Lab'
//     description: string = 'learn some things'
//     consumes = ResourceBlock.Hypothesis
//     produces = ResourceBlock.Data
//     dominantColor = Color.Blue
//     view: string = 'LabView'
//     width: number = major.sixth
//     height: number = major.fifth
//     productionTime = 6500
//     machines = [ExperimentBench]
//     prereqs = [ Kitchen, Study ]
// }
// 
// 
// export class Kitchen extends CommonArea {
//     name: string = 'Kitchen'
//     description: string = 'veg -> meals'
//     dominantColor = Color.Green
//     consumes = ResourceBlock.Food
//     produces = ResourceBlock.Meal
//     view: string = 'KitchenView'
//     width: number = major.fourth
//     height: number = major.fifth
//     productionTime = 2000
//     machines = [Stove]
// }
// 
// // a mine is maybe a wide structure that you
// // can gradually dig deeper??
// export class Mine extends CommonArea {
//     name: string = 'Mine'
//     description: string = 'ore else'
//     dominantColor = Color.Red
//     produces = ResourceBlock.Ore
//     productionTime = 20000
//     view: string = 'MineView'
//     width: number = major.eighth // 20 * majorUnit
//     height: number = 3 * major.sixth //20 * majorUnit
//     //connections: { [key in Orientation]: (typeof Structure)[] } = {
//     //    [Orientation.Left]: [ Mine, Refinery, Corridor ],
//     //    [Orientation.Right]: [ Mine, Refinery, Corridor ],
//     //    [Orientation.Up]: [ Ladder ],
//     //    [Orientation.Down]: [ Ladder ],
//     //}
//     machines = [MiningDrill]
//     prereqs = [SolarFarm, Library, WaterCondenser]
// }
// 
// export class Study extends CommonArea {
//     name: string = 'Study'
//     description: string = 'reflect'
//     dominantColor = Color.Blue
//     view: string = 'StudyView'
//     width = major.third
//     height = major.fifth
//     produces = ResourceBlock.Hypothesis
//     productionTime = 2000
//     machines = [Bookshelf]
// }
// 
// export class Refinery extends CommonArea {
//     name = 'Refinery'
//     description = 'flotate'
//     dominantColor = Color.Red
//     consumes = ResourceBlock.Ore
//     produces = ResourceBlock.Mineral
//     view = 'RefineryView'
//     width = major.fifth
//     height = major.fifth
//     productionTime = 9000
//     machines = [MineralProcessor]
//     prereqs = [Mine]
// }
// 

// 
// export class Arcology extends Structure {
//     name = 'Arcology'
//     description = 'megalith'
//     view = 'ArcologyView'
//     dominantColor = Color.Green
//     width = 12 * major.fifth
//     height = 34 * major.fifth
//     zoom = 0.01
//     connections: { [key in Orientation]: (typeof Structure)[] } = {
//         [Orientation.Left]: [ SurfaceRoad ],
//         [Orientation.Right]: [ SurfaceRoad ],
//         [Orientation.Up]: [ ],
//         [Orientation.Down]: [ ],
//     }
//     prereqs = [ Arbor, AugmentationChamber, CarbonDioxideScrubber ]
// }
// 
// export class CloneMatrix extends CommonArea {
//     name = 'Clone Matrix'
//     description = 'you seem familiar'
//     dominantColor = Color.Blue
//     view = 'CloneMatrixView'
//     width = major.fifth
//     height = major.eighth
//     machines = [ CloningVat ]
//     prereqs = [ Study ]
// }
// 
// export class OxygenAccumulator extends Dome {
//     name = 'O2'
//     description = 'breathe free'
//     // view = 'OxygenAccumulatorView'
//     machines = [ OxygenExtractor ]
//     prereqs = []
// }
// 
// export class WaterCondenser extends Dome {
//     name = 'H2O'
//     description = 'drink deeply'
//     machines = [ WaterCondensingMachine ]
//     prereqs = [OxygenAccumulator]
// }
// 
// export class CarbonDioxideScrubber extends Dome {
//     name = 'CO2 Scrub'
//     description = 'purified'
//     machines = [AirScrubber]
//     prereqs = [WaterCondenser]
// }
// 
// export class SolarFarm extends Dome {
//     name = 'Solar Farm'
//     description = 'feel the warmth on your face'
//     // view = 'SolarFarmView'
//     machines = [ SolarCell ]
//     prereqs = [Kitchen, OxygenAccumulator]
// }
// 
// export class AugmentationChamber extends CommonArea {
//     name = 'Augmentation'
//     description = 'upgrade your life'
//     dominantColor = Color.Blue
//     machines = [ HypermnesisApparatus ]
//     prereqs = [CloneMatrix, Factory]
// }
// 
// export class Academy extends CommonArea {
//     name = 'Academy'
//     description = 'teach the generations'
//     dominantColor = Color.Blue
//     machines = [Bookshelf]
//     prereqs = [Laboratory, Library, CloneMatrix]
// }
// 
// export class Library extends CommonArea {
//     name = 'Library'
//     description = 'study the past'
//     dominantColor = Color.Blue
//     machines = [Bookshelf]
//     prereqs = [Kitchen]
// }
// 
// // just an 'upgraded', larger dome with a place for a mid-size machine?
// export class Arbor extends Dome {
//     name = 'Arbor'
//     description = 'conserve the land'
//     machines = [Orchard]
//     prereqs = [Biodome, WaterCondenser, CloneMatrix]
//     width: number  = 6 * major.eighth
//     height: number = 3 * major.eighth
// }
// 
// export class ComputerCore extends CommonArea {
//     name = 'Computer Core'
//     description = 'compute the last digit of pi'
//     dominantColor = Color.Blue
//     machines = []
//     prereqs  = [Academy]
//     width  = 20 * major.fifth
//     height = 10 * major.fifth
// }
// 
// export class Factory extends CommonArea {
//     name = 'Factory'
//     decription = 'grit with it'
//     dominantColor = Color.Red
//     machines = [MineralWorkshop]
//     prereqs = [ Library ]
//     width = 3 * major.eighth
//     height = major.sixth
// }
// 
// export class PowerPlant extends CommonArea {
//     name: string = 'Power Plant'
//     description: string = 'sunny day'
//     dominantColor = Color.Red
//     view: string = 'PowerPlantView'
//     width: number = 2 * major.eighth
//     height: number = 2 * major.eighth
//     prereqs = [ CarbonDioxideScrubber, Factory ]
// }
// 
// export class Starport extends Dome {
//     name = 'Starport'
//     description = 'you are cleared for take-off'
//     dominantColor = Color.Violet
//     prereqs = [ Arcology, ComputerCore, PowerPlant ]
//     machines = [Launchpad]
// }
// 
// 
// export class EntertainmentCenter extends CommonArea {
//     name = 'Entertainment Complex'
//     description = 'let us have a good time'
//     dominantColor = Color.Violet
//     prereqs = [ Starport ] //, 
//     machines = [GamingRotunda]
// }
// 
// export class SuspendedAnimationTomb extends CommonArea {
//     name = 'Cryo Tomb'
//     description = 'pawns on ice'
//     dominantColor = Color.Violet
//     prereqs = [ Starport ]
//     machines = [ Icicle ]
// }
// 
// export class NegentropyPool extends CommonArea {
//     name = 'Negentropy Pool'
//     description = 'extropic singularity'
//     dominantColor = Color.Violet
//     prereqs = [ SuspendedAnimationTomb ]
//     machines = [ SingularityFountain ]
// }
// 
// export class StrangeMatterWorkshop extends CommonArea {
//     name = 'Strange Matter Workshop'
//     description = 'advanced tools'
//     dominantColor = Color.Violet
//     prereqs = [ NegentropyPool ]
//     machines = [ AtomicCompiler ]
// }
// 
// export class TimeChamber extends CommonArea {
//     name = 'Time Chamber'
//     description = 'welcome to the world of tomorrow'
//     dominantColor = Color.Violet
//     prereqs = [ StrangeMatterWorkshop ] //, 
//     machines = [ TimeCrystal ]
// }
// // export class AntimatterCapture extends CommonArea { }
// // export class MolecularEngine extends CommonArea { }
// // export class AtomicCompiler extends CommonArea { }