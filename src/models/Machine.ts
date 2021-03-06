import { ResourceBlock, Economy, emptyMarket } from "./Economy";
import { Color, FontStyle, Resource } from "excalibur";
import { DeviceSize } from "../values/DeviceSize";
import { MechanicalOperation, mechanicalOperations } from "./MechanicalOperation";
import { shuffle, range, sample } from "../Util";
import { Device } from "../actors/Device";
import { doesNotReject } from "assert";

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

const couch = require('../images/couch-plain.svg')
const solar = require('../images/solar-collector-plain.svg')
const miner = require('../images/miner-plain.svg')

const statue = require('../images/statue-plain.svg')
const codex = require('../images/codex-plain.svg')

const lavaLamp = require('../images/lava-lamp-plain.svg')
const orrery = require('../images/orrery-plain.svg')
const telescope = require('../images/telescope-plain.svg')
const books = require('../images/books-plain.svg')

const greenhouse = require('../images/greenhouse-plain.svg')
const o2 = require('../images/oxygen-extractor-plain.svg')
const h20 = require('../images/water-condenser-plain.svg')

const minProcessor = require('../images/mineral-processor-plain.svg')

const laser = require('../images/laser-turret-plain.svg')

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

    couch,
    solar,
    miner,
    statue,

    codex,
    lavaLamp,
    orrery,
    telescope,
    books,
    greenhouse,

    o2,
    h20,

    minProcessor,
    laser,

}


const { Red, Green, Blue, Orange, Violet, Yellow } = Color;

let { store, generate, recipe, spawn, accelerateTime, explore } = mechanicalOperations

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

    isVehicle: boolean = false

    tinySlots: boolean = false
    isEatingSurface: boolean = false

    powerEffect: boolean = false

    defender: boolean = false

    concretize(): Machine { return this; } 

    onPlacement(device: Device) {
        // ...whatever we need to script here?
    }
}

export class CommandCenter extends Machine {
    name = 'Command Console'
    description = 'commander, we need your help'
    operation = store(
        [ResourceBlock.Mineral, ResourceBlock.Ore], //,ResourceBlock.Biomass],
        32
    )
    image = images.megaconsole
    size = DeviceSize.Medium
    economy = {
        ...emptyMarket(),
        Power: { supply: 10, demand: 0 },
        Oxygen: { supply: 20, demand: 0 },
        Water: { supply: 20, demand: 0 },
        Hope: { supply: 10, demand: 0 },
        Shelter: { supply: 20, demand: 0}
    }

