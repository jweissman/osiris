import { ResourceBlock } from "./Economy";

export type MechanicalOperation = Recipe | Generator | ResourceStorage | SpawnClone | Noop;

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

export interface ResourceStorage {
    type: 'store'
    stores: ResourceBlock[]
    capacity: number
}

export interface SpawnClone {
    type: 'spawn'
}

function store(res: ResourceBlock[], capacity: number = 10): ResourceStorage {
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
    }
}

export const mechanicalOperations = {
    store,
    generate,
    recipe,
    spawn
}