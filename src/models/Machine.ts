import { ResourceBlock } from "./Economy";
import { Scale } from "../values/Scale";
import { Color } from "excalibur";

let { major, minor } = Scale

const bookshelfSvg = require('../images/bookshelf-plain.svg');
const vatSvg = require('../images/vat-plain.svg');
const benchSimple = require('../images/bench-simple-plain.svg');
const stove = require('../images/stove-plain.svg');
const cabin = require('../images/cabin-plain.svg');
const fire = require('../images/cooking-fire-plain.svg')
const bed = require('../images/bed-plain.svg')

const images = {
    bookshelf: bookshelfSvg,
    vat: vatSvg,
    bench: benchSimple,
    stove,
    cabin,
    fire,
    bed
}

export enum MachineOperation {
  // generic functioning: consuming a block to produce a new block
  Work,

  // more interesting functions
  SpawnCitizen,
  CollectResource,

  // ...ProduceValue? [i.e., hope]
  // StoreResource ??
}

export class Machine {
    name: string = '(machine name)'
    description: string = '(machine description)'
    width: number = major.second
    height: number = major.second
    color: Color = Color.LightGray

    consumes: ResourceBlock = null
    produces: ResourceBlock = null

    // need to stop using this both for work time and 'generation' time
    productionTime: number = 500

    behavior: MachineOperation = MachineOperation.Work

    image = images.vat

    prereqs: (typeof Machine)[] = []

}

// resource collection
export class CommandCenter extends Machine {
    name = 'Command'
    description = 'gather resources'
    behavior = MachineOperation.CollectResource

    image = images.bench
}

// meals

//export class Orchard extends Machine {
//    name = 'Orchard'
//    description = 'grow some food'
//    produces = ResourceBlock.Food
//}

export class Stove extends Machine {
    name = 'Stove'
    description = 'make a meal'
    consumes = ResourceBlock.Food
    produces = ResourceBlock.Meal
    image = images.stove

    prereqs = [Bookshelf]
}

//export class CookingFire extends Machine {
//    name = 'Cooking Fire'
//    consumes = ResourceBlock.Food
//    produces = ResourceBlock.Meal
//    image = images.fire
//
//    prereqs = [OxygenExtractor]
//}
//export class Cabin extends Machine {
//    name = 'Cabin'
//    produces = ResourceBlock.Food
//
//    image = images.cabin
//    prereqs = [WaterCondensingMachine, OxygenExtractor]
//}

export class Desk extends Machine {
    name = 'Desk'
    consumes = ResourceBlock.Hypothesis
    produces = ResourceBlock.Data
    image = images.bench
    prereqs = [ OxygenExtractor ]
}


// minerals

// export class MiningDrill extends Machine {
//     name = 'Drill'
//     description = 'find some ores'
//     produces = ResourceBlock.Ore
// }

// export class MineralProcessor extends Machine {
//     name = 'Processor'
//     description = 'extract some minerals'

//     consumes = ResourceBlock.Ore
//     produces = ResourceBlock.Mineral
// }

// data

export class Bookshelf extends Machine {
    name = 'Shelf'
    description = 'brainstorm'
    produces = ResourceBlock.Hypothesis
    image = images.bookshelf
    prereqs = [ OxygenExtractor, Desk ]
}

//export class ExperimentBench extends Machine {
//    name = 'Bench'
//    description = 'test some hypotheses'
//    consumes = ResourceBlock.Hypothesis
//    produces = ResourceBlock.Data
//    image = images.bench
//}

export class AlgaeVat extends Machine {
    name = 'Algae Vat'
    produces = ResourceBlock.Food
    prereqs = [ OxygenExtractor ]
}

// reproduction

export class CloningVat extends Machine {
    name = 'Cloning Vat'
    description = 'grow some replacements'
    // consumes = ResourceBlock.Meal
    behavior = MachineOperation.SpawnCitizen 
    productionTime = 1500

    height = major.third
    // width = minor.fifth
    // height = major.first

    image = images.vat

    prereqs = [AlgaeVat]
}

// providence (power, life support...)

export class Bed extends Machine {
    name = 'Bed'
    image = images.bed
    prereqs = [ OxygenExtractor ]
}

export class OxygenExtractor extends Machine {
    name = 'O2 Extractor'
    description = 'breathe deep'
    // behavior
    // height = 
    image = images.vat
    prereqs = [ WaterCondensingMachine ]
}

// export class SolarCell extends Machine {
//     name = 'Solar Cell'
//     description = 'feel the warmth'
// }

// export class Launchpad extends Machine {
//     name = 'Launchpad'
// }

export class WaterCondensingMachine extends Machine {
    name = 'H20 Condenser'
}

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