    onPlacement(device: Device) {
        device.built = true
        for (let i in range(20)) {
            device.produceResource(ResourceBlock.Mineral)
        }
        let { building } = device

        building.populate(device.pos.add(building.pos), true)
        let initialPop = 2
        for (let times in range(initialPop)) {
            building.populate(device.pos.add(building.pos), false)
        }
        // building.populate(device.pos.add(building.pos), false)
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

// tiny
export class LavaLamp extends Machine {
    name = 'Lava Lamp'
    description = 'mesmerizing'
    size = DeviceSize.Tiny
    prereqs = [ Table ]
    image  = images.lavaLamp
    economy = {
        ...emptyMarket(),
        Joy: { supply: 1, demand: 0 },
        Power: { supply: 0, demand: 0.1 },
    }
}

export class Figurine extends Machine {
    name = 'Figurine'
    description = 'not an action figure'
    size = DeviceSize.Tiny
    prereqs = [ Table ]
    image = images.statue   
    economy = {
        ...emptyMarket(),
        Beauty: { supply: 0.1, demand: 0 },
    }
}

export class Orrery extends Machine {
    name = 'Orrery'
    description = 'to the stars'
    size = DeviceSize.Tiny
    prereqs = [ Table ]
    image = images.orrery
    economy = {
        ...emptyMarket(),
        Wonder: { supply: 0.1, demand: 0 },
    }
}

export class Books extends Machine {
    name = 'Books'
    description = 'all there in black and white'
    operation = generate(ResourceBlock.Idea, 2)
    size = DeviceSize.Tiny
    prereqs = [ Table ]
    image = images.books
    economy = {
        ...emptyMarket(),
        Wisdom: { supply: 0.1, demand: 0 },
    }
}

// small
/// small surface

export class OxygenExtractor extends Machine {
    name = 'O2 Extractor'
    description = 'breathe deep'
    image = images.o2
    prereqs = [ WaterCondensingMachine, SolarCell ]
    forDome = true
    economy = {
        ...emptyMarket(),
        Oxygen: { supply: 6, demand: 0 },
        Power: { supply: 0, demand: 1 },
    }
}

export class SolarCell extends Machine {
    name = 'Solar Cell'
    description = 'feel the warmth'
    image = images.solar
    prereqs = [ Bed ] 

    forDome = true
    economy = {
        ...emptyMarket(),
        Power: { supply: 10, demand: 0 },
    }
}


export class WaterCondensingMachine extends Machine {
    name = 'H2O Condenser'
    description = 'have a drink'
// setup a loop here so we have to get survival I?
    prereqs = [ SolarCell, OxygenExtractor ]
    image = images.h20

    forDome = true
    economy = {
        ...emptyMarket(),
        Water: { supply: 5, demand: 0 },
        Power: { supply: 0, demand: 1 },
    }
}

export class Telescope extends Machine {
    name = 'Telescope'
    description = 'look to the stars'
    prereqs = [ Orrery ]
    forDome = true
    image = images.telescope
    economy = {
        ...emptyMarket(),
        Wisdom: { supply: 1, demand: 0 },
    } 
}


// /// small subsurface

export class Table extends Machine {
    name = 'Table'
    description = 'a simple table'
    image = images.bench
    isEatingSurface = true
    // this device provides slots for tiny-sized deviecs
    tinySlots = true
}

export class Statue extends Machine {
    name = 'Statue'
    description = 'for honor'
    economy = {
        ...emptyMarket(),
        Hope: { supply: 0.1, demand: 0 },
        Beauty: { supply: 1, demand: 0 },
    }
    image = images.statue
    prereqs = [ Figurine ]
}

export class StudyMachine extends Machine {
    operation = recipe(
        [ ResourceBlock.Idea, ResourceBlock.Idea, ResourceBlock.Idea ],
        ResourceBlock.Data
    )
    color = Blue
    concretize(): Machine { return new Workstation() } //(sample([Workstation, Desk]))() }
}

// export class Desk extends StudyMachine {
//     name = 'Desk'
//     description = 'get to work'
//     image = images.bench
//     prereqs = [ OxygenExtractor ]
//     concretize() { return this }
// }

export class Codex extends Machine {
    name = 'Codex'
    description = 'read it closely'
    image = images.codex
    prereqs = [ Bookshelf ]
    operation = store([ResourceBlock.Data], 3)
    color = Blue
    // concretize() { return this }
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

export class Couch extends Machine {
    name = 'Couch'
    description = 'take it easy'
    prereqs = []
    image = images.couch
    economy = {
        ...emptyMarket(),
        Joy: { supply: 0.1, demand: 0 },
    }
}



export class Bookshelf extends Machine {
    name = 'Shelf'
    description = 'brainstorm'
    operation = generate(ResourceBlock.Idea)
    image = images.bookshelf
    prereqs = [ Books, Codex ] // setup a loop...
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
        Shelter: { supply: 1, demand: 0 },
    }
}

export class Houseplant extends Machine {
    name = 'House Plant'
    description = 'so nice'
    prereqs = [ Botany, Bed ]
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

    // onPlacement(device: Device) {
    //     device.building.planet
    // }
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

export class LifeSciencesConsole extends Machine {
    name = 'Life Sciences Console'
    description = 'mind and body together'
    operation = store([ResourceBlock.Biomass, ResourceBlock.Data], 5)
    prereqs = [Houseplant, Botany]
    color = Green
    image = images.consoleGreen
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 0.2 },
    }
}




//
// medium machines 
//

export class Laser extends Machine {
    name = 'Laser (Defender)'
    description = 'laser weapons system'
    color = Red
    size = DeviceSize.Medium
    image = images.laser
    defender = true
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 2 },
    }
}

export class Miner extends Machine {
    name = 'Miner (Rover)'
    description = 'mobile drill unit'

    // gather actually takes the machine/citizen around?
    operation = explore(ResourceBlock.Ore, 2)

    prereqs = [MineralProcessor, MiningDrill]
    color = Red
    size = DeviceSize.Medium
    isVehicle = true
    image = images.miner
}

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
    prereqs = [Bookshelf, Workstation]
    size = DeviceSize.Medium
    color = Blue
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 4 },
    }
}

export class Greenhouse extends Machine {
   name = 'Greenhouse'
   description = 'grow some food'
   operation = generate(ResourceBlock.Biomass)
   size = DeviceSize.Medium
   prereqs = [AlgaeVat]
   color = Green
    forDome = true
    image = images.greenhouse
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 1 },
        Water: { supply: 0, demand: 1 },
        Oxygen: { supply: 4, demand: 0 },
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


export class MineralProcessor extends Machine {
    name = 'Mineral Processor'
    description = 'wheat from the chaff'
    operation = recipe(
        [ResourceBlock.Ore, ResourceBlock.Ore, ResourceBlock.Ore],
         ResourceBlock.Mineral
    )
    size = DeviceSize.Medium
    color = Red
    image = images.minProcessor
    prereqs = [Workstation, Fabricator]
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 2 },
    }
}

export class ThinkingFountain extends Machine {
    name = 'Thinking Fountain'
    description = 'slowly growing'
    size = DeviceSize.Medium
    prereqs = [ Mainframe, Megafabricator, MolecularEngine ]
    color = Color.fromHex('daa520')
    operation = generate(ResourceBlock.Aurum, 8)
    cost = [ResourceBlock.Aurum]
    economy = {
        ...emptyMarket(),
        Wisdom: { supply: 2, demand: 0 },
        Wonder: { supply: 1, demand: 0 }
    }
}

