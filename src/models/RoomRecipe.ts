import { Machine, OxygenExtractor, WaterCondensingMachine, CloningVat, Bookshelf, Desk, Bed, Stove, AlgaeVat, ResearchServer, Fridge, SolarCell, Arbor, Cabin, Workstation, Fabricator, Houseplant, Orchard, Megafabricator, StudyMachine, Mainframe, CommandCenter, MissionLog, Botany, OrientationConsole, PersonnelRegistry, MineralProcessor, MiningDrill, HoloProjector, TimeCrystal, Couch, Statue } from './Machine';
import { Color } from 'excalibur';
import { Structure, MediumSurfaceRoom } from './Structure';
import { BackgroundPattern } from '../actors/Building/BackgroundPatterns';

export class RoomRecipe {
     name: string = '(generic)'
     description: string = '(generic description)'
     machines: (typeof Machine)[] = []
     color: Color = Color.Gray

     prereqs: (typeof RoomRecipe)[] =  [] 

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

export class MissionControl extends RoomRecipe {
     hide = true
     name = 'Mission Control'
     description = 'keeping everything on track'
     structure = MediumSurfaceRoom
     prereqs = [] //ComputerCore, Factory, Farm ]
     machines = [ CommandCenter, MissionLog ]
     background = BackgroundPattern.Window
}

export class LivingQuarters extends RoomRecipe {
     name = 'Living Quarters'
     description = 'good night'
     machines = [ Bed ]
}

class Barracks extends RoomRecipe {
     name = 'Barracks'
     description = 'sleep tight'
     machines = [ Bed, Bed, Bed ]
}

export class Kitchen extends RoomRecipe {
     name = 'Kitchen'
     description = 'stay together'
     machines = [ Stove, Fridge ]
     bonuses = {
          capacity: 2,
          workSpeed: 1.1
     }
     background = BackgroundPattern.Checker
}

export class LifeSupportPod extends RoomRecipe {
     name = 'Life Support'
     description = 'keep it going'
     machines = [ OxygenExtractor, WaterCondensingMachine ]
}

class Retreat extends RoomRecipe {
     name = 'Retreat'
     description = 'take it easy'
     machines = [ Cabin, Cabin ]
}

export class CloneMatrix extends RoomRecipe {
     name = 'Clone Matrix'
     description = 'clone home'
     machines = [ CloningVat, CloningVat ]
}

export class CloneReception extends RoomRecipe {
     name = 'Clone Reception'
     description = 'welcome clone'
     machines = [ CloningVat, OrientationConsole, PersonnelRegistry ]
}

class ReadingRoom extends RoomRecipe {
     name = 'Reading Room'
     description = 'butterflies in the sky'
     machines = [ Bookshelf, Bookshelf ]
}

export class Library extends RoomRecipe {
     name = 'Library'
     description = 'take a look'
     machines = [ Bookshelf, Bookshelf, Bookshelf ]
     background = BackgroundPattern.Books
}

export class Study extends RoomRecipe {
     name = 'Study'
     description = 'plan it out'
     machines = [ StudyMachine, Bookshelf ]
     background = BackgroundPattern.Wood
}

class ComputerLab extends RoomRecipe {
     name = 'Computer Lab'
     description = 'make it happen'
     machines = [ Workstation, Workstation, Workstation ]
}

export class Archive extends RoomRecipe {
     name = 'Archive'
     description = 'write it down'
     machines = [ ResearchServer, ResearchServer ]
}

class Arboretum extends RoomRecipe {
     name = 'Arboretum'
     description = 'walk it out'
     machines = [ Arbor, Arbor ]
}

class AlgaeFarm extends RoomRecipe {
     name = 'Algae Farm'
     description = 'make do'
     machines = [ AlgaeVat, AlgaeVat ]
}

export class SolarArray extends RoomRecipe {
     name = 'Solar Array'
     description = 'warm up'
     machines = [ SolarCell, SolarCell ]
}

export class Workshop extends RoomRecipe {
     name = 'Workshop'
     description = 'take form'
     machines = [ Fabricator, Fabricator ]
}

class Nursery extends RoomRecipe {
     name = 'Nursery'
     description = 'quiet please'
     machines = [ Houseplant, Houseplant, Houseplant ]
     background = BackgroundPattern.Leafy
}

class Farm extends RoomRecipe {
     name = 'Farm'
     description = 'food for the masses'
     machines = [ Orchard, Orchard ]
}

class Factory extends RoomRecipe {
     name = 'Factory'
     description = 'production lines'
     machines = [ Megafabricator, Megafabricator ]
}


export class ComputerCore extends RoomRecipe {
     name = 'Computer Core'
     description = 'let us calculate'
     machines = [ Mainframe, Mainframe ]
     background = BackgroundPattern.Tech
}

export class LifeSciencesLab extends RoomRecipe {
     name = 'Life Sciences Lab'
     description = 'where do i come from'
     machines = [ Botany, Botany ]
}

export class Refinery extends RoomRecipe {
     name = 'Refinery'
     description = 'separation'
     machines = [ MineralProcessor ]
}

export class Mine extends RoomRecipe {
     name = 'Mine'
     description = 'ore from the stone'
     machines = [ MiningDrill ]
}

export class HoloMatrix extends RoomRecipe {
     name = 'Hologram Matrix'
     description = 'dream it'
     machines = [ HoloProjector, HoloProjector ]
}

export class TimeChamber extends RoomRecipe {
     name = 'Time Chamber'
     description = 'believe it'
     machines = [ TimeCrystal, TimeCrystal ]
}

// export class DreamMatrix extends 

export class LivingRoom extends RoomRecipe {
     name = 'Living Room'
     description = 'just relax'
     machines = [ Couch, Couch ]
}

export class Statuary extends RoomRecipe {
     name = 'Statuary'
     description = 'to remember'
     machines = [ Statue, Statue, Statue ]
}

export const allSpaceFunctions = [
    MissionControl,

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

    LifeSciencesLab,

    CloneReception,
    
    Refinery,
    Mine,
    HoloMatrix,
    TimeChamber,

    LivingRoom,
    Statuary,
]