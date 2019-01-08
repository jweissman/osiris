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

export const allValues = [
    PureValue.Power,
    PureValue.Oxygen,
    PureValue.Water,
    PureValue.Shelter,
    PureValue.Hope,
    PureValue.Wisdom,
    PureValue.Wealth,
    PureValue.Beauty,
    PureValue.Wonder
]

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
    return Math.floor(market[value].supply - market[value].demand)
}

export const sumMarkets: (ea: Economy, eb: Economy) => Economy = (ea, eb) => {
    let newMarket = emptyMarket();
    for (let value in PureValue) {
        let { supply: sa, demand: da } = ea[value]
        let { supply: sb, demand: db } = eb[value]
        let supply = sa + sb
        let demand = da + db
        newMarket[value] = {
            supply,
            demand,
        }
    }
    return newMarket
}

export enum ResourceBlock {
    // base
    Biomass = 'Biomass',
    Ore = 'Ore',
    Idea = 'Idea',

    // derived
    Meal = 'Meal',
    Data = 'Data',
    Mineral = 'Mineral',
    Bioplasma = 'Bioplasma',

    // higher-order
    Alloy = "Alloy",
    Algorithm = "Algorithm",

    // superb
    Argent = "Argent",
    Aurum = "Aurum",
}

let cStep = 0.3
const blockColors: { [key in ResourceBlock]: Color } = {
    Biomass: Color.Green,
    Data: Color.Blue.lighten(cStep),
    Mineral: Color.Red,

    Meal: Color.Yellow.darken(cStep),
    Idea: Color.Blue.lighten(cStep*2), //.desaturate(cStep),
    Ore: Color.Red.darken(cStep),

    Bioplasma: Color.Viridian,

    Alloy: Color.DarkGray.darken(cStep), //(cStep),
    Algorithm: Color.Blue.darken(cStep), //.desaturate(cStep),

    Argent: Color.LightGray.lighten(cStep),
    Aurum: Color.Orange.lighten(cStep),
}

export function blockColor(block: ResourceBlock) {
    let baseColor = blockColors[block]
    return baseColor.desaturate(0.1) //.lighten(0.1) //.desaturate(0.25).lighten(0.125)
}