export class SilverForest extends Machine {
    name = 'Silver Forest'
    description = 'immense serenity'
    size = DeviceSize.Medium
    prereqs = [ Megafabricator, Mainframe ]
    color = Color.fromHex('c0c0c0')
    operation = store([ResourceBlock.Argent], 12)
    cost = [ResourceBlock.Alloy, ResourceBlock.Algorithm]
    economy = {
        ...emptyMarket(),
        Beauty: { supply: 2, demand: 0 },
        Wonder: { supply: 1, demand: 0 }
    }
    forDome = true
}

export class TimeCrystal extends Machine {
    name = 'Time Crystal'
    description = 'xlr8'
    size = DeviceSize.Medium
    color = Color.fromHex('e5e4e2')
    operation = accelerateTime()
    cost = [ResourceBlock.Omnium]
    prereqs = [ Megafabricator, SilverForest ]
}

export class HoloProjector extends Machine {
    name = 'Holo Projector'
    description = 'whatever your heart desires'
    size = DeviceSize.Medium
    color = Blue
    operation = generate(ResourceBlock.Data, 3)
    cost = [ResourceBlock.Algorithm, ResourceBlock.Mineral]
    prereqs = [ Mainframe ]
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 2 },
        Joy: { supply: 3, demand: 0 },
    }
}

export class SacredGrove extends Machine {
    name = 'Sacred Grove'
    description = 'where the furies play'
    size = DeviceSize.Medium
    forDome = true
    cost = [ ResourceBlock.Omnium ]
    prereqs = [ AtomicCompiler ]
    economy = {
        ...emptyMarket(),
        Oxygen: { supply: 4, demand: 0 },
        Wonder: { supply: 1, demand: 0 },
    }
}

export class AtomicCompiler extends Machine {
    name = 'Atomic Compiler'
    description = 'super position'
    operation = recipe(
        [ ResourceBlock.Aurum, ResourceBlock.Argent ],
        ResourceBlock.Omnium
    )
    cost = [ ResourceBlock.Argent, ResourceBlock.Algorithm ]
    prereqs = [ ThinkingFountain, SilverForest ]
    economy = {
        ...emptyMarket(),
        Power: { supply: 0, demand: 3 },
    }
}

export class ExtropyFountain extends Machine {
    name = 'Extropy Fountain'
    description = 'absolute extension'
    // operation = 
    cost = [ ResourceBlock.Mineral ]
    prereqs = [ AtomicCompiler ]
    economy = {
        ...emptyMarket(),
        Power: { supply: Infinity, demand: 0 },
        Wonder: { supply: 1000, demand: 0 },
    }

    powerEffect = true
}


// large devices!

export class Orchard extends Machine {
   name = 'Orchard'
   description = 'grow some food'
   operation = generate(ResourceBlock.Biomass, 10)
   size = DeviceSize.Large
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


export class MiningDrill extends Machine {
    name = 'Mining Drill'
    description = 'ore away'
    operation = generate(ResourceBlock.Ore)
    size = DeviceSize.Large
    prereqs = [ Fabricator ]
    image = images.miner
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
    name = 'Nature Preserve'
    size = DeviceSize.Large
    prereqs = [ Arbor ]
    color = Green
    forDome = true
    operation = generate(ResourceBlock.Biomass, 12)
    economy = {
        ...emptyMarket(),
        Water: { supply: 0, demand: 4 },
        Oxygen: { supply: 12, demand: 0 },
    }
}

export class LogicPool extends Machine {
    name = 'Logic Pool'
    size = DeviceSize.Large
    prereqs = [ MolecularEngine ]
    color = Color.fromHex('daa520')
    operation = store([ResourceBlock.Aurum], 12)
    cost = [ResourceBlock.Algorithm, ResourceBlock.Bioplasma]
    economy = {
        ...emptyMarket(),
        Wisdom: { supply: 2, demand: 0 },
        Wonder: { supply: 1, demand: 0 }
    }
}

export class Cathedral extends Machine {
    name = 'Cathedral'
    description = 'first ultrahumanist'
    size = DeviceSize.Large
    prereqs = [ SacredGrove ]
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

export const allMachines: (typeof Machine)[] = [
    AlgaeVat,
    Arbor,
    Bed,
    Bookshelf,
    Cabin,
    CloningVat,
    // Desk,
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

    MineralProcessor,
    PlasmaBank,
    DissolutionVat,
    MetalStorage,
    Mainframe,

    PersonnelRegistry,
    MolecularEngine,
    ThinkingFountain,
    SilverForest,

    OrientationConsole,
    LifeSciencesConsole,

    TimeCrystal,
    LogicPool,
    HoloProjector,
    Cathedral,
    SacredGrove,
    AtomicCompiler,

    Couch,
    Statue,
    Codex,

    Table,
    LavaLamp,

    Figurine,

    Miner,
    Orrery,
    Telescope,
    Books,

    ExtropyFountain,

    Laser,
]