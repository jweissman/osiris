import { Strategy } from "./Strategy";

export abstract class SleepingStrategy extends Strategy {
    describe() { return 'sleeping' }
}