import * as ex from 'excalibur';
import { Actor, Color, Vector, Scene } from 'excalibur';
import { Building } from '../Building';
import { range, flatSingle, mixColors, sample, closest, sleep } from '../../Util';
import { Structure } from '../../models/Structure';
import { Hud } from '../Hud/Hud';
import { ResourceBlock, Economy, sumMarkets, emptyMarket, availableCapacity, PureValue } from '../../models/Economy';
import { Colony } from './Colony';
import { Population } from './Population';
import { Machine } from '../../models/Machine';
import { Device } from '../Device';
import { MechanicalOperation } from '../../models/MechanicalOperation';
import { World } from '../../models/World';
import { SkyLayers } from './SkyLayers';
import { Citizen } from '../Citizen';
import { Game } from '../../Game';

export class Planet extends Actor {
    colony: Colony
    population: Population
    hostiles: Citizen[] = []

    baseSkyColor: Color
    sky: Actor
    skyLayers: SkyLayers

    constructor(
        public scene: Scene,
        private w: number = 60000,
        private depth: number = 30000,
    ) {
        super(0, depth / 2, w, depth, World.pickColor())
        this.traits = this.traits.filter(trait => !(trait instanceof ex.Traits.OffscreenCulling))

        this.baseSkyColor = World.pickSkyColor()
        this.sky = new Actor(0, -depth, w, depth, this.baseSkyColor) //World.pickSkyColor())
        this.add(this.sky)

        let yBase = -depth / 2
        let crustHeight = Game.mansheight * 4
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
           this.baseSkyColor.lighten(0.15),
        //    3
        )
        this.add(this.skyLayers)

        // this.depth = depth
        this.buildColonyAndPopulation()
    }

    private hud: Hud
    wireHud(hud: Hud) { this.hud = hud}

    teardown() {
        if (this.colony) {
            this.colony.tearDown()
            // this.colony.kill()
            this.remove(this.colony)
        }

        if (this.population) {
            this.population.tearDown()
            // this.population.kill()
            this.remove(this.population)
        }
    }

    // depth: number
    buildColonyAndPopulation() {
        this.teardown()
        

        this.colony = new Colony(0, -this.depth / 2)
        this.add(this.colony)

        

        // console.log("in planet, scene is: ", { scene: this.scene })
        this.population = new Population(this, this.scene)
        this.add(this.population)

    }


    private currentTime: number
    private currentHour: number
    get hour() { return this.currentHour }
    get time() { return this.currentTime }

    setTime(time: number) {
        this.currentTime = time
        this.currentHour = (Math.floor(time / 60)) % 24

        let nextHour = this.hour + 1

        let minute = Math.floor(time % 60)
        let inc = (minute / 60)
        // console.log({ hour: this.hour, nextHour: nextHour, minute, inc })

        let oldC = this.skyColorForHour(this.hour),
            newC = this.skyColorForHour(nextHour)
        let mixC = mixColors(newC, oldC, inc)
        this.assignColors(mixC)
    }

    private assignColors(skyColor: Color) {
        this.sky.color = skyColor
        // let inc = 0.02
        let c = //mixColors(
            this.sky.color.lighten(0.05) //.lighten(5 * inc) //,
            // this.color.darken(5 * inc),
            // 0.7
        // )
        this.skyLayers.setHi(c)
    }

    skyColorForHour(hour: number) {
        let c = this.baseSkyColor.clone()
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

    //set hour(hour: number) {
    //    this.currentHour = hour
    //}

    set currentlyViewing(buildingOrDevice: Building | Device) {
        if (buildingOrDevice instanceof Building) {
            let b: Building = buildingOrDevice
            if (this.hud) {
                this.hud.showCard(b)
            }
        } else if (buildingOrDevice instanceof Device) {
            let d: Device = buildingOrDevice
            if (this.hud) {
                this.hud.showCard(d)
            }
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
        if (this.hud) {
            this.hud.resourceGathered(resource)
        }
    }

    spend(resource: ResourceBlock): any {
        if (this.hud) {
            this.hud.resourceExpended(resource)
        }
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

    threatLevel: number = 0
    async sendRaidingParty() {
        if (this.threatLevel === 0) {
            await sleep(10000) // wait for game to bootstrap (the first time)...
        }
        if (this.population && this.population.citizens && this.population.citizens.length > 0) {
            this.threatLevel += 1
            let maxPartySize = 1 + Math.floor(this.threatLevel / 3)
            let partySize = 1 + sample(range(maxPartySize))
            for (let times in range(partySize)) {
                this.sendRaider()
            }
            console.warn(`Sent ${partySize} raiders!`)
        }
    }

    private async sendRaider() {
        let evil = true
        let elite = Math.random() < 0.03
        let large = this.threatLevel > 3 ? Math.random() < 0.1 : Math.random() < 0.03
        let options = { evil, elite, large }

        let origin = this.colony.origin.clone()
        origin.y = this.getTop() + 5
        let xOff = Math.random() * 50
        let raider =
            new Citizen('Raider', origin.add(new Vector(5000 + xOff, 0)), this, options)

        this.population.raiders.push(
            raider
        )

        this.scene.add(raider)
        let target = closest(raider.pos, this.population.citizens, (c) => c.pos)
        raider.engageHostile(target) //sample(this.population.citizens))
    }
}