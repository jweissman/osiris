import * as ex from 'excalibur';
import { Actor, Color, Vector, Util, EdgeArea } from 'excalibur';
import { Building } from '../Building';
import { range, flatSingle, mixColors } from '../../Util';
import { Mountains, MountainLayers } from './PlanetBackground';
import { Structure } from '../../models/Structure';
import { Hud } from '../Hud/Hud';
import { ResourceBlock, Economy, sumMarkets, emptyMarket, availableCapacity, PureValue } from '../../models/Economy';
import { Colony } from './Colony';
import { Population } from './Population';
import { Machine, CloningVat } from '../../models/Machine';
import { Device } from '../Device';
import { AccelerateTime, MechanicalOperation } from '../../models/MechanicalOperation';
import { World } from '../../models/World';
import { drawRect } from '../../Painting';

// class Sky extends Actor {
//     constructor(
//         x: number,
//         y: number,
//         width: number,
//         height: number,
//         color: Color
//     ) {
//         super(x,y,width,height,color)
//     }

//     draw(ctx, delta) {
//         drawRect(
//             ctx,
//             {x: this.x, y: this.y, width: this.getWidth(), height: this.getHeight() },
//             0,
//             this.color,
//         )
//     }
// }

export class Planet extends Actor {
    mountains: Mountains
    mountainLayers: MountainLayers
    colony: Colony
    population: Population
    // baseColor: Color
    sky: Actor

    constructor(
        public world: World,
        public hud: Hud,
        // public color: Color,
        private onBuildingHover: (b: Building) => any,
        private onDeviceHover: (d: Device) => any,
        private w: number = 200000,
        private depth: number = 1000000,
        ) {
        super(0, depth/2, w, depth, world.color)
        this.traits = this.traits.filter(trait => !(trait instanceof ex.Traits.OffscreenCulling))

        // this.baseColor = world.color.clone()

        this.sky = new Actor(0,-depth,w,depth, world.skyColor) //Color.Blue)
        this.add(this.sky)

        let yBase = -depth/2
        let crustHeight = 20
        this.createLayer(yBase, crustHeight, this.color.lighten(0.45))


        let layerCount = 10
        let layerHeight = depth / layerCount 
        for (let i of range(layerCount)) {
            this.createLayer(
                yBase + crustHeight + (layerHeight/2) + (layerHeight * (i+1)),
                layerHeight,
                this.color.darken(0.05 + 0.01 * i)
            )
        }
        let c = this.color.clone()
        // c.a = 0.4
        this.mountains=(new Mountains(-depth/2, this.getWidth(), c.lighten(0.15)))
        this.add(this.mountains)

        this.mountainLayers = new MountainLayers(
                -depth / 2,
                this.getWidth(),
                this.color.lighten(0.15)
            )
            this.mountainLayers.skyColor = world.skyColor
        this.add(this.mountainLayers)
            // new MountainLayers(
            //     -depth / 2,
            //     this.getWidth(),
            //     this.color.lighten(0.15
            // )
            // ))

        this.colony = new Colony(0,-depth/2) //yBase)
        this.add(this.colony)

        this.population = new Population(this)
        this.add(this.population)

    }


    private currentHour: number
    get hour() { return this.currentHour }

    setTime(time: number) {
        this.hour = (Math.floor(time / 60)) % 24

        let nextHour = this.hour + 1

        let minute = Math.floor(time % 60)
        let inc = (minute / 60)
        // console.log({ hour: this.hour, nextHour: nextHour, minute, inc })

        let oldC = this.skyColorForHour(this.hour),
            newC = this.skyColorForHour(nextHour)

        let mixC = mixColors(newC, oldC, inc)

        this.sky.color = mixC //this.skyColorForHour(this.hour)

        this.mountainLayers.skyColor = this.sky.color //world.skyColor
        this.mountains.color = this.sky.color.lighten(0.2) //world.skyColor
    }

    skyColorForHour(hour: number) {
        let c = this.world.skyColor.clone().darken(0.2).desaturate(0.1)

        let colorMap = {
            night: c.darken(0.7),
            dawn: c.darken(0.2),
            morning: c.lighten(0.1),
            afternoon: c.lighten(0.3),
            evening: c,
        }

        let result: Color = null
        if (hour >= 5 && hour < 8) { // dawn
            let inc = (hour - 6) / 5
            result = colorMap.dawn.lighten(inc)
        } else if (hour >= 8 && hour < 12) { // morning
            let inc = (hour - 8) / 24
            result = colorMap.morning.lighten(inc)
        } else if (hour >= 12 && hour < 14) { // early afternoon
            result = colorMap.afternoon //.darken(inc)
        } else if (hour >= 14 && hour < 18) {  // late afternoon
            let inc = (hour - 14) / 16
            result = colorMap.afternoon.darken(inc)
        } else if (hour >= 18 && hour < 23) { // evening
            let inc = (hour - 18) / 10
            result = colorMap.evening.darken(inc)
        } else if (hour >= 23) { // late night
            result = colorMap.night
        } else if (hour < 5) { // early morning
            result = colorMap.night
        }
        return result
    }

