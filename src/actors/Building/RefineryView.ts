import { CommonAreaView } from ".";
import { AccessTunnel, Mine, Refinery } from "../../models/Structure";

export class RefineryView extends CommonAreaView {
    validConnectingStructures() { return [ AccessTunnel, Mine, Refinery ]}

}