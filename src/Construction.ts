import { Input, Vector, LockCameraToActorStrategy, Color, Engine, UIActor } from "excalibur";
import { Building, structureViews } from "./actors/Building";
import { DevicePlace } from "./actors/Building/Building";
import { Device } from "./actors/Device";
import { Hud } from "./actors/Hud/Hud";
import { Planet } from "./actors/Planet/Planet";
import { Machine, allMachines } from "./models/Machine";
import { LivingQuarters, MissionControl, SolarArray, RoomRecipe } from "./models/RoomRecipe";
import { Corridor, HugeRoom, LargeRoom, MainTunnel, MediumRoomThree, SmallDome, SmallRoomThree, Structure, SurfaceRoad } from "./models/Structure";
import { flatSingle, zip, sample } from "./Util";
import { DeviceSize } from "./values/DeviceSize";
import { TechnologyRank } from "./models/TechnologyRank";
import { TechTree } from "./models/TechTree";
import { Citizen } from "./actors/Citizen";
import { GameController } from "./GameController";
// handle ui for construction (also includes following stuff?)
export class Construction extends UIActor {
    private restricted: boolean = true
    // private restrictAvailbleStructures: boolean = true

    static requiredStructuresAndFunctions: (typeof RoomRecipe | typeof Structure)[] = [
        MissionControl,
        SurfaceRoad,
        SolarArray,
        MainTunnel,
        Corridor,
        LivingQuarters,
    ];
    private lost: boolean = true;
    private techTree: TechTree = new TechTree();
    // private player: Player
    private followedCitizen: Citizen = null;
    private hasActiveModal: boolean = false;
    private defaultMessage: string = 'Welcome to the Colony, Commander.';
    // i.e. have we placed the first building yet
    firstBuilding: boolean = true;
    placingFunction: RoomRecipe = null;
    // currentlyConstructing: Building | Device = null;
    private hud: Hud;
    constructor(private planet: Planet, private engine: Engine, private introMessage: string) {
        super(0, 0, 0, 0);
        // }
        // onInitialize(engine: Engine) {
        // this.player = new Player()
        let buildIt = (e) => this.startConstructing(e);
        let followIt = (c) => this.toggleFollowing(c);
        this.hud = new Hud(this.engine, buildIt, buildIt, buildIt, followIt);
        this.planet.wireHud(this.hud);
    }

    standup(ctrl: GameController) {
        // this.add(this.player)
        this.add(this.hud);
        this.hud.show();
        if (this.lost) {
            this.welcome();
        }
        this.controlWith(ctrl)
    }

    teardown() {
        // this.remove(this.player)
        this.remove(this.hud);
        this.hud.hide();
        this.closeSystemMessage();
        this.stopFollowing();
    }

    update(engine, delta) {
        let devices = this.planet.colony.findPoweredDevices();
        let machines = allMachines.filter(machine => devices.some(device => device.machine instanceof machine));
        let discipline = this.techTree.findDisciplineToRankUp(machines);
        if (discipline) {
            let rank = this.techTree.rankUp(discipline);
            this.rankUp(rank);
        }
        // hmm!
        this.hud.updateDetails(this.planet, this.techTree, this.followedCitizen, true, 0); //, this.scene.currentTime)
        if (!this.lost && !this.firstBuilding && this.planet.population.citizens.length === 0) {
            this.lost = true;
            // alert('colony lost!')
            this.askYesNo('The colony has perished! Try again?', () => this.welcome(), () => engine.goToScene('menu'));
        }
    }

