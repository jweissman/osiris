import { Machine, OxygenExtractor, WaterCondensingMachine, CloningVat, Bookshelf, Desk, Bed, Stove, AlgaeVat, ResearchServer, Fridge, SolarCell, Arbor, Cabin, Workstation, Fabricator, Houseplant, Orchard, Megafabricator, StudyMachine, Mainframe } from './Machine';
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
     description = 'good night'
     machines = [ Bed ]
}

class Barracks extends SpaceFunction {
     name = 'Barracks'
     description = 'sleep tight'
     machines = [ Bed, Bed, Bed ]
}

export class Kitchen extends SpaceFunction {
     name = 'Kitchen'
     description = 'stay together'
     machines = [ Stove, Fridge ]
}

export class LifeSupportPod extends SpaceFunction {
     name = 'Life Support'
     description = 'keep it going'
     machines = [ OxygenExtractor, WaterCondensingMachine ]
}

class Retreat extends SpaceFunction {
     name = 'Retreat'
     description = 'take it easy'
     machines = [ Cabin, Cabin ]
}

export class CloneMatrix extends SpaceFunction {
     name = 'Clone Matrix'
     description = 'clone home'
     machines = [ CloningVat, CloningVat ]
}

class ReadingRoom extends SpaceFunction {
     name = 'Reading Room'
     description = 'butterflies in the sky'
     machines = [ Bookshelf, Bookshelf ]
}

export class Library extends SpaceFunction {
     name = 'Library'
     description = 'take a look'
     machines = [ Bookshelf, Bookshelf, Bookshelf ]
}

class Study extends SpaceFunction {
     name = 'Study'
     description = 'plan it out'
     machines = [ StudyMachine, Bookshelf ]
}

class Lab extends SpaceFunction {
     name = 'Lab'
     description = 'make it happen'
     machines = [ Workstation, Workstation, Workstation ]
}

export class Archive extends SpaceFunction {
     name = 'Archive'
     description = 'write it down'
     machines = [ ResearchServer, ResearchServer ]
}

class Arboretum extends SpaceFunction {
     name = 'Arboretum'
     description = 'walk it out'
     machines = [ Arbor, Arbor ]
}

class AlgaeFarm extends SpaceFunction {
     name = 'Algae Farm'
     description = 'make do'
     machines = [ AlgaeVat, AlgaeVat ]
}

class SolarArray extends SpaceFunction {
     name = 'Solar Array'
     description = 'warm up'
     machines = [ SolarCell, SolarCell ]
}

class Workshop extends SpaceFunction {
     name = 'Workshop'
     description = 'take form'
     machines = [ Fabricator, Fabricator ]
}

class Nursery extends SpaceFunction {
     name = 'Nursery'
     description = 'quiet please'
     machines = [ Houseplant, Houseplant, Houseplant ]
}

class Farm extends SpaceFunction {
     name = 'Farm'
     description = 'food for the masses'
     machines = [ Orchard, Orchard ]
}

class Factory extends SpaceFunction {
     name = 'Factory'
     description = 'production lines'
     machines = [ Megafabricator, Megafabricator ]
}


export class ComputerCore extends SpaceFunction {
     name = 'Computer Core'
     description = 'let us calculate'
     machines = [ Mainframe, Mainframe ]
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

    ComputerCore,
]