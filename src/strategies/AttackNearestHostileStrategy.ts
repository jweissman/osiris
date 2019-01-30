import { CombatStrategy } from "./CombatStrategy";
import { minBy, closest, sleep } from "../Util";
import { Citizen } from "../actors/Citizen";

export class AttackNearestHostileStrategy extends CombatStrategy {
    vigilanceRange: number = 2000

    protected async apply() {
        if (!this.pawn.engagedInCombat) {
            let target = closest(this.pawn.pos, this.hostiles.filter(h => h.alive), (h) => h.pos)
            if (target) {
                this.pawn.log("found new target")
                this.pawn.engageHostile(target)
            } else {
                this.pawn.log("no new targets?")
            }
        } else {
            let enemy = this.pawn.enemyCombatant
            let dy = Math.abs(this.pawn.pos.y - enemy.y)
            if (dy > 40) {
                await this.seek(enemy)
            } else if (this.pawn.withinFiringRange()) {
                await this.attack()
            } else {
                await this.pawn.advanceTowardsEnemy()
            }
        }
    }

    private async seek(enemy: Citizen) {
        const path = this.planet.pathBetweenPoints(this.pawn.pos.clone(), enemy.pos.clone());
        if (path[1]) {
            await this.pawn.glideTo(path[1]);
        }
        let dy = Math.abs(this.pawn.pos.y - enemy.y)
        if (dy > 40 && path[2]) {
            await this.pawn.glideTo(path[2]);
        }
    }

    async attack() {
        this.pawn.y = this.pawn.enemyCombatant.y
        if (!(this.pawn.guarding || this.pawn.firing)) {
            await sleep(Math.random() * 150)
            if (this.pawn.isEvil || Math.random() > 0.5 || (this.pawn.health > 90)) {
                await this.pawn.fire()
            } else {
                await this.pawn.guard()
            }
        }
    }

    canApply(): boolean {
        return this.hostiles.some(hostile =>
            this.pawn.pos.distance(hostile.pos) < this.vigilanceRange)
    }

    get hostiles() {
        return this.pawn.isEvil
            ? this.planet.population.citizens
            : this.planet.population.raiders
    }
}