    get camera() { return this.engine.currentScene.camera; }
    controlWith(controller: GameController) {
        controller.onCameraPan(() => this.stopFollowing());
        controller.onMove((pos: Vector) => {
            if (this.hasActiveModal) {
                return;
            }
            // this.player.pos = pos
            let currentlyBuilding = this.planet.currentlyConstructing;
            if (currentlyBuilding instanceof Building) {
                let constrained = currentlyBuilding.constrainCursor(pos); //this.player.pos)
                // this.player.pos = constrained
                currentlyBuilding.reshape(constrained); //this.player.pos)
            }
            else if (currentlyBuilding instanceof Device) {
                currentlyBuilding.snap(this.planet, pos); //this.player.pos)
            }
        });
        controller.onLeftClick((pos: Vector, shift: boolean) => {
            if (this.hasActiveModal) {
                return;
            }
            const currentlyBuilding = this.planet.currentlyConstructing;
            if (currentlyBuilding) {
                if (currentlyBuilding instanceof Building) {
                    let buildingUnderConstruction = currentlyBuilding;
                    let placementValid = !buildingUnderConstruction.overlapsAny();
                    if (buildingUnderConstruction && placementValid && buildingUnderConstruction.handleClick(pos)) {
                        this.planet.placeBuilding(buildingUnderConstruction);
                        // if (this.firstBuilding) {
                            // this.planet.sendRaidingParty();
                        // }
                        if (this.placingFunction) {
                            let fn = this.placingFunction;
                            zip(fn.machines, buildingUnderConstruction.devicePlaces()).forEach(([machine, place]: [typeof Machine, DevicePlace]) => {
                                let m = (new machine()).concretize();
                                let device = new Device(m, place.position);
                                buildingUnderConstruction.addDevice(device);
                            });
                            this.placingFunction = null;
                        }
                        this.hud.setStatus(this.defaultMessage);
                        this.planet.colony.currentlyConstructing = null;
                        this.prepareNextBuilding(pos);
                    }
                }
                else {
                    let deviceUnderConstruction = currentlyBuilding;
                    let placementValid = (deviceUnderConstruction.size === DeviceSize.Tiny) ||
                        !deviceUnderConstruction.overlapsAny();
                    let snapped = deviceUnderConstruction.snap(this.planet);
                    if (snapped && placementValid) {
                        if (deviceUnderConstruction.size === DeviceSize.Tiny) {
                            let parent = deviceUnderConstruction.parentDevice;
                            parent.addTinyDevice(deviceUnderConstruction);
                        }
                        else {
                            let bldg = deviceUnderConstruction.building;
                            bldg.addDevice(deviceUnderConstruction);
                        }
                        this.planet.colony.currentlyConstructing = null;
                        this.hud.setStatus(this.defaultMessage);
                        if (shift) {
                            this.startConstructing(deviceUnderConstruction.machine);
                        }
                    }
                }
            }
        });
        controller.onKeyPress((key) => {
            if (this.hasActiveModal) {
                return;
            }
            if (key === Input.Keys.H) {
                if (this.buildings && this.buildings[0]) {
                    this.stopFollowing();
                    this.camera.move(this.buildings[0].pos, 500);
                    this.camera.zoom(0.5, 1000);
                }
            }
            else if (key === Input.Keys.Esc) {
                this.planet.colony.currentlyConstructing = null;
                this.placingFunction = null;
                this.stopFollowing(true);
                this.hud.setStatus(this.defaultMessage);
            }
        });
    }

    restrictionsOff() {
        this.restricted = false
        this.hud.restrictionsOff()
        // this.restrictAvailableMachines = false
        // this.restrictAvailableStructures = false
    }

