import * as ex from 'excalibur';
import { Actor, Color, Vector, Scene } from 'excalibur';
import { Building } from '../Building';
import { range, flatSingle, mixColors, sample, closest } from '../../Util';
import { Structure } from '../../models/Structure';
import { Hud } from '../Hud/Hud';
import { ResourceBlock, Economy, sumMarkets, emptyMarket, availableCapacity, PureValue } from '../../models/Economy';
import { Colony } from './Colony';
import { Population } from './Population';
import { Machine } from '../../models/Machine';
import { Device } from '../Device';
import { MechanicalOperation } from '../../models/MechanicalOperation';
import { World } from '../../models/World';
import { Colorize } from 'excalibur/dist/Drawing/SpriteEffects';
import { SkyLayers } from './SkyLayers';
import { Citizen } from '../Citizen';

export class Planet extends Actor {
    colony: Colony
    population: Population
    hostiles: Citizen[] = []
    // baseColor: Color
    sky: Actor
    skyLayers: SkyLayers

    constructor(
        public world: World,
        public hud: Hud,
        // public color: Color,
        private onBuildingHover: (b: Building) => any,
        private onDeviceHover: (d: Device) => any,
        private w: number = 200000,
        private depth: number = 40000,
        public scene: Scene
    ) {
        super(0, depth / 2, w, depth, world.color)
        this.traits = this.traits.filter(trait => !(trait instanceof ex.Traits.OffscreenCulling))

        this.sky = new Actor(0, -depth, w, depth, world.skyColor)
        this.add(this.sky)

        let yBase = -depth / 2
        let crustHeight = 40
        this.createLayer(yBase, crustHeight, this.color.lighten(0.45))


        let layerCount = 10
        let layerHeight = depth / layerCount
        for (let i of range(layerCount)) {
            this.createLayer(
                yBase + crustHeight + (layerHeight / 2) + (layerHeight * (i + 1)),
                layerHeight,
                this.color.darken(0.05 + 0.01 * i)
            )
        }
        let c = this.color.clone()

        this.skyLayers =new SkyLayers(
           -depth/2, // - 20,
           this.getWidth(),
           this.color.lighten(0.04),
           world.skyColor,
           6
        )
        this.add(this.skyLayers)

        this.colony = new Colony(0, -depth / 2)
        this.add(this.colony)

        console.log("in planet, scene is: ", { scene: this.scene })
        this.population = new Population(this, scene)
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

        // this.sky.color = mixC // skyColor
        this.assignColors(mixC)
    }

    private assignColors(skyColor: Color) {
        this.sky.color = skyColor

        let inc = 0.08

        let c = mixColors(
            this.sky.color.lighten(5 * inc), //.lighten(3*inc).saturate(5*inc),
            this.color.darken(5 * inc), //.lighten(2*inc)
            0.7
        )

        this.skyLayers.setHi(c)

        // this.skyLayer.mountainLayers.color = this.color.lighten(inc) //0.1)
        // this.skyLayer.mountainLayers.skyColor = c.lighten(inc)
        // this.skyLayer.mountains.color = c.lighten(inc)
        // this.skyLayer.backMountainLayers.color = c.lighten(inc)
        // this.skyLayer.backMountainLayers.skyColor = c.lighten(inc * 3).desaturate(inc)
    }

    skyColorForHour(hour: number) {
        let c = this.world.skyColor.clone().darken(0.2).desaturate(0.1)

        let colorMap = {
            night: c.darken(0.7),
            dawn: c.darken(0.2),
            morning: c.lighten(0.1),
            afternoon: c.lighten(0.2).desaturate(0.1),
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

        let values = [PureValue.Shelter, PureValue.Water, PureValue.Oxygen]
        return Math.max(0, Math.min(
            ...values.map(val => availableCapacity(theEconomyWithoutPeople, val))
        ))
    }

    closestBuildingByType(cursor: Vector, structureTypes: (typeof Structure)[], predicate: (Building) => boolean = () => true): Building {
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

    hasMachineKind(kind: typeof Machine) {
        return this.colony.findPoweredDevices().find(d => d.machine instanceof kind);
    }

    sendRaidingParty() {
        let partySize =1+sample(range(3))
        for (let times in range(partySize)) {
            this.sendRaider()
        }
        console.warn(`Sent ${partySize} raiders!`)
    }

    private async sendRaider() {
        let origin = this.colony.origin.clone()
        origin.y = this.getTop() + 5
        let xOff = Math.random() * 50
        let raider = 
            new Citizen('Raider', origin.add(new Vector(3000 + xOff,0)), this, false, true)

        this.population.raiders.push(
            raider
        )

        this.scene.add(raider)
        await raider.glideTo(origin) //.add(new Vector(2400,0))) //.add(new Vector(300,0)))
        // this.population.citizens.forEach(c => c.engageHostile(raider))
        // let target = closest(raider.pos, this.population.citizens, (c) => c.pos)
        // raider.engageHostile(target) //sample(this.population.citizens))
    }
}