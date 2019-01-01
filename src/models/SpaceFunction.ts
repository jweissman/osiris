import { Machine, OxygenExtractor, WaterCondensingMachine, CloningVat, Bookshelf, Desk, Bed, Stove, AlgaeVat, ResearchServer, Fridge, SolarCell, Arbor, Cabin, Workstation, Fabricator, Houseplant, Orchard, Megafabricator, StudyMachine } from './Machine';

export class SpaceFunction {
    static label: string = '(generic)';
    static machines: (typeof Machine)[] = [];
}

class LivingQuarters extends SpaceFunction {
    static label = 'Living Quarters'
    static machines = [ Bed ]
}

class Barracks extends SpaceFunction {
    static label = 'Barracks'
    static machines = [ Bed, Bed, Bed ]
}

class Kitchen extends SpaceFunction {
    static label = 'Kitchen'
    static machines = [ Stove, Fridge ]
}

class LifeSupportPod extends SpaceFunction {
    static label = 'Life Support Module'
    static machines = [ OxygenExtractor, WaterCondensingMachine ]
}

class Retreat extends SpaceFunction {
    static label = 'Retreat'
    static machines = [ Cabin, Cabin ]
}

class CloneMatrix extends SpaceFunction {
    static label = 'Clone Matrix'
    static machines = [ CloningVat, CloningVat ] //
}

class ReadingRoom extends SpaceFunction {
    static label = 'Reading Room'
    static machines = [ Bookshelf, Bookshelf ]
}

class Library extends SpaceFunction {
    static label = 'Library'
    static machines = [ Bookshelf, Bookshelf, Bookshelf ]
}

class Study extends SpaceFunction {
    static label = 'Study'
    static machines = [ StudyMachine, Bookshelf ]
}

class Lab extends SpaceFunction {
    static label = 'Lab'
    static machines = [ Workstation, Workstation, Workstation ]
}

class Archive extends SpaceFunction {
    static label = 'Archive'
    static machines = [ ResearchServer, ResearchServer ]
}

class Arboretum extends SpaceFunction {
    static label = 'Arboretum'
    static machines = [ Arbor, Arbor ]
}

class AlgaeFarm extends SpaceFunction {
    static label = 'Algae Farm'
    static machines = [ AlgaeVat, AlgaeVat ]
}

class SolarArray extends SpaceFunction {
    static label = 'Solar Array'
    static machines = [ SolarCell, SolarCell ]
}

class Workshop extends SpaceFunction {
    static label = 'Workshop'
    static machines = [ Fabricator, Fabricator ]
}

// 3 house plants => nursery?
class Nursery extends SpaceFunction {
    static label = 'Nursery'
    static machines = [ Houseplant, Houseplant, Houseplant ]
}

class Farm extends SpaceFunction {
    static label = 'Farm'
    static machines = [ Orchard, Orchard ]
}

class Factory extends SpaceFunction {
    static label = 'Factory'
    static machines = [ Megafabricator, Megafabricator ]
}

export const allSpaceFunctions = [
    Library,
    Barracks,
    LifeSupportPod,
    CloneMatrix,
    LivingQuarters,
    Kitchen,
    AlgaeFarm,
    Archive,
    Arboretum,
    SolarArray,
    Retreat,
    Study,
    Workshop,
    ReadingRoom,
    Nursery,
    Farm,
    Factory,
    Lab,
]