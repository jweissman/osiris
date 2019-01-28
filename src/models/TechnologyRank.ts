import { Machine, Houseplant, Orchard, Bed, OxygenExtractor, WaterCondensingMachine, Codex, Bookshelf, SolarCell, Fridge, Stove, Books, Workstation, Greenhouse, Botany, MineralProcessor, Miner, Table } from "./Machine";

export enum Discipline {
    Survival = 'Environmental Control',
    Agriculture = 'Food Production',
    LibraryScience = 'Library Science',
    Cooking = 'Food Preparation',
    // PowerGeneration = 'Power Generation',
    // LifeScience = 'Life Sciences',
    // PlasticArts = 'Plastic Arts',
    MineralProduction = 'Mineral Production',
}

export interface TechnologyRank {
    name: string
    level: number
    description: string
    prereqs: (typeof Machine)[]
    unlocks: (typeof Machine)[]
}

export const disciplineTree: { [key in Discipline]: TechnologyRank[] } = {
    [Discipline.Survival]: [
        { 
            name: "Survival I",
            level: 1,
            description: "staying alive",
            prereqs: [ Bed, SolarCell ],
            unlocks: [ OxygenExtractor, WaterCondensingMachine ]
        },
    ],

    [Discipline.Agriculture]: [
        // small planter?
        {
            name: 'Food Prod. I',
            level: 1,
            description: "watch the calories",
            prereqs: [Botany],
            unlocks: [Houseplant, Greenhouse, Orchard],
        } // Greenhouse...? ] }
    ],

    [Discipline.Cooking]: [
        {
            name: 'Food Prep. I',
            level: 1,
            description: "bam",
            prereqs: [Fridge],
            unlocks: [Stove],
        }
    ],

    [Discipline.LibraryScience]: [
        {
            name: "Library Science I",
            level: 1,
            description: "try to understand",
            prereqs: [ Books ],
            unlocks: [ Bookshelf, Workstation, Codex ],
        }
    ],

    [Discipline.MineralProduction]: [
        {
            name: 'Mineral Production I',
            level: 1,
            description: 'make it work',
            prereqs: [ Table ],
            unlocks: [ Miner, MineralProcessor ],
        }
    ]

    // [Discipline.LifeScience]: [ 
    //     { prereqs: [], unlocks: [ Botany, AlgaeVat ]}
    // ],

    // [Discipline.PlasticArts]: [
    //     { prereqs: [ Figurine ], unlocks: [ Statue ] }

    // ],
}

