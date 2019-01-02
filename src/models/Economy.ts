import { Color } from "excalibur";

// an abstract/intangible thing (or at least something we don't represent)
export enum PureValue {
    Power = 'Power',
    Oxygen = 'Oxygen',
    Water = 'Water',
    Shelter = 'Shelter',
    Hope = 'Hope',
    Joy = 'Joy',
    Wisdom = 'Wisdom',
    Wealth = 'Wealth',
    Beauty = 'Beauty',
    Wonder = 'Wonder'
}

export type Economy = { [key in PureValue]: {
    supply: number,
    demand: number
} }

export function emptyMarket() : Economy {
    return {
        Power: { supply: 0, demand: 0 },
        Oxygen: { supply: 0, demand: 0 },
        Water: { supply: 0, demand: 0 },
        Shelter: { supply: 0, demand: 0 },
        Hope: { supply: 0, demand: 0 },
        Joy: { supply: 0, demand: 0 },
        Wealth: { supply: 0, demand: 0 },
        Wisdom: { supply: 0, demand: 0 },
        Beauty: { supply: 0, demand: 0 },
        Wonder: { supply: 0, demand: 0 },
    }
}

export function availableCapacity(market: Economy, value: PureValue) {
    return market[value].supply - market[value].demand
}

export const sumMarkets: (ea: Economy, eb: Economy) => Economy = (ea, eb) => {
    let newMarket = emptyMarket();
    for (let value in PureValue) {
        let { supply: sa, demand: da } = ea[value]
        let { supply: sb, demand: db } = eb[value]
        let supply = sa + sb
        let demand = da + db
        newMarket[value] = {
            supply, //: ea[value].supply + eb[value].supply,
            demand, //: ea[value].demand + eb[value].demand
        }
    }
    return newMarket
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

