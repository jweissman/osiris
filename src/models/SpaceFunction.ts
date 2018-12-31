import { Machine, OxygenExtractor, WaterCondensingMachine, CloningVat, Bookshelf, Desk, Bed, Stove, AlgaeVat, ResearchServer, Fridge } from './Machine';

export class SpaceFunction {
    static label: string = '(generic)';
    static machines: (typeof Machine)[] = [];
}

class LivingQuarters extends SpaceFunction {
    static label = 'Living Quarters'
    static machines = [ Bed ]
}

class Kitchen extends SpaceFunction {
    static label = 'Kitchen'
    static machines = [ Stove, Fridge ]
}

class LifeSupportPod extends SpaceFunction {
    static label = 'Life Support Module'
    static machines = [ OxygenExtractor, WaterCondensingMachine ]
}

//export class Retreat extends SpaceFunction {
//    static label = 'Retreat'
//    static machines = [ Cabin, CookingFire ]
//}

class CloneMatrix extends SpaceFunction {
    static label = 'Clone Matrix'
    static machines = [ CloningVat, CloningVat ] //
}

class Library extends SpaceFunction {
    static label = 'Library'
    static machines = [ Bookshelf, Bookshelf ]
}

class Archive extends SpaceFunction {
    static label = 'Archive'
    static machines = [ ResearchServer, ResearchServer ]
}

//export class Arboretum extends SpaceFunction {
//    static label = 'Arboretum'
//    static machines = [ Arbor, Arbor ]
//}

class AlgaeFarm extends SpaceFunction {
    static label = 'Algae Farm'
    static machines = [ AlgaeVat, AlgaeVat ]
}

export const allSpaceFunctions = [
    Library,
    LifeSupportPod,
    CloneMatrix,
    LivingQuarters,
    Kitchen,
    AlgaeFarm,
    Archive,
]