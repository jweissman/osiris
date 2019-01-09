import { ResourceBlock, Economy, emptyMarket } from "./Economy";
import { Color, FontStyle, Resource } from "excalibur";
import { DeviceSize } from "../values/DeviceSize";
import { MechanicalOperation, mechanicalOperations } from "./MechanicalOperation";
import { shuffle, range } from "../Util";
import { Device } from "../actors/Device";

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

const console = require('../images/console-plain.svg')
const consolePurple = require('../images/console-purple-plain.svg')
const consoleGreen = require('../images/console-green-plain.svg')
const consoleRed = require('../images/console-red-plain.svg')
const megaconsole = require('../images/mega-console-plain.svg')

const fabricator = require('../images/fabricator-plain.svg')

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

    console,
    consolePurple,
    consoleGreen,
    consoleRed,
    megaconsole,

    fabricator,
}


const { Red, Green, Blue, Orange, Violet, Yellow } = Color;

let { store, generate, recipe, spawn, accelerateTime } = mechanicalOperations

export class Machine {
    name: string = '(machine name)'
    description: string = '(machine description)'
    color: Color = Color.LightGray

    cost: ResourceBlock[] = [ResourceBlock.Mineral]

    size: DeviceSize = DeviceSize.Small
    operation: MechanicalOperation = { type: 'noop' }
    image = images.vat
    prereqs: (typeof Machine)[] = []
    economy: Economy = emptyMarket()
    forDome: boolean = false
    hide: boolean = false

    capacity: boolean


    concretize(): Machine { return this; } 

    onPlacement(device: Device) {
        // ...whatever we need to script here?
    }
}

export class CommandCenter extends Machine {
    name = 'Command Console'
    description = 'commander, we need your help'
    operation = store(
        [ResourceBlock.Mineral], //,ResourceBlock.Biomass],
        16
    )
    image = images.consoleGreen
    size = DeviceSize.Medium
    economy = {
        ...emptyMarket(),
        Power: { supply: 5, demand: 0 },
        Oxygen: { supply: 2, demand: 0 },
        Water: { supply: 2, demand: 0 },
        Hope: { supply: 1, demand: 0 },
        Shelter: { supply: 1, demand: 0}
    }

    onPlacement(device: Device) {
        device.built = true
        for (let i in range(16)) {
            device.produceResource(ResourceBlock.Mineral)
        }
        let { building } = device
        building.populate(device.pos.add(building.pos), true)
    }
}

export class MissionLog extends Machine {
    name = 'Mission Log'
    description = 'gather data'
    operation = store(
        [ResourceBlock.Data],
        8
    )
    image = images.consolePurple
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 0.1 },
        Hope: { supply: 1, demand: 0 }
    }
}

//export class Energon extends Machine {
//    name = 'Energon'
//    description = 'food paste'
//}

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
    color = Blue
    concretize(): Machine { return new (shuffle([Workstation, Desk])[0])() }
}

export class Desk extends StudyMachine {
    name = 'Desk'
    description = 'get to work'
    image = images.bench
    prereqs = [ OxygenExtractor ]
    concretize() { return this }
}

export class Workstation extends StudyMachine {
    name = 'Workstation'
    description = 'hackety hack'
    prereqs = [ Bookshelf ]
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
    cost = [ ResourceBlock.Biomass ]
    operation = generate(ResourceBlock.Biomass, 1)
    color = Green
    image = images.plant
    economy = {
        ...emptyMarket(),
        Oxygen: { supply: 1, demand: 0 },
        Water: { supply: 0, demand: 0.1 },
    }
}

export class PersonnelRegistry extends Machine {
    name = 'Personnel Registry'
    description = 'track everybody'
    prereqs = [ CloningVat ]
    operation = store([ResourceBlock.Data], 4)
    color = Yellow
    image = images.console
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 0.1 },
        Wisdom: { supply: 1, demand: 0 },
    }
}

export class OrientationConsole extends Machine {
    name = 'Orientation Console'
    description = 'welcome to the colony'
    prereqs = [CloningVat]
    operation = generate(ResourceBlock.Data, 1)
    image = images.consoleRed
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 0.1 },
        Hope: { supply: 1, demand: 0 },
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
    size = DeviceSize.Small
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
    size = DeviceSize.Small
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
    size = DeviceSize.Small
    color = Red
    prereqs = [Workstation]
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 3 },
    }
    image = images.fabricator
}

