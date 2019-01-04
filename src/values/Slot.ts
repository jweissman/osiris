import { Vector } from "excalibur";
import { Orientation } from "./Orientation";
import { Building } from "../actors/Building";

export type Slot = {
    pos: Vector;
    facing: Orientation;
    parent: Building;
};