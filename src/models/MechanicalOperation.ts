import { ResourceBlock } from "./Economy";

export type MechanicalOperation = Recipe | Generator | Storage | SpawnClone | Noop;

export interface Noop {
    type: 'noop'
}

export interface Recipe {
    type: 'recipe'
    consumes: ResourceBlock[]
    produces: ResourceBlock
    workTime: number
}

export interface Generator {
    type: 'generator'
    generates: ResourceBlock
    generationTime: number
    capacity: number
}

export interface Storage {
    type: 'store'
    stores: ResourceBlock[]
    capacity: number
}

export interface SpawnClone {
    type: 'spawn'
    // consumes: ResourceBlock
    // cycleTime: number
}

function store(res: ResourceBlock[], capacity: number = 10): Storage {
    return {
        type: 'store',
        stores: res,
        capacity
    }
}

function generate(res: ResourceBlock): Generator {
    return {
        type: 'generator',
        generates: res,
        generationTime: 1000,
        capacity: 4
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
        // consumes: ResourceBlock.Food
    }
}

export const mechanicalOperations = {
    store,
    generate,
    recipe,
    spawn
}