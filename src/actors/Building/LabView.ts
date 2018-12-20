import { CommonAreaView } from ".";
import { Color } from "excalibur";
import { Citizen } from "../Citizen";
import { ResourceBlock } from "../../models/Economy";

export class LabView extends CommonAreaView {
    produces = ResourceBlock.Data
    // productColor = Color.Blue
    productionTime = 600
}