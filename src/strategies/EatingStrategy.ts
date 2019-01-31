import { Strategy } from "./Strategy";

export abstract class EatingStrategy extends Strategy {
    describe() { return 'eating' }
}