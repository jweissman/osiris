import { Vector } from "excalibur";
import { Orientation } from "./Orientation";
import { Building } from "../actors/Building";

export type Slot = {
    pos: Vector;
    // size: number;
    facing: Orientation;

    // slot could have a parent, buildings could remember their slot, we could build a tree
    // parent: Building; // the building which 'has' the slot

    // parentNode: Vector;
};