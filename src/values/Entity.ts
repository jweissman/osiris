import { Machine } from "../models/Machine";
import { Structure } from "../models/Structure";
import { SpaceFunction } from "../models/SpaceFunction";

export type Entity = Machine | Structure | SpaceFunction

export type EntityKind = (typeof Machine | typeof Structure | typeof SpaceFunction)
