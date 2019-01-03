import { Machine } from "../models/Machine";
import { Structure } from "../models/Structure";
import { SpaceFunction } from "../models/SpaceFunction";

export type Entity = Machine | Structure | SpaceFunction
// type EntityKind<T> = typeof T

export type EntityKind = (typeof Machine | typeof Structure | typeof SpaceFunction)
