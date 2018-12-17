import { Vector } from 'excalibur';

let sizeFactor = 1

export class Structure {
    name: string = '(default structure name)';
    description: string = '(default structure description)';
    view: string = '<add a default structure (room) view>';
    width: number = 10 * sizeFactor
    height: number = 10 * sizeFactor
    zoom: number = 1 // 0.1 //.25
    constructor(public origin: Vector = new Vector(0, 0)) { }
}

export class MissionControl extends Structure {
    name: string = 'Mission Control';
    description: string = 'Keeping everything on track';
    view: string = 'MissionControlView';
    width: number = 90 * sizeFactor
    height: number = 24 * sizeFactor
    zoom = 0.1
}

export class MainTunnel extends Structure {
    name: string = 'Main Tunnel';
    description: string = 'Elevating';
    view: string = 'TunnelView';
    width: number = 30 * sizeFactor
    height: number = 100 * sizeFactor
    // zoom = 0.25
}

export class Dome extends Structure {
    name: string = 'Biodome';
    description: string = 'Biome sweet biome';
    view: string = 'DomeView';
    width: number = 90 * sizeFactor
    height: number = 60 * sizeFactor
    // zoom = 0.2
}

export class AccessTunnel extends Structure {
    name: string = 'Access Tunnel'
    description: string = 'in the hallway'
    view: string = 'AccessTunnelView'
    width: number = 10 * sizeFactor
    height: number = 15 * sizeFactor
}

export class CommonArea extends Structure {
    name: string = 'Common Area'
    description: string = 'hallway cap'
    view: string = 'CommonAreaView'
    width: number = 120 * sizeFactor
    height: number = 70 * sizeFactor

}

export class LivingQuarters extends Structure {
    name: string = 'Living Quarters'
    description: string = 'sleepy time'
    view: string = 'LivingQuartersView'
    width: number = 80 * sizeFactor
    height: number = 60 * sizeFactor
}

export class SurfaceRoad extends Structure {
    name: string = 'Surface Road'
    description: string = 'go for a walk'
    view: string = 'SurfaceRoadView'
    width: number = 20 * sizeFactor
    height: number = 8 * sizeFactor
}

export class Laboratory extends Structure {
    name: string = 'Research Lab'
    description: string = 'learn some things'
    view: string = 'LabView'
    width: number = 100 * sizeFactor
    height: number = 40 * sizeFactor
}

export class Mine extends Structure {
    name: string = 'Omnium Mine'
    description: string = 'ore else'
    view: string = 'MineView'
    width: number = 200 * sizeFactor
    height: number = 200 * sizeFactor
}

export class Kitchen extends Structure {
    name: string = 'Kitchen'
    description: string = 'veg -> meals'
    view: string = 'KitchenView'
    width: number = 240 * sizeFactor
    height: number = 100 * sizeFactor
}

export class Mess extends Structure {
    name: string = 'Mess Hall'
    description: string = 'consume meals'
    view: string = 'MessView'
    width: number = 400 * sizeFactor
    height: number = 100 * sizeFactor
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