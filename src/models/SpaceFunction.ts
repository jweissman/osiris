import { Machine, OxygenExtractor, WaterCondensingMachine, CloningVat, Bookshelf, Desk, Bed, Stove } from './Machine';

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
    static machines = [ Stove ]
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
    static machines = [ CloningVat, ]
}

class Library extends SpaceFunction {
    static label = 'Library'
    static machines = [ Bookshelf, Bookshelf ]
}

//export class Arboretum extends SpaceFunction {
//    static label = 'Arboretum'
//    static machines = [ Arbor, Arbor ]
//}

export const allSpaceFunctions = [
    Library,
    LifeSupportPod,
    CloneMatrix,
    LivingQuarters,
    Kitchen,
]

