import { Vector } from 'excalibur';
import { ResourceBlock } from './Economy';

// let sizeFactor = 0.85

let minorUnit = 8  //* sizeFactor
let majorUnit = 16 //* sizeFactor

// let megaUnit = 16 * majorUnit

export class Structure {
    name: string = '(default structure name)';
    description: string = '(default structure description)';
    view: string = '<add a default structure (room) view>';
    width: number = 10 //* sizeFactor
    height: number = 10 //* sizeFactor
    zoom: number = 1 // 0.1 //.25

    consumes: ResourceBlock = null
    produces: ResourceBlock = null

    constructor(public origin: Vector = new Vector(0, 0)) { }
}

export class MissionControl extends Structure {
    name: string = 'Mission Control';
    description: string = 'Keeping everything on track';
    view: string = 'MissionControlView';
    width: number = 10 * majorUnit
    height: number = 3 * majorUnit
    zoom = 0.1
}

export class MainTunnel extends Structure {
    name: string = 'Main Tunnel';
    description: string = 'Elevating';
    view: string = 'TunnelView';
    width: number = 2 * majorUnit
    height: number = 10 * majorUnit //150 // * sizeFactor
    zoom = 0.25
}

export class Dome extends Structure {
    name: string = 'Biodome';
    description: string = 'Biome sweet biome';
    produces = ResourceBlock.Food

    view: string = 'DomeView';
    width: number = 10 * majorUnit
    height: number = 8 * majorUnit
    zoom = 0.2
}

export class AccessTunnel extends Structure {
    name: string = 'Corridor'
    description: string = 'in the hallway'
    view: string = 'AccessTunnelView'
    width: number = 10 * minorUnit
    height: number = 3 * minorUnit
    zoom = 0.5
}

export class CommonArea extends Structure {
    name: string = 'Commons'
    description: string = 'hallway cap'
    view: string = 'CommonAreaView'
    width: number = 8 * majorUnit
    height: number = 5 * majorUnit

}

export class LivingQuarters extends Structure {
    name: string = 'Quarters'
    description: string = 'sleepy time'
    view: string = 'LivingQuartersView'
    width: number = 3 * majorUnit
    height: number = 5 * majorUnit
}

export class SurfaceRoad extends Structure {
    name: string = 'Road'
    description: string = 'go for a walk'
    view: string = 'SurfaceRoadView'
    width: number = 5 * minorUnit
    height: number = 1 * minorUnit
}

export class Laboratory extends Structure {
    name: string = 'Lab'
    description: string = 'learn some things'
    produces = ResourceBlock.Data
    view: string = 'LabView'
    width: number = 11 * majorUnit
    height: number = 5 * majorUnit
}


export class Kitchen extends Structure {
    name: string = 'Kitchen'
    description: string = 'veg -> meals'
    consumes = ResourceBlock.Food
    produces = ResourceBlock.Meal
    view: string = 'KitchenView'
    width: number = 4 * majorUnit
    height: number = 5 * majorUnit
}

export class Mess extends Structure {
    name: string = 'Mess'
    description: string = 'consume meals'
    view: string = 'MessView'
    width: number = 6 * majorUnit
    height: number = 5 * majorUnit
}

export class Mine extends Structure {
    name: string = 'Mine'
    description: string = 'ore else'
    produces = ResourceBlock.Ore
    view: string = 'MineView'
    width: number = 20 * majorUnit
    height: number = 20 * majorUnit
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