import { Vector } from 'excalibur';
import { ResourceBlock } from './Economy';
import { Scale } from '../values/Scale';

// let sizeFactor = 0.85

let minorUnit = Scale.minor.first  //* sizeFactor
let majorUnit = Scale.major.first //* sizeFactor

// let megaUnit = 16 * majorUnit
const { major, minor } = Scale

export class Structure {
    name: string = '(structure name)';
    description: string = '(structure description)';
    view: string = '<structure (room) view>';
    width: number = 10 //* sizeFactor
    height: number = 10 //* sizeFactor
    zoom: number = 1 // 0.1 //.25

    consumes: ResourceBlock = null
    produces: ResourceBlock = null
    productionTime: number = 500

    constructor(public origin: Vector = new Vector(0, 0)) { }
}

export class MissionControl extends Structure {
    name: string = 'Mission Control';
    description: string = 'Keeping everything on track';
    view: string = 'MissionControlView';
    width: number = major.third // 10 * majorUnit
    height: number = minor.third //3 * majorUnit
    zoom = 0.1
}

export class MainTunnel extends Structure {
    name: string = 'Main Tunnel';
    description: string = 'Elevating';
    view: string = 'TunnelView';
    width: number = major.second // 2 * majorUnit
    height: number = major.eighth // 10 * majorUnit //150 // * sizeFactor
    zoom = 0.25
}

export class Dome extends Structure {
    name: string = 'Biodome';
    description: string = 'Biome sweet biome';
    produces = ResourceBlock.Food

    view: string = 'DomeView';
    width: number = major.sixth // 10 * majorUnit
    height: number = major.third //8 * majorUnit
    zoom = 0.2
    productionTime = 5000
}

export class AccessTunnel extends Structure {
    name: string = 'Corridor'
    description: string = 'in the hallway'
    view: string = 'AccessTunnelView'
    width: number = minor.fifth // 10 * minorUnit
    height: number = minor.third //1 * minorUnit
    zoom = 0.5
}

export class CommonArea extends Structure {
    name: string = 'Commons'
    description: string = 'hallway cap'
    view: string = 'CommonAreaView'
    width: number = major.eighth //8 * majorUnit
    height: number = major.fifth //5 * majorUnit

}

export class LivingQuarters extends Structure {
    name: string = 'Quarters'
    description: string = 'sleepy time'
    view: string = 'LivingQuartersView'
    width: number = major.third //minor.seventh // 3 * majorUnit
    height: number = major.fifth //5 * majorUnit
}

export class SurfaceRoad extends Structure {
    name: string = 'Road'
    description: string = 'go for a walk'
    view: string = 'SurfaceRoadView'
    width: number = minor.fifth // 5 * minorUnit
    height: number = minor.first // 1 * minorUnit
}

export class Laboratory extends Structure {
    name: string = 'Lab'
    description: string = 'learn some things'
    consumes = ResourceBlock.Hypothesis
    produces = ResourceBlock.Data
    view: string = 'LabView'
    width: number = major.sixth // 11 * majorUnit
    height: number = major.fifth // 5 * majorUnit
    productionTime = 6500
}


export class Kitchen extends Structure {
    name: string = 'Kitchen'
    description: string = 'veg -> meals'
    consumes = ResourceBlock.Food
    produces = ResourceBlock.Meal
    view: string = 'KitchenView'
    width: number = major.fourth // 4 * majorUnit
    height: number = major.fifth //5 * majorUnit
    productionTime = 2000
}

export class Mess extends Structure {
    name: string = 'Mess'
    description: string = 'consume meals'
    view: string = 'MessView'
    width: number = major.sixth //6 * majorUnit
    height: number = major.fifth //5 * majorUnit
}

// a mine is maybe a wide structure that you
// can gradually dig deeper??
export class Mine extends Structure {
    name: string = 'Mine'
    description: string = 'ore else'
    produces = ResourceBlock.Ore
    view: string = 'MineView'
    width: number = major.eighth // 20 * majorUnit
    height: number = 3 * major.sixth //20 * majorUnit
}

export class Study extends Structure {
    name: string = 'Study'
    description: string = 'reflect'
    view: string = 'StudyView'
    width = major.third
    height = major.fifth
    produces = ResourceBlock.Hypothesis
    productionTime = 2000
}

export class Refinery extends Structure {
    name = 'Refinery'
    description = 'flotate'
    consumes = ResourceBlock.Ore
    produces = ResourceBlock.Mineral
    view = 'RefineryView'
    width = major.fifth
    height = major.fifth
    productionTime = 9000
}

export class Ladder extends Structure {
    name = 'Ladder'
    description = 'connect vertically'
    view = 'LadderView'
    width = minor.third
    height = major.third
}

//export class Workshop extends Structure {
//    name: string = 'Workshop'
//    description: string = 'manual'
//    view: string = 'WorkshopView'
//    width: number = 120 * sizeFactor
//    height: number = 80 * sizeFactor
//}
//
//export class Factory extends Structure {
//    name: string = 'Factory'
//    description: string = 'assembly'
//    view: string = 'FactoryView'
//}

// lab, mine, warehouse/storage, kitchen, workshop, factory

// huge octagonal generating station with four 'slots'
// for sub-structures (add-ons) which auto-generate data/ore
// for the central 'power' slot ...
// ...you can build either...
// ...a mini black hole or mini sun
// (the sun takes ore and the hole takes data?)
export class PowerPlant extends Structure {
    name: string = 'Power Plant'
    description: string = 'sunny day'
    view: string = 'PowerPlantView'
    width: number = 2 * major.eighth //30 * majorUnit
    height: number = 2 * major.eighth // 30 * majorUnit
}