export class AlgaeVat extends Machine {
    name = 'Algae Vat'
    description = 'where there is a will'
    operation = generate(ResourceBlock.Biomass)
    prereqs = [ OxygenExtractor, Bookshelf, Fridge ]
    size = DeviceSize.Small
    color = Violet
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 2 },
    }
}
// medium

export class MetalStorage extends Machine {
    name = 'Metal Storage'
    description = 'contain minerals and alloys?'
    operation = store([ResourceBlock.Mineral, ResourceBlock.Alloy], 8)
    prereqs = [Bookshelf]
    color = Red
    size = DeviceSize.Medium
}

export class ResearchServer extends Machine {
    name = 'Research Server'
    description = 'hold data'
    operation = store([ResourceBlock.Data, ResourceBlock.Algorithm], 10)
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

export class ThinkingFountain extends Machine {
    name = 'Thinking Fountain'
    size = DeviceSize.Medium
    prereqs = [ MolecularEngine ]
    color = Color.fromHex('daa520')
    operation = generate(ResourceBlock.Aurum, 8)
    cost = [ResourceBlock.Aurum]
    economy = {
        ...emptyMarket(),
        Wisdom: { supply: 2, demand: 0 },
        Wonder: { supply: 1, demand: 0 }
    }
}

export class LogicPool extends Machine {
    name = 'Logic Pool'
    size = DeviceSize.Large
    prereqs = [ MolecularEngine ]
    color = Color.fromHex('daa520')
    operation = store([ResourceBlock.Algorithm, ResourceBlock.Aurum], 18)
    cost = [ResourceBlock.Aurum]
    economy = {
        ...emptyMarket(),
        Wisdom: { supply: 2, demand: 0 },
        Wonder: { supply: 1, demand: 0 }
    }
}

export class SilverForest extends Machine {
    name = 'Silver Forest'
    size = DeviceSize.Medium
    prereqs = [ Megafabricator ]
    color = Color.fromHex('c0c0c0')
    operation = store([ResourceBlock.Argent], 12)
    cost = [ResourceBlock.Argent]
    economy = {
        ...emptyMarket(),
        Beauty: { supply: 2, demand: 0 },
        Wonder: { supply: 1, demand: 0 }
    }
    forDome = true
}

export class TimeCrystal extends Machine {
    name = 'Time Crystal'
    size = DeviceSize.Medium
    color = Color.fromHex('e5e4e2')
    operation = accelerateTime()
    cost = [ResourceBlock.Omnium]
    prereqs = []
    // onPlacement(device: Device) {
        // device.building.planet.updateSpeeds()
    // }
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
    operation = recipe(
        [ResourceBlock.Alloy, ResourceBlock.Algorithm],
        ResourceBlock.Argent
    )
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 8 },
    }
}

export class MolecularEngine extends Machine {
    name = 'Molecular Engine'
    size = DeviceSize.Large
    prereqs = [ Megafabricator ]
    color = Violet
    operation = recipe(
        [ResourceBlock.Bioplasma, ResourceBlock.Algorithm],
        ResourceBlock.Aurum
    )
    image = images.megaconsole
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 3 },
        Water: { supply: 0, demand: 1 },
    }
}

export class Mainframe extends Machine {
    name = 'Mainframe'
    size = DeviceSize.Large
    color = Blue
    prereqs = [ResearchServer]
    cost = [ ResourceBlock.Mineral, ResourceBlock.Mineral ]
    operation = recipe(
        [ ResourceBlock.Data, ResourceBlock.Data ],
        ResourceBlock.Algorithm
    )
    image = images.server
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 6 },
    }
}

export class Preserve extends Machine {
    name = 'Preserve'
    size = DeviceSize.Large
    prereqs = [ Arbor ]
    color = Green
    forDome = true
    // operation = generate()
    economy = {
        ...emptyMarket(),
        Water: { supply: 0, demand: 4 },
        Oxygen: { supply: 12, demand: 0 },
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
    MetalStorage,
    Mainframe,

    PersonnelRegistry,
    MolecularEngine,
    ThinkingFountain,
    SilverForest,

    OrientationConsole,
    // TimeCrystal,

]