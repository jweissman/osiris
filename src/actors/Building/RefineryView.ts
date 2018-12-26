import { CommonAreaView } from ".";
import { Corridor, Mine, Refinery } from "../../models/Structure";

export class RefineryView extends CommonAreaView {
    validConnectingStructures() { return [ Corridor, Mine, Refinery ]}

}