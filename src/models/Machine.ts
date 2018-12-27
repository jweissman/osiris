import { ResourceBlock } from "./Economy";
import { Scale } from "../values/Scale";
import { Color } from "excalibur";

export class Machine {
    name: string = '(machine name)'
    description: string = '(machine description)'
    width: number = Scale.minor.third
    height: number = Scale.minor.fourth
    color: Color = Color.LightGray

    consumes: ResourceBlock = null
    produces: ResourceBlock = null
    productionTime: number = 500
}

// resource collection
export class CommandCenter extends Machine {
    name = 'Command Center'
    description = 'gather resources'
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
    name = 'Mining Drill'
    description = 'find some ores'
    produces = ResourceBlock.Ore
}

export class MineralProcessor extends Machine {
    name = 'Mineral Processor'
    description = 'extract some minerals'

    consumes = ResourceBlock.Ore
    produces = ResourceBlock.Mineral
}

// data

export class Bookshelf extends Machine {
    name = 'Bookshelf'
    description = 'brainstorm'
    produces = ResourceBlock.Hypothesis
}

export class ExperimentBench extends Machine {
    name = 'Experiment Bench'
    description = 'test some hypotheses'
    consumes = ResourceBlock.Hypothesis
    produces = ResourceBlock.Data
}

// reproduction

//export class CloningVat extends Machine {
//    name = 'Cloning Vat'
//    description = 'grow some replacements'
//    consumes = ResourceBlock.Meal
//    // produces = 
//}

// maybe library node 'stores' data?
//export class LibraryNode {
//    name = 'Library Node'
//
//    consumes = ResourceBlock.
//}