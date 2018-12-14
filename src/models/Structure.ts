import { Vector } from 'excalibur';

export class Structure {
    name: string = '(default structure name)';
    description: string = '(default structure description)';
    view: string = '<add a default structure (room) view>';
    width: number = 10;
    height: number = 10;
    zoom: number = 2 //.25
    constructor(public origin: Vector = new Vector(0, 0)) { }
}

export class MissionControl extends Structure {
    name: string = 'Mission Control';
    description: string = 'Keeping everything on track';
    view: string = 'MissionControlView';
    width: number = 90;
    height: number = 24;
    zoom = 0.5
}

export class MainTunnel extends Structure {
    name: string = 'Main Tunnel';
    description: string = 'Elevating';
    view: string = 'TunnelView';
    width: number = 30;
    height: number = 100;
    zoom = 0.25
}

export class Dome extends Structure {
    name: string = 'Biodome';
    description: string = 'Biome sweet biome';
    view: string = 'DomeView';
    width: number = 60;
    height: number = 50;
    zoom = 0.2
}

export class AccessTunnel extends Structure {
    name: string = 'Access Tunnel'
    description: string = 'in the hallway'
    view: string = 'AccessTunnelView'
    width: number = 10
    height: number = 9
}

export class CommonArea extends Structure {
    name: string = 'Common Area'
    description: string = 'hallway cap'
    view: string = 'CommonAreaView'
    width: number = 120
    height: number = 70
}

export class LivingQuarters extends Structure {
    name: string = 'Living Quarters'
    description: string = 'sleepy time'
    view: string = 'LivingQuartersView'
    width: number = 80
    height: number = 60
}

export class SurfaceRoad extends Structure {
    name: string = 'Surface Road'
    description: string = 'go for a walk'
    view: string = 'SurfaceRoadView'
    width: number = 20
    height: number = 8
}