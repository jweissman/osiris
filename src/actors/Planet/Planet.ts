import * as ex from 'excalibur';
import { Actor, Color, Vector, Util, EdgeArea } from 'excalibur';
import { Building } from '../Building';
import { range } from '../../Util';
import { Mountains } from './PlanetBackground';
import { Structure } from '../../models/Structure';
import { Hud } from '../Hud/Hud';
import { ResourceBlock, Economy, sumMarkets, emptyMarket, availableCapacity, PureValue } from '../../models/Economy';
import { Colony } from './Colony';
import { Population } from './Population';
import { Machine, CloningVat } from '../../models/Machine';
import { Device } from '../Device';


export class Planet extends Actor {
    colony: Colony
    population: Population

    constructor(
        public hud: Hud,
        public color: Color,
        private onBuildingHover: (b: Building) => any,
        private w: number = 2000000,
        private depth: number = 10000000,
        ) {
        super(0, depth/2, w, depth, color)
        this.traits = this.traits.filter(trait => !(trait instanceof ex.Traits.OffscreenCulling))

        let yBase = -depth/2
        let crustHeight = 20
        this.createLayer(yBase, crustHeight, this.color.lighten(0.25))


        let layerCount = 10
        let layerHeight = depth / layerCount 
        for (let i of range(layerCount)) {
            this.createLayer(
                yBase + crustHeight + (layerHeight/2) + (layerHeight * (i+1)),
                layerHeight,
                this.color.darken(0.05 + 0.01 * i)
            )
        }

        this.add(new Mountains(-depth/2, this.getWidth(), this.color.lighten(0.15)))

        this.colony = new Colony(0,-depth/2) //yBase)
        this.add(this.colony)

        this.population = new Population(this)
        this.add(this.population)
    }

    set currentlyViewing(building: Building) {
        this.onBuildingHover(building)
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
        let devices = this.colony.findAllDevices()
        let economies = devices.map((d: Device) => d.machine.economy)
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

    placeBuilding(building: Building) {
        this.colony.placeBuilding(building)
    }

    populate(pos: Vector) {
        if (this.population.citizens.length < this.maxPop) {
            let home = this.closestDevice(pos, [CloningVat])
            this.population.increase(home)
        }
    }

    get maxPop() {
        let devices = this.colony.findAllDevices()
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
}