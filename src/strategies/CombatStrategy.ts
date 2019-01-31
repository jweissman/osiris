import { Strategy } from "./Strategy";

export abstract class CombatStrategy extends Strategy {
    describe() { return 'fighting' }
}