import { ResourceBlock } from "./Economy";
import { Scale } from "../values/Scale";
import { Color } from "excalibur";

const bookshelfSvg = require('../images/bookshelf-plain.svg');

const images = {
    bookshelf: bookshelfSvg,
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
    width: number = Scale.minor.third
    height: number = Scale.minor.fourth
    color: Color = Color.LightGray

    consumes: ResourceBlock = null
    produces: ResourceBlock = null
    productionTime: number = 1000

    behavior: MachineOperation = MachineOperation.Work

    image = images.bookshelf


}

// resource collection
export class CommandCenter extends Machine {
    name = 'Command'
    description = 'gather resources'
    behavior = MachineOperation.CollectResource
}

// meals

export class Orchard extends Machine {
    name = 'Orchard'
    description = 'grow some food'
    produces = ResourceBlock.Food
}

export class Stove extends Machine {
    name = 'Stove'
    description = 'make a meal'
    consumes = ResourceBlock.Food
    produces = ResourceBlock.Meal
}

// minerals

export class MiningDrill extends Machine {
    name = 'Drill'
    description = 'find some ores'
    produces = ResourceBlock.Ore
}

export class MineralProcessor extends Machine {
    name = 'Processor'
    description = 'extract some minerals'

    consumes = ResourceBlock.Ore
    produces = ResourceBlock.Mineral
}

// data

export class Bookshelf extends Machine {
    name = 'Shelf'
    description = 'brainstorm'
    produces = ResourceBlock.Hypothesis
}

export class ExperimentBench extends Machine {
    name = 'Bench'
    description = 'test some hypotheses'
    consumes = ResourceBlock.Hypothesis
    produces = ResourceBlock.Data
}

// reproduction

export class CloningVat extends Machine {
    name = 'Cloning Vat'
    description = 'grow some replacements'
    // consumes = ResourceBlock.Meal
    behavior = MachineOperation.SpawnCitizen 
    productionTime = 1500
}

// maybe library node 'stores' data?
//export class LibraryNode {
//    name = 'Library Node'
//
//    consumes = ResourceBlock.
//}