import { Machine, Houseplant, Orchard, AlgaeVat, Statue, Figurine, Bed, OxygenExtractor, WaterCondensingMachine, ResearchServer, Desk, Codex, Botany, Bookshelf, SolarCell, TimeCrystal } from "./Machine";
import { SolarArray, TimeChamber } from "./SpaceFunction";

export enum Discipline {
    Survival = 'Survival',
    // Agriculture = 'Agriculture',
    LibraryScience = 'Library Science',
    // LifeScience = 'Life Sciences',
    // PlasticArts = 'Plastic Arts',
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
            description: "Keep it going",
            prereqs: [ Bed, SolarCell ],
            unlocks: [ OxygenExtractor, WaterCondensingMachine ]
        },
    ],

    // [Discipline.Agriculture]: [
    //     // small planter?
    //     { prereqs: [ Houseplant ], unlocks: [ Orchard ] } // Greenhouse...? ] }
    // ],

    [Discipline.LibraryScience]: [
        {
            name: "Library Science I",
            level: 1,
            description: "try to understand",
            prereqs: [ Bookshelf ],
            unlocks: [ Desk, Codex ],
        }
    ],

    // [Discipline.LifeScience]: [ 
    //     { prereqs: [], unlocks: [ Botany, AlgaeVat ]}
    // ],

    // [Discipline.PlasticArts]: [
    //     { prereqs: [ Figurine ], unlocks: [ Statue ] }

    // ],
}

