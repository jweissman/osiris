import { Machine } from "../models/Machine";
import { Structure } from "../models/Structure";
import { RoomRecipe } from "../models/RoomRecipe";

export type Entity = Machine | Structure | RoomRecipe

export type EntityKind = (typeof Machine | typeof Structure | typeof RoomRecipe)
