import { ResourceBlock } from "./Economy";
import { Scale } from "../values/Scale";
import { Color } from "excalibur";
import { DeviceSize } from "../values/DeviceSize";


const bookshelfSvg = require('../images/bookshelf-plain.svg');
const vatSvg = require('../images/vat-plain.svg');
const benchSimple = require('../images/bench-simple-plain.svg');
const stove = require('../images/stove-plain.svg');
const cabin = require('../images/cabin-plain.svg');
const fire = require('../images/cooking-fire-plain.svg')
const bed = require('../images/bed-plain.svg')
const fridge = require('../images/fridge-plain.svg')
const server = require('../images/research-server-plain.svg')

const images = {
    bookshelf: bookshelfSvg,
    vat: vatSvg,
    bench: benchSimple,
    stove,
    cabin,
    fire,
    bed,
    fridge,
    server,
}

const { Red, Green, Blue, Orange, Violet, Yellow } = Color;

export enum MachineOperation {
    // generic functioning: consuming a block to produce a new block
    Work,
    // more interesting functions
    SpawnCitizen,
    CollectResource,
    CollectMeals,
    CollectData
}

export class Machine {
    name: string = '(machine name)'
    description: string = '(machine description)'
    color: Color = Color.LightGray

    size: DeviceSize = DeviceSize.Small

    consumes: ResourceBlock = null
    produces: ResourceBlock = null

    // need to stop using this both for work time and 'generation' time
    // productionTime: number = 500
    generationTime: number = 3000
    workTime: number = 10000
    capacity: number = 2

    behavior: MachineOperation = MachineOperation.Work

    image = images.vat

    prereqs: (typeof Machine)[] = []

}

export class CommandCenter extends Machine {
    name = 'Command'
    description = 'gather resources...'
    behavior = MachineOperation.CollectResource
    image = images.bench

    size = DeviceSize.Medium
}

// small
/// small surface

export class OxygenExtractor extends Machine {
    name = 'O2 Extractor'
    description = 'breathe deep'
    image = images.vat
    prereqs = [ WaterCondensingMachine, SolarCell ]
}

export class SolarCell extends Machine {
    name = 'Solar Cell'
    description = 'feel the warmth'
}

export class WaterCondensingMachine extends Machine {
    name = 'H20 Condenser'
    prereqs = [ SolarCell ]
}

/// small subsurface
export class StudyMachine extends Machine {
    consumes = ResourceBlock.Hypothesis
    produces = ResourceBlock.Data
}

export class Desk extends StudyMachine {
    name = 'Desk'
    image = images.bench
    prereqs = [ OxygenExtractor ]
    // color = Blue
}

export class Workstation extends StudyMachine {
    name = 'Workstation'
    prereqs = [ Bookshelf ]
    color = Blue
}



export class Bookshelf extends Machine {
    name = 'Shelf'
    description = 'brainstorm'
    produces = ResourceBlock.Hypothesis
    image = images.bookshelf
    prereqs = [ OxygenExtractor, Desk ]
    color = Blue
}


export class Fridge extends Machine {
    name = 'Fridge'
    description = 'store meals'
    behavior = MachineOperation.CollectMeals
    image = images.fridge
    prereqs = [Bookshelf]
    color = Yellow
}

export class Stove extends Machine {
    name = 'Stove'
    description = 'make a meal'
    consumes = ResourceBlock.Food
    produces = ResourceBlock.Meal
    image = images.stove

    prereqs = [Bookshelf, Fridge]
    color = Yellow
}

export class Bed extends Machine {
    name = 'Bed'
    image = images.bed
    prereqs = [ OxygenExtractor ]
    color = Orange
}
export class Houseplant extends Machine {
    name = 'House Plant'
    prereqs = [ Bed ]
    produces = ResourceBlock.Food
    capacity = 1
    color = Green
}

// medium


export class ResearchServer extends Machine {
    name = 'Research Server'
    description = 'hold data'
    produces = ResourceBlock.Hypothesis
    behavior = MachineOperation.CollectData
    image = images.server
    prereqs = [Bookshelf]
    size = DeviceSize.Medium
    color = Blue
}

export class Orchard extends Machine {
   name = 'Orchard'
   description = 'grow some food'
   produces = ResourceBlock.Food
   size = DeviceSize.Medium
   prereqs = [AlgaeVat]
   color = Green
}

export class Cabin extends Machine {
   name = 'Cabin'
   consumes = ResourceBlock.Food
   produces = ResourceBlock.Meal
   image = images.cabin
   prereqs = [Orchard]
   size = DeviceSize.Medium
   color = Orange
}

export class Arbor extends Machine {
    name = 'Arbor'
    produces = ResourceBlock.Food
    prereqs = [Orchard]
    size = DeviceSize.Medium
    color = Green
}

export class AlgaeVat extends Machine {
    name = 'Algae Vat'
    produces = ResourceBlock.Food
    prereqs = [ OxygenExtractor, Bookshelf, Fridge ]
    size = DeviceSize.Medium
    color = Violet
}

export class CloningVat extends Machine {
    name = 'Cloning Vat'
    description = 'grow some replacements'
    behavior = MachineOperation.SpawnCitizen 
    productionTime = 1500
    image = images.vat
    prereqs = [AlgaeVat]
    size = DeviceSize.Medium
    color = Violet
}

    
export class Fabricator extends Machine {
    name = 'Fabricator'
    consumes = ResourceBlock.Mineral
    produces = ResourceBlock.Alloy
    size = DeviceSize.Medium
    color = Red
    // ...
}

// large devices!

export class MiningDrill extends Machine {
    name = 'Mining Drill'
    size = DeviceSize.Large
    prereqs = [ Fabricator ]
//
}    

export class Megafabricator extends Machine {
    name = 'Mega-Fabricator'
    size = DeviceSize.Large
    prereqs = [ Fabricator ]
    color = Red
}

export class Preserve extends Machine {
    name = 'Preserve'
    size = DeviceSize.Large
    prereqs = [ Arbor ]
    color = Green
}

// providence (power, life support...)


// export class AirScrubber extends Machine {
//     name = 'Air Scrubber'
// }

// export class HypermnesisApparatus extends Machine {
//     name = 'Mind Upgrade'
// }

// export class AtomicCompiler extends Machine {
//     name = 'Atomic Compiler'
// }

// export class Icicle extends Machine {
//     name = 'Cryo Coffin'
// }

// export class TimeCrystal extends Machine {
//     name = 'Quantum Portal'
// }

// export class GamingRotunda extends Machine {
//     name = 'Gaming Rotunda'
// }

// export class MineralWorkshop extends Machine {
//     name = 'Workshop'
// }

// export class SingularityFountain extends Machine {
//     name = 'Singularity Fountain'
// }

// maybe library node 'stores' data?
//export class LibraryNode {
//    name = 'Library Node'
//
//    consumes = ResourceBlock.
//}