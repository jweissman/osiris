import { ResourceBlock } from "../models/Economy";

import { Recipe } from "../models/MechanicalOperation";

export interface RetrieveResource {
    type: 'retrieve'
    resource: ResourceBlock
    // count: number
}

export interface WorkRecipe {
    type: 'work'
    recipe: Recipe
}

export interface StoreResource {
    type: 'store'
    resource: ResourceBlock
}

export function retrieveResource(res: ResourceBlock): RetrieveResource {
    return {
        type: 'retrieve',
        resource: res,
        // count: 1
    }
}


export type InteractionRequest = StoreResource | RetrieveResource | WorkRecipe; // | ...

