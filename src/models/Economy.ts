import { Color } from "excalibur";

// import { Building } from "../actors/Building";

// type Ore = Beryllium 
export enum ResourceBlock {
    // base
    Food = 'Food',
    Ore = 'Ore',
    Data = 'Data',

    // derived
    Meal = 'Meal',
}

export function blockColor(block: ResourceBlock) {
    switch(block) {
        case ResourceBlock.Food: return Color.Green
        case ResourceBlock.Ore:  return Color.Red
        case ResourceBlock.Data: return Color.Blue

        case ResourceBlock.Meal: return Color.Yellow
    }
}

// a list of tasks?
// type Haul = { source: Building, destination: Building }
// // type Task = Haul

// export class Economy {
//     constructor() { // map: Graph<Building>)

//     }
// }