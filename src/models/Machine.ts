import { ResourceBlock, Economy, emptyMarket } from "./Economy";
import { Color, FontStyle, Resource } from "excalibur";
import { DeviceSize } from "../values/DeviceSize";
import { MechanicalOperation, mechanicalOperations } from "./MechanicalOperation";
import { shuffle } from "../Util";

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

let { store, generate, recipe, spawn } = mechanicalOperations

export class Machine {
    name: string = '(machine name)'
    description: string = '(machine description)'
    color: Color = Color.LightGray
    size: DeviceSize = DeviceSize.Small
    operation: MechanicalOperation = { type: 'noop' }
    image = images.vat
    prereqs: (typeof Machine)[] = []
    economy: Economy = emptyMarket()
    forDome: boolean = false

    concretize(): Machine { return this; } //return shuffle(allMachines)[0] }
    // concretions: Machine[] = []
}

export class CommandCenter extends Machine {
    name = 'Command Console'
    description = 'gather resources...'
    operation = store(
        [ResourceBlock.Data, ResourceBlock.Ore],
        // ResourceBlock.Meal,
        // ResourceBlock.Mineral
    )
    image = images.bench
    size = DeviceSize.Medium
    economy = {
        ...emptyMarket(),
        Power: { supply: 1, demand: 0 },
        Oxygen: { supply: 1, demand: 0 },
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
        Oxygen: { supply: 3, demand: 0 },
        Power: { supply: 0, demand: 1 },
    }
}

export class SolarCell extends Machine {
    name = 'Solar Cell'
    description = 'feel the warmth'

    forDome = true
    economy = {
        ...emptyMarket(),
        Power: { supply: 5, demand: 0 },
    }
}


export class WaterCondensingMachine extends Machine {
    name = 'H20 Condenser'
    description = 'have a drink'
    prereqs = [ SolarCell ]

    forDome = true
    economy = {
        ...emptyMarket(),
        Water: { supply: 4, demand: 0 },
        Power: { supply: 0, demand: 1 },
    }
}

/// small subsurface
export class StudyMachine extends Machine {
    operation = recipe(
        [ ResourceBlock.Idea, ResourceBlock.Idea, ResourceBlock.Idea ],
        ResourceBlock.Data
    )
    // concretions: Machine[] = [Workstation, Desk]

    concretize(): Machine { return new (shuffle([Workstation, Desk])[0])() }
}

export class Desk extends StudyMachine {
    name = 'Desk'
    description = 'get to work'
    image = images.bench
    prereqs = [ OxygenExtractor ]

    // color = Blue
    concretize() { return this }
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

    concretize() { return this }
}



export class Bookshelf extends Machine {
    name = 'Shelf'
    description = 'brainstorm'
    operation = generate(ResourceBlock.Idea)
    image = images.bookshelf
    prereqs = [ OxygenExtractor, Desk ]
    color = Blue
}


export class Fridge extends Machine {
    name = 'Fridge'
    description = 'store meals'
    operation = store([ResourceBlock.Meal], 6)
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
    operation = recipe(
        [ResourceBlock.Biomass, ResourceBlock.Biomass],
        ResourceBlock.Meal
    )
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
    // produces = ResourceBlock.Food
    operation = generate(ResourceBlock.Biomass)
    capacity = 1
    color = Green
    image = images.plant
    economy = {
        ...emptyMarket(),
        Oxygen: { supply: 1, demand: 0 },
        Water: { supply: 0, demand: 0.1 },
    }
}

// medium


export class ResearchServer extends Machine {
    name = 'Research Server'
    description = 'hold data'
    operation = store([ResourceBlock.Data], 10)
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
   operation = generate(ResourceBlock.Biomass)
   size = DeviceSize.Medium
   prereqs = [AlgaeVat]
   color = Green
    forDome = true
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 1 },
        Water: { supply: 0, demand: 1 },
        Oxygen: { supply: 2, demand: 0 },
    }
}

export class Cabin extends Machine {
   name = 'Cabin'
   description = 'home on the plains'
   operation = recipe(
       [ ResourceBlock.Biomass, ResourceBlock.Biomass ],
       ResourceBlock.Meal
   )
   image = images.cabin
   prereqs = [Orchard]
   size = DeviceSize.Medium
   color = Orange
    forDome = true
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 1 },
        Water: { supply: 0, demand: 1 },
        Shelter: { supply: 4, demand: 0 },
    }
}

export class Arbor extends Machine {
    name = 'Arbor'
    description = 'arbor around the clock'
    operation = generate(ResourceBlock.Biomass)
    prereqs = [Orchard]
    size = DeviceSize.Medium
    color = Green
    forDome = true
}

export class AlgaeVat extends Machine {
    name = 'Algae Vat'
    description = 'where there is a will'
    operation = generate(ResourceBlock.Biomass)
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
    operation = generate(ResourceBlock.Biomass)
    prereqs = [ OxygenExtractor, Bookshelf ]
    size = DeviceSize.Medium
    color = Green
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 1 },
    }
}

export class CloningVat extends Machine {
    name = 'Cloning Vat'
    description = 'we all grow'
    // behavior = MachineOperation.SpawnCitizen 
    operation = spawn()
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

export class DissolutionVat extends Machine {
    name = 'Dissolution Vat'
    description = 'back to basics'
    // behavior = MachineOperation.SpawnCitizen 
    operation = recipe(
        [ ResourceBlock.Biomass, ResourceBlock.Biomass ],
        ResourceBlock.Bioplasma
    )
    productionTime = 1500
    image = images.vat
    prereqs = [PlasmaBank]
    size = DeviceSize.Medium
    color = Violet
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 1 },
    }
}

export class PlasmaBank extends Machine {
    name = 'Bioplasm Bank'
    description = 'hold on'
    operation = store([ ResourceBlock.Bioplasma ])
    prereqs = [AlgaeVat]
    color = Green
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 1 },
    }
}

    
export class Fabricator extends Machine {
    name = 'Fabricator'
    description = 'you made that'
    operation = recipe(
        [ResourceBlock.Mineral, ResourceBlock.Mineral],
         ResourceBlock.Alloy
    )
    size = DeviceSize.Medium
    color = Red
    prereqs = [Workstation]
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 3 },
    }
}

export class OreRefinery extends Machine {
    name = 'Refinery'
    description = 'wheat from the chaff'
    operation = recipe(
        [ResourceBlock.Ore, ResourceBlock.Ore, ResourceBlock.Ore],
         ResourceBlock.Mineral
    )
    size = DeviceSize.Medium
    color = Red
    prereqs = [Workstation, Fabricator]
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 2 },
    }
}



// large devices!

export class MiningDrill extends Machine {
    name = 'Mining Drill'
    description = 'ore away'
    operation = generate(ResourceBlock.Ore)
    size = DeviceSize.Large
    prereqs = [ Fabricator ]
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 5 },
    }
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

    OreRefinery,
    PlasmaBank,
    DissolutionVat,
]