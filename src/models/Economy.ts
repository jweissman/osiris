import { Color } from "excalibur";

export enum ResourceBlock {
    // base
    Food = 'Food',
    Ore = 'Ore',
    Data = 'Data',

    // derived
    Meal = 'Meal',
}

export function blockColor(block: ResourceBlock) {
    let baseColor = Color.Violet
    switch(block) {
        case ResourceBlock.Food: baseColor = Color.Green; break
        case ResourceBlock.Ore:  baseColor = Color.Red; break
        case ResourceBlock.Data: baseColor = Color.Blue; break
        case ResourceBlock.Meal: baseColor = Color.Yellow; break
    }
    return baseColor.desaturate(0.25).lighten(0.125)
}

