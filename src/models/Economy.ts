import { Color } from "excalibur";

// an abstract/intangible thing (or at least something we don't represent)
export enum PureValue {
    Power = 'Power',
    Hope = 'Hope',
    Shelter = 'Shelter',
    Oxygen = 'Oxygen',
}

export type Economy = { [key in PureValue]: {
    supply: number,
    demand: number
} }

export const emptyMarket : Economy = {
    Power: {
        supply: 0,
        demand: 0
    },
    Hope: {
        supply: 0,
        demand: 0
    },
    Shelter: {
        supply: 0,
        demand: 0
    },
    Oxygen: {
        supply: 0,
        demand: 0
    },
}

export enum ResourceBlock {
    // base
    Food = 'Food',
    Ore = 'Ore',
    Data = 'Data',
    // derived
    Meal = 'Meal',
    Hypothesis = 'Hypothesis',
    Mineral = 'Mineral',
    Alloy = "Alloy"
}

const blockColors: { [key in ResourceBlock]: Color } = {
    Food: Color.Green,
    Data: Color.Blue,
    Mineral: Color.Red,

    Meal: Color.Yellow.darken(0.2),
    Hypothesis: Color.Violet.darken(0.4),
    Ore: Color.Red.darken(0.5),

    Alloy: Color.LightGray.darken(0.2),
}

export function blockColor(block: ResourceBlock) {
    let baseColor = blockColors[block]
    //Color.Violet
    //switch(block) {
    //    case ResourceBlock.Food: baseColor = Color.Green; break
    //    case ResourceBlock.Ore:  baseColor = Color.Red; break
    //    case ResourceBlock.Data: baseColor = Color.Blue; break
    //    case ResourceBlock.Meal: baseColor = Color.Yellow; break
    //}
    return baseColor.desaturate(0.25).lighten(0.125)
}