    set hour(hour: number) {
        this.currentHour = hour
    }

    set currentlyViewing(buildingOrDevice: Building | Device) {
        if (buildingOrDevice instanceof Building) {
            let b: Building = buildingOrDevice
            this.onBuildingHover(b)
        } else if (buildingOrDevice instanceof Device) {
            let d: Device = buildingOrDevice
            this.onDeviceHover(d)
        }
    }

    private createLayer(y: number, size: number, color: Color) {
        let theLayer = new Actor(0, y, this.getWidth(), size, color);
        this.add(theLayer);
    }

    draw(ctx: CanvasRenderingContext2D, delta) {
        super.draw(ctx, delta)

        if (this.currentlyConstructing) {
            this.currentlyConstructing.draw(ctx, delta)
        }
    }

    get economy(): Economy {
        // let devices = this.colony.findPoweredDevices()
        // let economies = devices.map((d: Device) => d.machine.economy)

        let buildings = this.colony.buildings
        let economies = buildings.map(b => b.economy())
        let theEconomy = economies.reduce(sumMarkets, emptyMarket())

        let popularDemand = this.population.citizens.length
        theEconomy['Shelter'].demand = popularDemand
        theEconomy['Oxygen'].demand += popularDemand
        theEconomy['Water'].demand += popularDemand
        return theEconomy
    }

    update(engine, delta) {
        super.update(engine, delta)

        this.colony.buildings.forEach(building => building.update(engine, delta))
        this.population.citizens.forEach(citizen => citizen.update(engine, delta))
    }

    get currentlyConstructing() {
        return this.colony.currentlyConstructing
    }

    gather(resource: ResourceBlock): any {
        this.hud.resourceGathered(resource)
    }

    spend(resource: ResourceBlock): any {
        this.hud.resourceExpended(resource)
    }

    placeBuilding(building: Building) {
        this.colony.placeBuilding(building)
    }

    populate(pos: Vector, elite: boolean = false) {
        if (this.population.citizens.length < this.maxPop) {
            // console.log("POPULATIN'!")
            // let home = this.closestDevice(pos, [CloningVat])
            this.population.increase(pos, elite) //home)
        } else {
            console.warn("too many citizens already to populate more!")
        }
    }

    get maxPop() {
        let devices = this.colony.findPoweredDevices()
        let economies = devices.map((d: Device) => d.machine.economy)
        let theEconomyWithoutPeople = economies.reduce(sumMarkets, emptyMarket())

        let values = [ PureValue.Shelter, PureValue.Water, PureValue.Oxygen ]
        return Math.max(0, Math.min(
            ...values.map(val => availableCapacity(theEconomyWithoutPeople, val))
        ))
    }

    closestBuildingByType(cursor: Vector, structureTypes: (typeof Structure)[], predicate: (Building) => boolean = ()=>true): Building {
        return this.colony.closestBuildingByType(cursor, structureTypes, predicate)
    }

    closestDevice(cursor: Vector, machineTypes: (typeof Machine)[] = [], predicate: (Device) => boolean = () => true) {
        return this.colony.closestDeviceByType(cursor, machineTypes, predicate);
    }

    pathBetween(origin: Vector, destination: Building): Vector[] {
        return this.colony.pathBetween(origin, destination)
    }

    pathBetweenPoints(origin: Vector, destination: Vector): Vector[] {
       return this.colony.pathBetweenPoints(origin, destination)
    }

    get timeFactor() {
        let devices = this.colony.findPoweredDevices()
        let ops: MechanicalOperation[] = devices.map(d => d.operation) //.filter(op => op.type === 'accelerate')
        return ops
            .map(op => op.type === 'accelerate' ? op.factor : 1)
            .reduce((acc, val) => val * acc, 1.0)
    }

    get storedResources(): ResourceBlock[] {
        let devices = this.colony.findAllDevices()
        return flatSingle(devices.map(d => d.product))
    }
}