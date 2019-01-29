import { CombatStrategy } from "./CombatStrategy";

export class AttackNearestHostileStrategy extends CombatStrategy {
    protected async apply() {
        if (this.pawn.distanceToHostile() > this.pawn.idealCombatRange) {
            await this.pawn.followHostile()
        } else {
            await this.pawn.fire()

        }
        // if (this.pawn.)
        // throw new Error("Method not implemented.");
    }
    
    canApply(): boolean {
        // are we engaged with hostiles?
        return this.pawn.engagedInCombat //this.pawn.currentPlanet
    }
}