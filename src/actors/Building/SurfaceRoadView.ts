import { AccessTunnelView } from ".";
import { MissionControl, Dome } from "../../models/Structure";

export class SurfaceRoadView extends AccessTunnelView {
    edgeWidth: 0
    // pickingOrigin: boolean = true
    validConnectingStructures() {
        return [ MissionControl, Dome ];
    }
}