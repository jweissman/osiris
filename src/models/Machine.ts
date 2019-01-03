import { ResourceBlock, Economy, emptyMarket } from "./Economy";
import { Scale } from "../values/Scale";
import { Color, Resource } from "excalibur";
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
const plant = require('../images/houseplant-plain.svg')
const workstation = require('../images/workstation-plain.svg')

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
    plant,
    workstation,
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

class Recipe {
    behavior: MachineOperation = MachineOperation.Work

    generates: ResourceBlock = null
    stores: ResourceBlock = null

    consumes: ResourceBlock[] = null
    produces: ResourceBlock[] = null

    // need to stop using this both for work time and 'generation' time
    // productionTime: number = 500
    generationTime: number = 3000
    workTime: number = 10000

    capacity: number = 2
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

    economy: Economy = emptyMarket()

    forDome: boolean = false
}

export class CommandCenter extends Machine {
    name = 'Command Console'
    description = 'gather resources...'
    behavior = MachineOperation.CollectResource
    image = images.bench

    size = DeviceSize.Medium
    economy = {
        ...emptyMarket(),
        Power: { supply: 1, demand: 0 },
        Oxygen: { supply: 1, demand: 0 },
        // Shelter: { supply: 1, demand: 0 },
        Hope: { supply: 1, demand: 0 }
    }
}

// small
/// small surface

export class OxygenExtractor extends Machine {
    name = 'O2 Extractor'
    description = 'breathe deep'
    image = images.vat
    prereqs = [ WaterCondensingMachine, SolarCell ]

    forDome = true
    economy = {
        ...emptyMarket(),
        Oxygen: { supply: 1, demand: 0 },
        Power: { supply: 0, demand: 1 },
    }
}

export class SolarCell extends Machine {
    name = 'Solar Cell'
    description = 'feel the warmth'

    forDome = true
    economy = {
        ...emptyMarket(),
        Power: { supply: 2, demand: 0 },
    }
}


export class WaterCondensingMachine extends Machine {
    name = 'H20 Condenser'
    description = 'have a drink'
    prereqs = [ SolarCell ]

    forDome = true
    economy = {
        ...emptyMarket(),
        Water: { supply: 1, demand: 0 },
        Power: { supply: 0, demand: 1 },
    }
}

/// small subsurface
export class StudyMachine extends Machine {
    consumes = ResourceBlock.Hypothesis
    produces = ResourceBlock.Data
}

export class Desk extends StudyMachine {
    name = 'Desk'
    description = 'get to work'
    image = images.bench
    prereqs = [ OxygenExtractor ]

    // color = Blue
}

export class Workstation extends StudyMachine {
    name = 'Workstation'
    description = 'hackety hack'
    prereqs = [ Bookshelf ]
    color = Blue
    image = images.workstation
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 1 },
    }
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
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 1 },
    }
}

export class Stove extends Machine {
    name = 'Stove'
    description = 'make a meal'
    consumes = ResourceBlock.Food
    produces = ResourceBlock.Meal
    image = images.stove

    prereqs = [Bookshelf, Fridge]
    color = Yellow
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 1 },
    }
}

export class Bed extends Machine {
    name = 'Bed'
    description = 'sweet dreams'
    image = images.bed
    prereqs = [ OxygenExtractor ]
    color = Orange
    economy = {
        ...emptyMarket(),
        Shelter: { supply: 2, demand: 0 },
    }
}

export class Houseplant extends Machine {
    name = 'House Plant'
    description = 'so nice'
    prereqs = [ Bed ]
    produces = ResourceBlock.Food
    capacity = 1
    color = Green
    image = images.plant
    economy = {
        ...emptyMarket(),
        Oxygen: { supply: 0, demand: 1 },
    }
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
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 4 },
    }
}

export class Orchard extends Machine {
   name = 'Orchard'
   description = 'grow some food'
   produces = ResourceBlock.Food
   size = DeviceSize.Medium
   prereqs = [AlgaeVat]
   color = Green
    forDome = true
    economy = {
        ...emptyMarket(),
        Power: { supply: 2, demand: 0 },
    }
}

