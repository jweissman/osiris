import { CombatStrategy } from "./CombatStrategy";
import { minBy, closest, sleep } from "../Util";
import { Citizen } from "../actors/Citizen";
import { CommandCenter } from "../models/Machine";

export class AttackNearestHostileStrategy extends CombatStrategy {
    vigilanceRange: number = 2000

        // ideas -- if not on surface, get to surface?
        // if evil, advance towards mission control, fight anything in the way
        // if not, get to surface/ctrl and fight anything
    protected async apply() {
        let target = closest(
            this.pawn.pos,
            this.hostiles.filter(h => h.alive && !h.isDriving),
            (h) => h.pos
        )
        if (target) {
            // this.pawn.log("found new target")
            this.pawn.engageHostile(target)
        } else {
            this.pawn.log("no new targets?")
        }

        let enemy = this.pawn.enemyCombatant
        let dy = Math.abs(this.pawn.pos.y - enemy.y)
        if (dy > 40) {
            this.pawn.log("head to mission ctrl...")
            if (this.pawn.isEvil) {
                this.pawn.log("to attack it!")
                await this.pawn.advanceTowards(this.planet.colony.origin)
            } else {
                this.pawn.log("to defend it!")
                let cmdCenter = this.planet.colony.findAllDevices().find(device => device.machine instanceof CommandCenter)
                await this.pawn.visit(cmdCenter)
            }
        } else { 
            if (this.pawn.withinFiringRange()) {
                await this.attack()
            } else {
                await this.pawn.advanceTowardsEnemy()
            }
        }
    }


    async attack() {
        this.pawn.y = this.pawn.enemyCombatant.y
        if (!(this.pawn.guarding || this.pawn.firing)) {
            if (this.pawn.isEvil || this.pawn.health > 95) {
                await this.pawn.fire()
            } else {
                if ((this.pawn.health < 50 && Math.random() < 0.05) || Math.random() < 0.01) {
                    await this.pawn.guard()
                } else {
                    await this.pawn.fire()
                }
            }
        }
    }

    canApply(): boolean {
        let defensePoint = this.planet.colony.origin ? this.planet.colony.origin : this.pawn.pos
        let timeToPlay = this.hostiles.some(hostile => hostile.alive &&
            (this.pawn.isEvil ? true : defensePoint.distance(hostile.pos) < this.vigilanceRange) 
            && !hostile.isDriving
        )
        return timeToPlay

    }

    get hostiles() {
        return this.pawn.isEvil
            ? this.planet.population.citizens
            : this.planet.population.raiders
    }
}