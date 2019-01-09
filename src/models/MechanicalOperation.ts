import { ResourceBlock } from "./Economy";

export type MechanicalOperation =
    Recipe |
    ResourceGenerator |
    ResourceStorage |
    SpawnClone |
    AccelerateTime |
    Noop

export interface Noop {
    type: 'noop'
}

export interface Recipe {
    type: 'recipe'
    consumes: ResourceBlock[]
    produces: ResourceBlock
    workTime: number
}

export interface ResourceGenerator {
    type: 'generator'
    generates: ResourceBlock
    generationTime: number
    capacity: number
}

export interface ResourceStorage {
    type: 'store'
    stores: ResourceBlock[]
    capacity: number
}

export interface SpawnClone {
    type: 'spawn'
}

export interface AccelerateTime {
    type: 'accelerate'
    factor: number
}

function store(res: ResourceBlock[], capacity: number = 10): ResourceStorage {
    return {
        type: 'store',
        stores: res,
        capacity
    }
}

function generate(res: ResourceBlock, cap: number = 4): ResourceGenerator {
    return {
        type: 'generator',
        generates: res,
        generationTime: 1000,
        capacity: cap
    }
}

function recipe(input: ResourceBlock[], output: ResourceBlock): Recipe {
    return {
        type: 'recipe',
        consumes: input,
        produces: output,
        workTime: 1000,
    }
}

function spawn(): SpawnClone {
    return {
        type: 'spawn',
    }
}

function accelerateTime(): AccelerateTime {
    return {
        type: 'accelerate',
        factor: 2
    }
}

export const mechanicalOperations = {
    store,
    generate,
    recipe,
    spawn,
    accelerateTime,
}