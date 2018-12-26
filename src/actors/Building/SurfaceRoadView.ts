import { CorridorView } from ".";
import { MissionControl, Dome, Arcology } from "../../models/Structure";

export class SurfaceRoadView extends CorridorView {
    edgeWidth: 0
    // pickingOrigin: boolean = true
    validConnectingStructures() {
        return [ MissionControl, Dome, Arcology ];
    }
}