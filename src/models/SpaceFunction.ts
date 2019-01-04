import { Machine, OxygenExtractor, WaterCondensingMachine, CloningVat, Bookshelf, Desk, Bed, Stove, AlgaeVat, ResearchServer, Fridge, SolarCell, Arbor, Cabin, Workstation, Fabricator, Houseplant, Orchard, Megafabricator, StudyMachine } from './Machine';
import { Color } from 'excalibur';

export class SpaceFunction {
     name: string = '(generic)'
     description: string = '(generic description)'
     machines: (typeof Machine)[] = []
     color: Color = Color.Gray

     prereqs: (typeof SpaceFunction)[] =  [] 
}

export class LivingQuarters extends SpaceFunction {
     name = 'Living Quarters'
     machines = [ Bed ]
}

class Barracks extends SpaceFunction {
     name = 'Barracks'
     machines = [ Bed, Bed, Bed ]
}

export class Kitchen extends SpaceFunction {
     name = 'Kitchen'
     machines = [ Stove, Fridge ]
}

export class LifeSupportPod extends SpaceFunction {
     name = 'Life Support Module'
     machines = [ OxygenExtractor, WaterCondensingMachine ]
}

class Retreat extends SpaceFunction {
     name = 'Retreat'
     machines = [ Cabin, Cabin ]
}

export class CloneMatrix extends SpaceFunction {
     name = 'Clone Matrix'
     machines = [ CloningVat, CloningVat ]
}

class ReadingRoom extends SpaceFunction {
     name = 'Reading Room'
     machines = [ Bookshelf, Bookshelf ]
}

class Library extends SpaceFunction {
     name = 'Library'
     machines = [ Bookshelf, Bookshelf, Bookshelf ]
}

class Study extends SpaceFunction {
     name = 'Study'
     machines = [ StudyMachine, Bookshelf ]
}

class Lab extends SpaceFunction {
     name = 'Lab'
     machines = [ Workstation, Workstation, Workstation ]
}

class Archive extends SpaceFunction {
     name = 'Archive'
     machines = [ ResearchServer, ResearchServer ]
}

class Arboretum extends SpaceFunction {
     name = 'Arboretum'
     machines = [ Arbor, Arbor ]
}

class AlgaeFarm extends SpaceFunction {
     name = 'Algae Farm'
     machines = [ AlgaeVat, AlgaeVat ]
}

class SolarArray extends SpaceFunction {
     name = 'Solar Array'
     machines = [ SolarCell, SolarCell ]
}

class Workshop extends SpaceFunction {
     name = 'Workshop'
     machines = [ Fabricator, Fabricator ]
}

class Nursery extends SpaceFunction {
     name = 'Nursery'
     machines = [ Houseplant, Houseplant, Houseplant ]
}

class Farm extends SpaceFunction {
     name = 'Farm'
     machines = [ Orchard, Orchard ]
}

class Factory extends SpaceFunction {
     name = 'Factory'
     machines = [ Megafabricator, Megafabricator ]
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