import { CorridorView } from ".";

export class SurfaceRoadView extends CorridorView {
    edgeWidth: 0
    colorBase() { return this.color.lighten(0.1); }

}