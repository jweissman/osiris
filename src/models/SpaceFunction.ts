import { Machine, OxygenExtractor, WaterCondensingMachine, CloningVat, Bookshelf, Desk, Bed, Stove, AlgaeVat, ResearchServer, Fridge, SolarCell, Arbor, Cabin, Workstation, Fabricator, Houseplant, Orchard, Megafabricator, StudyMachine, Mainframe, CommandCenter, MissionLog, Botany, OrientationConsole, PersonnelRegistry } from './Machine';
import { Color } from 'excalibur';
import { Structure, MediumSurfaceRoom } from './Structure';
import { BackgroundPattern } from '../actors/Building/BackgroundPatterns';

export class SpaceFunction {
     name: string = '(generic)'
     description: string = '(generic description)'
     machines: (typeof Machine)[] = []
     color: Color = Color.Gray

     prereqs: (typeof SpaceFunction)[] =  [] 

     structure: typeof Structure = null
     hide: boolean = false
     background: BackgroundPattern = BackgroundPattern.Beige

     bonuses: {
          capacity: number, // every store/generator gets this??
          workSpeed: number, // 2 should double work speed (dur *= 1/multiplier)
     } = {
          capacity: 0, // boost cap by one
          workSpeed: 1.00 // 20% bonus to work speed
     }
}

export class MissionControl extends SpaceFunction {
     hide = true
     name = 'Mission Control'
     description = 'keeping everything on track'
     structure = MediumSurfaceRoom
     prereqs = [] //ComputerCore, Factory, Farm ]
     machines = [ CommandCenter, MissionLog ]
     background = BackgroundPattern.Window
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
     bonuses = {
          capacity: 2,
          workSpeed: 1.1
     }
     background = BackgroundPattern.Checker
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

export class CloneReception extends SpaceFunction {
     name = 'Clone Reception'
     description = 'welcome clone'
     machines = [ CloningVat, OrientationConsole, PersonnelRegistry ]
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
     background = BackgroundPattern.Books
}

class Study extends SpaceFunction {
     name = 'Study'
     description = 'plan it out'
     machines = [ StudyMachine, Bookshelf ]
}

class ComputerLab extends SpaceFunction {
     name = 'Computer Lab'
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

export class SolarArray extends SpaceFunction {
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
     background = BackgroundPattern.Leafy
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
     background = BackgroundPattern.Tech
}

export class LifeSciencesLab extends SpaceFunction {
     name = 'Life Sciences Lab'
     description = 'where do i come from'
     machines = [ Botany, Botany ]
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
    ComputerLab,

    ComputerCore,

    MissionControl,
    LifeSciencesLab,

    CloneReception,
]