    get buildings() { return this.planet.colony.buildings; }
    welcome() {
        console.debug("WELCOME TO THE COLONY");
        this.planet.buildColonyAndPopulation();
        this.lost = false;
        this.firstBuilding = true;
        this.infoMessage(this.introMessage, () => this.prepareNextBuilding());
        this.camera.zoom(0.25);
    }
    cameraStrategy: LockCameraToActorStrategy;
    startFollowing(citizen) {
        this.stopFollowing();
        this.cameraStrategy = new LockCameraToActorStrategy(citizen);
        this.camera.zoom(1.2, 1000);
        this.camera.addStrategy(this.cameraStrategy);
        this.followedCitizen = citizen;
    }
    stopFollowing(resetZoom = false) {
        if (this.cameraStrategy) {
            this.camera.removeStrategy(this.cameraStrategy);
            if (resetZoom) {
                this.camera.zoom(0.5, 1000);
            }
            this.followedCitizen = null;
        }
    }
    startConstructing(structureOrMachine: Structure | Machine | RoomRecipe, pos: Vector = new Vector(0, 0)) {
        this.hud.showCard(structureOrMachine);
        let theNextOne = null;
        if (structureOrMachine instanceof Structure) {
            let structure = structureOrMachine;
            this.hud.setStatus(`Place ${structure.name} (${structure.description})`);
            theNextOne = this.spawnBuilding(structure, pos);
            if (this.firstBuilding) {
                this.camera.zoom(structure.zoom, 250);
                this.camera.pos = theNextOne.pos;
                this.firstBuilding = false;
            }
        }
        else if (structureOrMachine instanceof Machine) {
            let machine = structureOrMachine;
            this.hud.setStatus(`Install ${machine.name} (${machine.description})`);
            theNextOne = this.spawnDevice(machine, pos);
            // this.camera.zoom(1.5, 250)
        }
        else if (structureOrMachine instanceof RoomRecipe) {
            let fn: RoomRecipe = structureOrMachine;
            this.hud.setStatus(`Place ${fn.name} (${fn.description})`);
            theNextOne = this.spawnFunction(fn, pos);
            this.placingFunction = fn;
        }
        this.planet.colony.currentlyConstructing = null;
        if (theNextOne) {
            this.planet.colony.currentlyConstructing = theNextOne;
            // this.camera.pos = theNextOne.pos
        }
    }
    protected spawnDevice(machine: Machine, pos: Vector): Device {
        let device = new Device(machine, pos);
        if (device.snap(this.planet)) {
            this.camera.pos = device.pos;
        }
        return device;
    }
    private spawnBuilding(structure: Structure, pos: Vector): Building {
        let anotherBuilding = this.assembleBuildingFromStructure(structure, pos);
        anotherBuilding.reshape(anotherBuilding.constrainCursor(pos));
        return anotherBuilding;
    }
    private assembleBuildingFromStructure(structure: Structure, pos: Vector): Building {
        let View = structureViews[structure.view];
        let building = new View(pos, structure, this.planet);
        return building;
    }
    private spawnFunction(fn: RoomRecipe, pos: Vector): Building {
        let theStructure: Structure = (fn.structure && new fn.structure()); // || new SmallRoomThree()
        if (!theStructure) {
            theStructure = new SmallRoomThree();
            let machines = fn.machines.map(m => new m());
            if (machines.some(m => m.size === DeviceSize.Medium)) {
                theStructure = new MediumRoomThree();
            }
            if (machines.some(m => m.size === DeviceSize.Large)) {
                theStructure = new LargeRoom();
            }
            if (machines.some(m => m.size === DeviceSize.Huge)) {
                theStructure = new HugeRoom();
            }
            if (machines.some(m => m.forDome)) {
                theStructure = new SmallDome();
            }
        }
        // console.log("SPAWN FUNCTION", { fn, structure: theStructure })
        let building = this.assembleBuildingFromStructure(theStructure, pos);
        building.reshape(building.constrainCursor(building.pos));
        return building;
    }
    private nextMissingStructureOrFunction(): Structure | RoomRecipe {
        let reqs = Construction.requiredStructuresAndFunctions.map(req => new req());
        let actualStructureNames = this.buildings.map(building => building.structure.name);
        let actualFunctionNames = flatSingle(this.buildings.map(building => building.spaceFunction && building.spaceFunction.name));
        let actualNames = [...actualStructureNames, ...actualFunctionNames];
        return reqs.find(req => !actualNames.includes(req.name));
    }
    protected prepareNextBuilding(pos: Vector = new Vector(0, 0)) {
        let structure = null;
        let nextMissing = this.nextMissingStructureOrFunction();
        if (nextMissing) {
            structure = nextMissing;
        }
        if (structure) {
            let congrats = sample(['Alright!', 'Perfect.', 'Great work!', 'Excellent!', 'Good.', 'That works.', 'Cool.', 'Fantastic!', 'Now we are cooking.', 'It looks good!']);
            let nextUp = sample(["Let's pick a location for a", 'Next we will build a', 'Okay, time to make a', 'Get ready to place a']);
            this.tutorialMessage(`${congrats} ${nextUp} ${structure.name}...`);
            this.startConstructing(structure, pos);
        }
        else {
            this.hud.showPalettes();
        }
    }
    toggleFollowing(citizen) {
        if (this.followedCitizen === citizen) {
            this.stopFollowing(true);
        }
        else {
            this.startFollowing(citizen);
        }
    }
    showTutorial: boolean = true;
    private infoMessage(message: string, onComplete: () => any = null) {
        this.hasActiveModal = true;
        this.hud.systemMessage(message, "", {
            continue: () => {
                this.closeSystemMessage(); if (onComplete) {
                    onComplete();
                }
            },
        });
    }
    private askYesNo(message: string, onYes: () => any, onNo: () => any) {
        this.hasActiveModal = true;
        this.hud.systemMessage(message, "", {
            yes: () => {
                this.closeSystemMessage(); if (onYes) {
                    onYes();
                }
            },
            no: () => {
                this.closeSystemMessage(); if (onNo) {
                    onNo();
                }
            },
        });
    }
    private tutorialMessage(message: string) {
        if (this.showTutorial) {
            this.hasActiveModal = true;
            this.hud.systemMessage(message, "", {
                continue: () => { this.closeSystemMessage(); },
                'i got this': () => {
                    this.closeSystemMessage();
                    this.showTutorial = false;
                }
            });
        }
    }
    private rankUp(rank: TechnologyRank) {
        if (this.lost || !this.restricted) {
            return;
        }
        if (this.hasActiveModal) {
            this.closeSystemMessage();
        }
        this.hasActiveModal = true;
        let rankUpMessage = "Your colony's mastery of a discipline has improved! " +
            "The following new machines are now available for construction:";
        let okay = sample(['excellent!', 'great!', 'perfect', 'good work', 'cool', 'wonderful', 'brilliant', 'that is what i am talking about', 'keep up the good work', 'learning is fun!']);
        let modal = this.hud.systemMessage(rankUpMessage, "rank up", {
            [okay]: () => { this.closeSystemMessage(); }
        });
        modal.addHeading(rank.name, 28, Color.Orange);
        modal.addHeading(rank.description, 12);
        modal.addIconMatrix(rank.unlocks.map(m => new m()).map(machine => {
            return {
                image: machine.image,
                label: machine.name
            };
        }));
    }
    private closeSystemMessage() {
        this.hud.closeSystemMessage();
        this.hasActiveModal = false;
    }
}