export class Cabin extends Machine {
   name = 'Cabin'
   description = 'home on the plains'
   consumes = ResourceBlock.Food
   produces = ResourceBlock.Meal
   image = images.cabin
   prereqs = [Orchard]
   size = DeviceSize.Medium
   color = Orange
    forDome = true
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 1 },
        Water: { supply: 0, demand: 1 },
        Shelter: { supply: 4, demand: 1 },
    }
}

export class Arbor extends Machine {
    name = 'Arbor'
    description = 'arbor around the clock'
    produces = ResourceBlock.Food
    prereqs = [Orchard]
    size = DeviceSize.Medium
    color = Green
    forDome = true
}

export class AlgaeVat extends Machine {
    name = 'Algae Vat'
    description = 'where there is a will'
    produces = ResourceBlock.Food
    prereqs = [ OxygenExtractor, Bookshelf, Fridge ]
    size = DeviceSize.Medium
    color = Violet
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 2 },
    }
}

export class Botany extends Machine {
    name = 'Botany'
    description = 'plant lab'
    produces = ResourceBlock.Food
    prereqs = [ OxygenExtractor, Bookshelf ]
    size = DeviceSize.Medium
    color = Green
}

export class CloningVat extends Machine {
    name = 'Cloning Vat'
    description = 'we all grow'
    behavior = MachineOperation.SpawnCitizen 
    productionTime = 1500
    image = images.vat
    prereqs = [AlgaeVat]
    size = DeviceSize.Medium
    color = Violet
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 2 },
    }
}

    
export class Fabricator extends Machine {
    name = 'Fabricator'
    description = 'you made that'
    consumes = ResourceBlock.Ore
    produces = ResourceBlock.Mineral
    size = DeviceSize.Medium
    color = Red
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 3 },
    }
    // ...
}

//export class HoloProjector extends Machine {
//    name = 'Holo Projector'
//    size = DeviceSize.Medium
//    color = Violet
//}

// large devices!

export class MiningDrill extends Machine {
    name = 'Mining Drill'
    description = 'ore away'
    size = DeviceSize.Large
    prereqs = [ Fabricator ]
    produces = ResourceBlock.Ore
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 5 },
    }
//
}    

export class Megafabricator extends Machine {
    name = 'Mega-Fabricator'
    size = DeviceSize.Large
    prereqs = [ Fabricator ]
    color = Red
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 8 },
    }
}

export class Preserve extends Machine {
    name = 'Preserve'
    size = DeviceSize.Large
    prereqs = [ Arbor ]
    color = Green
    forDome = true
    economy = {
        ...emptyMarket(),
        Water: { supply: 0, demand: 4 },
    }
}

/// huge devices

export class Microcity extends Machine {
    name = 'Microcity'
    size = DeviceSize.Huge
    prereqs = [ Megafabricator ]
    color = Orange
    forDome = true
    economy = {
        ...emptyMarket(),
        Water: { supply: 0, demand: 2 },
        Power: { supply: 0, demand: 2 },
        Joy: { supply: 5, demand: 0 },
        Hope: { supply: 5, demand: 0 },
        Beauty: { supply: 1, demand: 0 },
        Wonder: { supply: 1, demand: 0 },
    }
}

export class LogicCrystal extends Machine {
    name = 'Logic Crystal'
    size = DeviceSize.Huge
    prereqs = [ Megafabricator ]
    color = Blue
}

// export class MiniSun extends Machine {}

export const allMachines = [
    AlgaeVat,
    Arbor,
    Bed,
    Bookshelf,
    Cabin,
    CloningVat,
    Desk,
    Fabricator,
    Fridge,
    Houseplant,
    Megafabricator,
    MiningDrill,
    Orchard,
    OxygenExtractor,
    Preserve,
    ResearchServer,
    SolarCell,
    Stove,
    WaterCondensingMachine,
    Workstation,
    Microcity,
    LogicCrystal,
    Botany,
]